/**
 * Webhook processing order (ADR-011 — non-negotiable):
 *   1. Verify Nomba signature → reject 401 if invalid
 *   2. Write raw payload to webhook_events (status = 'received') → return 200
 *   3. Route to handler (async, errors logged but never re-thrown)
 */

import { prisma } from '../../lib/prisma';
import { nombaClient, nombaAmountToKobo } from '../../lib/nomba';
import { logger } from '../../lib/logger';
import { paymentService } from '../payments/payment.service';

// Nomba's event-type naming is inconsistent across docs (payment_success,
// transfer.success, mandate.debit_success) — normalize separators so all
// variants compare equal.
function normalizeEventType(raw: string): string {
  return raw.toLowerCase().replace(/[._\s]+/g, '_');
}

function toNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function extractReferenceCandidates(data: Record<string, unknown> | undefined): string[] {
  if (!data) return [];
  const transaction = data.transaction as Record<string, unknown> | undefined;
  const order = data.order as Record<string, unknown> | undefined;

  const candidates = [
    toNonEmptyString(transaction?.merchantTxRef),
    toNonEmptyString(order?.orderReference),
    toNonEmptyString(data.merchantTxRef),
    toNonEmptyString(data.reference),
    toNonEmptyString(transaction?.transactionId),
    toNonEmptyString(transaction?.sessionId),
  ].filter((value): value is string => !!value);

  return [...new Set(candidates)];
}

function extractOrderReference(data: Record<string, unknown> | undefined): string | undefined {
  if (!data) return undefined;
  const transaction = data.transaction as Record<string, unknown> | undefined;
  const order = data.order as Record<string, unknown> | undefined;

  return (
    toNonEmptyString(transaction?.merchantTxRef) ??
    toNonEmptyString(order?.orderReference) ??
    toNonEmptyString(data.merchantTxRef) ??
    toNonEmptyString(data.reference)
  );
}

function extractTransactionReference(data: Record<string, unknown> | undefined): string | undefined {
  if (!data) return undefined;
  const transaction = data.transaction as Record<string, unknown> | undefined;
  return toNonEmptyString(transaction?.transactionId) ?? toNonEmptyString(transaction?.sessionId);
}

function extractAmountKobo(data: Record<string, unknown> | undefined): number | undefined {
  if (!data) return undefined;
  const transaction = data.transaction as Record<string, unknown> | undefined;
  const rawAmount =
    (data.amount as number | string | undefined) ??
    (transaction?.transactionAmount as number | string | undefined);
  return nombaAmountToKobo(rawAmount);
}

type HandlerResult = { ok: true } | { ok: false; reason: string };

export class WebhookService {
  async processNomba(rawBody: Buffer, signatureHeader: string, timestamp: string): Promise<void> {
    // The signature is computed over specific field values, not the raw bytes —
    // payload must be parsed before verification.
    const payload = JSON.parse(rawBody.toString('utf8'));

    // Step 1: Signature verification
    const valid = nombaClient.verifyWebhookSignature(payload, timestamp, signatureHeader);
    if (!valid) {
      // Defensive: the signature is hashed using payload.event_type, but Nomba's own
      // docs disagree on the field name (see the eventType fallback chain below).
      // If this ever fires in production, the logged keys tell us the real field name
      // without having to guess — do not change the hashed field without that evidence.
      logger.warn({ payloadKeys: Object.keys(payload) }, 'Webhook signature verification failed');
      throw Object.assign(new Error('Invalid webhook signature'), { statusCode: 401 });
    }

    // Docs disagree on the field name: "event_type" in one, "event" in another
    const eventType: string = payload.event_type ?? payload.event ?? payload.type ?? 'unknown';
    // requestId is Nomba's idempotency key — store it as our dedup key
    const providerEventId: string = payload.requestId ?? payload.eventId ?? payload.id ?? `${eventType}-${Date.now()}`;

    // Step 2: Write to webhook_events BEFORE processing (durability guarantee)
    let eventRecord;
    try {
      eventRecord = await prisma.webhookEvent.create({
        data: {
          provider: 'nomba',
          eventType,
          providerEventId,
          rawPayload: payload,
          signatureHeader,
          status: 'received',
        },
      });
    } catch (err: unknown) {
      // Unique constraint violation = duplicate event → idempotent no-op
      const isUniqueViolation =
        err instanceof Error && 'code' in err && (err as { code: string }).code === 'P2002';
      if (isUniqueViolation) {
        logger.info({ providerEventId }, 'Webhook: duplicate event ignored');
        return;
      }
      throw err;
    }

    // Step 3: Route to handler — errors logged, never re-thrown (200 already sent)
    this.routeEvent(eventRecord.id, eventType, payload).catch((err) => {
      logger.error({ err, eventId: eventRecord.id, eventType }, 'Webhook handler failed');
      prisma.webhookEvent.update({
        where: { id: eventRecord.id },
        data: { status: 'failed', errorMessage: err.message, processingAttempts: { increment: 1 } },
      }).catch(() => {});
    });
  }

