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
          where: { id: data.mandateId, orgMember: { organizationId: orgId }, status: 'active' },
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
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: { id: true, contributionId: true, status: true },
    });
    if (!payment) return;
    if (payment.status === 'successful') return; // idempotent

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: 'successful', paidAt: new Date() },
      });

      const contribution = await tx.contribution.findUnique({
        where: { id: payment.contributionId },
        select: { id: true, expectedAmount: true, paidAmount: true, status: true },
      });
      if (!contribution) return;

      const newPaid = contribution.paidAmount + amountPaid;
      const newStatus = newPaid >= contribution.expectedAmount ? 'paid' : 'partial';

      await tx.contribution.update({
        where: { id: payment.contributionId },
        data: { paidAmount: newPaid, status: newStatus, paidAt: newStatus === 'paid' ? new Date() : undefined },
      });
    });

    // BRE evaluation outside transaction
    await bre.onPaymentConfirmed(payment.contributionId);
  }

  async list(orgId: string, filters: { fundId?: string; contributionId?: string }) {
    const where: Prisma.PaymentWhereInput = {
      organizationId: orgId,
      ...(filters.fundId ? { fundId: filters.fundId } : {}),
      ...(filters.contributionId ? { contributionId: filters.contributionId } : {}),
    };
    return prisma.payment.findMany({
      where,
      select: PAYMENT_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orgId: string, paymentId: string) {
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, organizationId: orgId },
      select: { ...PAYMENT_SELECT, rawPayload: true },
    });
    if (!payment) throw new AppError(404, 'Payment not found');
    return payment;
  }
}

export const paymentService = new PaymentService();
