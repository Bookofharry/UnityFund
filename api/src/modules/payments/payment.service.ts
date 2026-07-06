import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import { nombaClient } from '../../lib/nomba';
import { bre } from '../../services/bre.service';
import { env } from '../../config/env';
import { logger } from '../../lib/logger';
import type { InitiatePaymentDtoType } from './payment.dto';

const PAYMENT_SELECT = {
  id: true,
  contributionId: true,
  organizationId: true,
  fundId: true,
  amount: true,
  currency: true,
  paymentMethod: true,
  provider: true,
  providerReference: true,
  status: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
};

const PAYMENT_HISTORY_SELECT = {
  ...PAYMENT_SELECT,
  contribution: {
    select: {
      fundMember: {
        select: {
          orgMember: {
            select: {
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
        },
      },
      collectionCycle: {
        select: {
          id: true,
          name: true,
          fund: { select: { id: true, name: true } },
        },
      },
    },
  },
};

export class PaymentService {
  async initiate(orgId: string, contributionId: string, actorUserId: string, data: InitiatePaymentDtoType) {
    const contribution = await prisma.contribution.findFirst({
      where: {
        id: contributionId,
        collectionCycle: { fund: { organizationId: orgId } },
      },
      include: { collectionCycle: { select: { fundId: true, status: true } } },
    });

    if (!contribution) throw new AppError(404, 'Contribution not found');
    if (contribution.collectionCycle.status !== 'active') {
      throw new AppError(400, 'Cannot pay a contribution outside of an active cycle');
    }
    if (!['pending', 'partial', 'overdue'].includes(contribution.status)) {
      throw new AppError(400, `Contribution is already ${contribution.status}`);
    }

    const fundId = contribution.collectionCycle.fundId;
    const amountDue = contribution.expectedAmount - contribution.paidAmount;

    // Idempotency: return existing in-flight payment rather than creating a duplicate
    const existingPayment = await prisma.payment.findFirst({
      where: {
        contributionId,
        paymentMethod: data.paymentMethod,
        status: { in: ['initiated', 'pending'] },
      },
      select: PAYMENT_SELECT,
    });
    if (existingPayment) {
      logger.info({ paymentId: existingPayment.id, contributionId }, 'Returning existing in-flight payment');

      // Checkout URLs are single-use/short-lived and never persisted (no column
      // for it on Payment), so the existing payment alone isn't enough for the
      // frontend to resume a checkout — regenerate a fresh session for the same
      // payment record instead of creating a duplicate Payment row.
      if (data.paymentMethod === 'checkout') {
        try {
          const actor = await prisma.user.findUnique({ where: { id: actorUserId }, select: { email: true } });
          const result = await nombaClient.createCheckoutSession({
            amount: existingPayment.amount,
            currency: existingPayment.currency,
            reference: existingPayment.id,
            callbackUrl: `${env.APP_URL}/payments/callback?paymentId=${existingPayment.id}&orgId=${orgId}`,
            customerEmail: actor?.email,
            customerId: actorUserId,
          });
          return { payment: existingPayment, checkoutUrl: result.checkoutUrl };
        } catch (err) {
          await prisma.payment.update({
            where: { id: existingPayment.id },
            data: { status: 'failed' },
          }).catch(() => {});
          throw err;
        }
      }

      return { payment: existingPayment };
    }

    // Create payment record first (initiated state)
    const payment = await prisma.payment.create({
      data: {
        contributionId,
        organizationId: orgId,
        fundId,
        amount: amountDue,
        currency: 'NGN',
        paymentMethod: data.paymentMethod,
        provider: 'nomba',
        status: 'initiated',
      },
      select: PAYMENT_SELECT,
    });

    try {
      let providerResult: { reference: string; redirectUrl?: string; checkoutUrl?: string };

      if (data.paymentMethod === 'checkout') {
        // Fetch actor email so Nomba can pre-fill the checkout form
        const actor = await prisma.user.findUnique({
          where: { id: actorUserId },
          select: { email: true },
        });

        const result = await nombaClient.createCheckoutSession({
          amount: amountDue,
          currency: 'NGN',
          reference: payment.id,
          callbackUrl: `${env.APP_URL}/payments/callback?paymentId=${payment.id}&orgId=${orgId}`,
          customerEmail: actor?.email,
          customerId: actorUserId,
        });
        providerResult = { reference: payment.id, checkoutUrl: result.checkoutUrl };

        await prisma.payment.update({
          where: { id: payment.id },
          data: { providerReference: payment.id, status: 'pending' },
        });

        return { payment: { ...payment, status: 'pending' }, checkoutUrl: result.checkoutUrl };
      }

      if (data.paymentMethod === 'direct_debit') {
        const mandate = await prisma.mandate.findFirst({
          where: {
            id: data.mandateId,
            status: 'active',
            orgMember: { organizationId: orgId, userId: actorUserId },
          },
        });
        if (!mandate) throw new AppError(404, 'Active mandate not found');

        await nombaClient.initiateDirectDebit({
          mandateId: mandate.providerMandateId!,
          amount: amountDue,
        });

        // Nomba's debit-mandate response carries no per-attempt transaction
        // reference — self-reference by payment.id; the webhook handler falls
        // back to matching on payment.id when providerReference lookup misses.
        await prisma.payment.update({
          where: { id: payment.id },
          data: { providerReference: payment.id, status: 'pending' },
        });

        return { payment: { ...payment, status: 'pending', providerReference: payment.id } };
      }

      throw new AppError(400, `Payment method ${data.paymentMethod} not supported for self-service initiation`);
    } catch (err) {
      // Mark payment as failed if Nomba call fails
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      }).catch(() => {}); // silent — don't mask original error
      throw err;
    }
  }

  async confirmPayment(paymentId: string, amountPaid: number): Promise<void> {
    let contributionId: string | undefined;

    await prisma.$transaction(async (tx) => {
      // Atomic, conditional status flip: a second delivery of the same webhook
      // (or a reprocessing retry) that arrives after this already succeeded
      // affects 0 rows and becomes a no-op, instead of racing a read-then-write.
      const updateResult = await tx.payment.updateMany({
        where: { id: paymentId, status: { notIn: ['successful', 'reversed', 'cancelled'] } },
        data: { status: 'successful', paidAt: new Date() },
      });
      if (updateResult.count === 0) return;

      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        select: { contributionId: true },
      });
      if (!payment) return;
      contributionId = payment.contributionId;

      // Best-effort pre-read for diagnostics only — the actual credit below is
      // capped atomically in the same UPDATE, so a stale read here can produce
      // an imprecise warning log at worst, never an incorrect credit.
      const before = await tx.contribution.findUnique({
        where: { id: contributionId },
        select: { expectedAmount: true, paidAmount: true },
      });
      if (!before) return;
      const amountDue = Math.max(0, before.expectedAmount - before.paidAmount);
      if (amountPaid > amountDue) {
        logger.warn({ paymentId, contributionId, amountPaid, amountDue },
          'Webhook payment amount exceeds amount owed — capping credit to amount due');
      }

      // Atomic, capped increment: LEAST() computes the cap in the database at
      // write time, so two payments confirming concurrently on the same
      // contribution can't both read a stale "amount due" and jointly overshoot it.
      const rows = await tx.$queryRaw<{ id: string; paidAmount: number; expectedAmount: number }[]>`
        UPDATE contributions
        SET "paidAmount" = LEAST("expectedAmount", "paidAmount" + ${amountPaid}), "updatedAt" = NOW()
        WHERE id = ${contributionId}
        RETURNING id, "paidAmount", "expectedAmount"
      `;
      const updated = rows[0];
      if (!updated) return;

      const newStatus = updated.paidAmount >= updated.expectedAmount ? 'paid' : 'partial';
      await tx.contribution.update({
        where: { id: updated.id },
        data: { status: newStatus, paidAt: newStatus === 'paid' ? new Date() : undefined },
      });
    });

    // BRE evaluation outside transaction
    if (contributionId) {
      await bre.onPaymentConfirmed(contributionId);
    }
  }

  async list(orgId: string, filters: {
    fundId?: string;
    contributionId?: string;
    // Non-elevated callers (regular members) are hard-restricted to their own
    // payment history here, server-side — see payment.controller.ts.
    restrictToOrgMemberId?: string;
  }) {
    const where: Prisma.PaymentWhereInput = {
      organizationId: orgId,
      ...(filters.fundId ? { fundId: filters.fundId } : {}),
      ...(filters.contributionId ? { contributionId: filters.contributionId } : {}),
      ...(filters.restrictToOrgMemberId
        ? { contribution: { fundMember: { orgMemberId: filters.restrictToOrgMemberId } } }
        : {}),
    };
    return prisma.payment.findMany({
      where,
      select: PAYMENT_HISTORY_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orgId: string, paymentId: string, restrictToOrgMemberId?: string) {
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        organizationId: orgId,
        ...(restrictToOrgMemberId ? { contribution: { fundMember: { orgMemberId: restrictToOrgMemberId } } } : {}),
      },
      select: { ...PAYMENT_SELECT, rawPayload: true },
    });
    if (!payment) throw new AppError(404, 'Payment not found');
    return payment;
  }
}

export const paymentService = new PaymentService();