  // H2: nothing else re-scans webhook_events rows stuck at 'failed' — a crash
  // mid-processing (or a real transient failure) would otherwise lose that
  // event's effect forever. Called on a periodic sweep from index.ts.
  // Capped at 5 attempts so payloads that will never succeed (bad data,
  // permanently missing reference) don't loop indefinitely.
  async reprocessFailed(): Promise<void> {
    const events = await prisma.webhookEvent.findMany({
      where: { status: 'failed', processingAttempts: { lt: 5 } },
      orderBy: { receivedAt: 'asc' },
      take: 50,
    });

    for (const event of events) {
      try {
        await this.routeEvent(event.id, event.eventType, event.rawPayload as Record<string, unknown>);
      } catch (err) {
        logger.error({ err, eventId: event.id, eventType: event.eventType }, 'Webhook reprocess attempt failed');
        await prisma.webhookEvent.update({
          where: { id: event.id },
          data: { status: 'failed', errorMessage: (err as Error).message },
        }).catch(() => {});
      }
    }
  }

  private async routeEvent(eventId: string, rawEventType: string, payload: Record<string, unknown>): Promise<void> {
    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: { status: 'processing', processingAttempts: { increment: 1 } },
    });

    const eventType = normalizeEventType(rawEventType);
    const data = payload.data as Record<string, unknown> | undefined;

    let result: HandlerResult = { ok: true };

    switch (eventType) {
      case 'payment_success':
      case 'checkout_order_paid':
      case 'checkout_payment_successful':
        result = await this.handlePaymentResult(eventType, data, true);
        break;
      case 'payment_failed':
      case 'checkout_payment_failed':
      case 'checkout_order_failed':
      case 'payment_reversal':
        result = await this.handlePaymentResult(eventType, data, false);
        break;
      case 'mandate_debit_success':
      case 'mandate_debit_successful':
        result = await this.handlePaymentResult(eventType, data, true);
        break;
      case 'mandate_debit_failed':
        result = await this.handlePaymentResult(eventType, data, false);
        break;
      case 'payout_success':
      case 'transfer_success':
      case 'transfer_successful':
        result = await this.handleTransferResult(data, true);
        break;
      case 'payout_failed':
      case 'transfer_failed':
        result = await this.handleTransferResult(data, false);
        break;
      case 'payout_refund':
        result = await this.handlePayoutReversal(data);
        break;
      case 'mandate_activated':
      case 'mandate_suspended':
      case 'mandate_deleted':
      case 'mandate_expired':
        result = await this.handleMandateLifecycle(eventType, data);
        break;
      case 'virtual_account_funded':
        logger.info({ data }, 'Webhook: virtual_account.funded received — not used by UnityFund yet');
        break;
      default:
        logger.info({ eventType: rawEventType }, 'Webhook: unrecognized event type — ignored');
    }

    if (!result.ok) {
      await prisma.webhookEvent.update({
        where: { id: eventId },
        data: { status: 'failed', errorMessage: result.reason },
      });
      return;
    }

    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: { status: 'processed', processedAt: new Date() },
    });
  }

  // Covers checkout payments and direct-debit collections — both confirm/fail
  // against the `payments` table, matched by merchantTxRef (our payment.id).
  private async handlePaymentResult(
    normalizedEventType: string,
    data: Record<string, unknown> | undefined,
    success: boolean,
  ): Promise<HandlerResult> {
    const references = extractReferenceCandidates(data);
    const amountKobo = extractAmountKobo(data);

    if (references.length === 0) {
      logger.warn({ data }, 'Webhook: payment event missing reference — cannot reconcile');
      return { ok: false, reason: 'missing_reference' };
    }

    const payment = await prisma.payment.findFirst({
      where: {
        provider: 'nomba',
        OR: [
          ...references.map((reference) => ({ providerReference: reference })),
          ...references.map((reference) => ({ id: reference })),
        ],
      },
    });

    if (!payment) {
      logger.warn({ references }, 'Webhook: no matching payment found for references');
      return { ok: false, reason: 'payment_not_found' };
    }

    if (success) {
      if (this.requiresCheckoutVerification(normalizedEventType)) {
        const verified = await this.verifySuccessfulPayment(data);
        if (!verified) return { ok: false, reason: 'provider_verification_failed' };
      }

      if (!amountKobo) {
        logger.warn({ references, data }, 'Webhook: success event missing amount — cannot confirm payment');
        return { ok: false, reason: 'missing_amount' };
      }

      await paymentService.confirmPayment(payment.id, amountKobo);
    } else {
      await prisma.payment.updateMany({
        where: { id: payment.id, status: { in: ['initiated', 'pending'] } },
        data: { status: 'failed' },
      });
    }

    return { ok: true };
  }

  // M3: direct-debit success events get the same Nomba-side amount/status
  // verification checkout events already require — the webhook signature
  // doesn't cover the amount field, so this is the only check on it.
  private requiresCheckoutVerification(normalizedEventType: string): boolean {
    return [
      'payment_success', 'checkout_order_paid', 'checkout_payment_successful',
      'mandate_debit_success', 'mandate_debit_successful',
    ].includes(normalizedEventType);
  }

  private async verifySuccessfulPayment(data: Record<string, unknown> | undefined): Promise<boolean> {
    const verificationRefs = [
      { orderReference: extractOrderReference(data) },
      { transactionRef: extractTransactionReference(data) },
    ].filter((candidate) => Object.values(candidate).some(Boolean));

    if (verificationRefs.length === 0) {
      logger.warn({ data }, 'Webhook: success event missing verification references');
      return false;
    }

    for (const candidate of verificationRefs) {
      try {
        const result = await nombaClient.verifyTransaction(candidate);
        if (result.status?.toUpperCase() === 'SUCCESS') return true;

        logger.warn({ candidate, status: result.status }, 'Webhook: Nomba verification returned non-success status');
      } catch (err) {
        logger.warn({ err, candidate }, 'Webhook: Nomba verification request failed');
      }
    }

    return false;
  }

  private async handleMandateLifecycle(normalizedEventType: string, data: Record<string, unknown> | undefined): Promise<HandlerResult> {
    const mandateReference = (data?.mandateReference ?? data?.mandateId) as string | undefined;
    if (!mandateReference) return { ok: false, reason: 'missing_mandate_reference' };

    const statusMap: Record<string, string> = {
      mandate_activated: 'active',
      mandate_suspended: 'suspended',
      mandate_deleted: 'deleted',
      mandate_expired: 'expired',
    };

    const newStatus = statusMap[normalizedEventType];
    if (!newStatus) return { ok: false, reason: 'unknown_mandate_event' };

    const result = await prisma.mandate.updateMany({
      where: { providerMandateId: mandateReference },
      data: { status: newStatus as 'active' | 'suspended' | 'deleted' | 'expired' },
    });
    if (result.count === 0) {
      logger.warn({ mandateReference }, 'Webhook: mandate lifecycle event matched no mandate');
      return { ok: false, reason: 'mandate_not_found' };
    }
    logger.info({ mandateReference, newStatus }, 'Webhook: mandate status updated');
    return { ok: true };
  }

  private async handleTransferResult(data: Record<string, unknown> | undefined, success: boolean): Promise<HandlerResult> {
    const references = extractReferenceCandidates(data);
    if (references.length === 0) return { ok: false, reason: 'missing_reference' };

    const result = await prisma.payout.updateMany({
      where: {
        status: 'processing',
        OR: [
          ...references.map((reference) => ({ providerReference: reference })),
          ...references.map((reference) => ({ id: reference })),
        ],
      },
      data: success ? { status: 'successful', paidAt: new Date() } : { status: 'failed' },
    });
    if (result.count === 0) return { ok: false, reason: 'payout_not_found' };
    return { ok: true };
  }

  // M2: a reversal arriving after the payout already transitioned to
  // 'successful' previously matched handleTransferResult's status:'processing'
  // filter and was silently dropped. Handle it as its own transition instead.
  private async handlePayoutReversal(data: Record<string, unknown> | undefined): Promise<HandlerResult> {
    const references = extractReferenceCandidates(data);
    if (references.length === 0) return { ok: false, reason: 'missing_reference' };

    const result = await prisma.payout.updateMany({
      where: {
        status: 'successful',
        OR: [
          ...references.map((reference) => ({ providerReference: reference })),
          ...references.map((reference) => ({ id: reference })),
        ],
      },
      data: { status: 'reversed' },
    });
    if (result.count === 0) return { ok: false, reason: 'no_successful_payout_matched' };
    logger.info({ references }, 'Webhook: payout marked reversed');
    return { ok: true };
  }
}

export const webhookService = new WebhookService();
