import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import { nombaClient } from '../../lib/nomba';
import { auditLog } from '../../services/audit.service';
import { logger } from '../../lib/logger';
import type { CreatePayoutDtoType } from './payout.dto';

const PAYOUT_SELECT = {
  id: true,
  fundId: true,
  recipientId: true,
  amount: true,
  currency: true,
  provider: true,
  providerReference: true,
  status: true,
  reason: true,
  approvedBy: true,
  approvedAt: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
  recipient: {
    select: {
      id: true,
      rotationPosition: true,
      orgMember: {
        select: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
    },
  },
  fund: { select: { id: true, name: true, organizationId: true } },
};

export class PayoutService {
  async create(orgId: string, fundId: string, actorId: string, data: CreatePayoutDtoType) {
    const fund = await prisma.fund.findFirst({ where: { id: fundId, organizationId: orgId } });
    if (!fund) throw new AppError(404, 'Fund not found');

    const recipient = await prisma.fundMember.findFirst({
      where: { id: data.recipientFundMemberId, fundId, status: 'active' },
    });
    if (!recipient) throw new AppError(404, 'Active fund member not found');

    const rules = await prisma.fundRule.findUnique({ where: { fundId } });

    const payout = await prisma.payout.create({
      data: {
        fundId,
        recipientId: data.recipientFundMemberId,
        amount: data.amount,
        reason: data.reason,
        status: rules?.approvalRequired ? 'pending_approval' : 'approved',
      },
      select: PAYOUT_SELECT,
    });

    await auditLog(orgId, actorId, 'payout', payout.id, 'created',
      `Payout of ${data.amount} Kobo created for fund member ${data.recipientFundMemberId}`,
    );

    return payout;
  }

  /** Called by BRE — identifies the next rotation recipient or pooled payout */
  async createFromCycle(cycleId: string): Promise<void> {
    const cycle = await prisma.collectionCycle.findUnique({
      where: { id: cycleId },
      include: {
        fund: { select: { id: true, organizationId: true, fundType: true, name: true } },
        contributions: {
          where: { status: 'paid' },
          include: {
            fundMember: { select: { id: true, rotationPosition: true, orgMemberId: true } },
            payments: { where: { status: 'successful' }, select: { amount: true } },
          },
        },
      },
    });
    if (!cycle) return;

    const totalCollected = cycle.contributions.reduce((sum, c) =>
      sum + c.payments.reduce((ps, p) => ps + p.amount, 0), 0);

    if (totalCollected === 0) return;

    let recipientId: string;

    if (cycle.fund.fundType === 'rotational_savings') {
      // C4: look at the single most recent payout for this fund (any status,
      // not just 'successful') to decide the next rotation position.
      // "Retain position" policy: a payout that hasn't reached 'successful'
      // yet (still in-flight, or failed/cancelled) means that position gets
      // retried on the next trigger, not skipped past.
      const lastPayout = await prisma.payout.findFirst({
        where: {
          fundId: cycle.fund.id,
          recipient: { rotationPosition: { not: null } },
        },
        orderBy: { createdAt: 'desc' },
        include: { recipient: { select: { rotationPosition: true } } },
      });

      const activeMemberCount = await prisma.fundMember.count({
        where: { fundId: cycle.fund.id, status: 'active', rotationPosition: { not: null } },
      });
      if (activeMemberCount === 0) {
        logger.warn({ cycleId }, 'BRE: no rotation-eligible fund members found');
        return;
      }

      const nextPosition = !lastPayout || lastPayout.status === 'successful'
        ? ((lastPayout?.recipient.rotationPosition ?? 0) % activeMemberCount) + 1
        : lastPayout.recipient.rotationPosition!;

      const nextRecipient = await prisma.fundMember.findFirst({
        where: { fundId: cycle.fund.id, status: 'active', rotationPosition: nextPosition },
      });

      if (!nextRecipient) {
        logger.warn({ cycleId, nextPosition }, 'BRE: no fund member found at rotation position');
        return;
      }
      recipientId = nextRecipient.id;
    } else {
      // For non-rotational: create payout to the org admin / treasurer (to be distributed)
      // Get the first enrolled active member as default — real implementations would specify recipient
      const firstMember = await prisma.fundMember.findFirst({
        where: { fundId: cycle.fund.id, status: 'active' },
        orderBy: { createdAt: 'asc' },
      });
      if (!firstMember) return;
      recipientId = firstMember.id;
    }

    try {
      // H5: read the cycle's OWN rule snapshot, never the live FundRule — an
      // in-progress cycle must not be affected by rule changes made after it started.
      const payout = await prisma.payout.create({
        data: {
          fundId: cycle.fund.id,
          // C3: partial unique index on collectionCycleId rejects a second
          // payout for the same cycle if this is triggered concurrently.
          collectionCycleId: cycle.id,
          recipientId,
          amount: totalCollected,
          reason: `Auto-generated payout from cycle: ${cycle.name}`,
          status: cycle.snapshotApprovalRequired ? 'pending_approval' : 'approved',
        },
      });

      logger.info({ payoutId: payout.id, cycleId, amount: totalCollected }, 'BRE: payout created from cycle');
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        logger.info({ cycleId }, 'BRE: payout already exists for this cycle — skipping duplicate');
        return;
      }
      throw err;
    }
  }

  async approve(orgId: string, payoutId: string, actorId: string, note?: string) {
    const payout = await prisma.payout.findFirst({
      where: { id: payoutId, fund: { organizationId: orgId } },
      select: { id: true, status: true },
    });
    if (!payout) throw new AppError(404, 'Payout not found');
    if (payout.status !== 'pending_approval') {
      throw new AppError(400, `Cannot approve payout in status: ${payout.status}`);
    }

    const updated = await prisma.payout.update({
      where: { id: payoutId },
      data: { status: 'approved', approvedBy: actorId, approvedAt: new Date() },
      select: PAYOUT_SELECT,
    });

    await auditLog(orgId, actorId, 'payout', payoutId, 'approved',
      note ? `Approved: ${note}` : 'Payout approved',
    );

    return updated;
  }

  async execute(orgId: string, payoutId: string, actorId: string) {
    const payout = await prisma.payout.findFirst({
      where: { id: payoutId, fund: { organizationId: orgId } },
      include: {
        fund: { include: { organization: { select: { name: true } } } },
        recipient: {
          include: {
            orgMember: {
              include: {
                bankAccounts: {
                  where: { isDefault: true, isVerified: true, status: 'active' },
                },
              },
            },
          },
        },
      },
    });
    if (!payout) throw new AppError(404, 'Payout not found');
    if (payout.status !== 'approved') {
      throw new AppError(400, `Payout must be in 'approved' status to execute. Current: ${payout.status}`);
    }

    const bankAccount = payout.recipient.orgMember.bankAccounts[0];
    if (!bankAccount) {
      throw new AppError(400, 'Recipient has no verified default bank account');
    }

    // ADR-011 Fix 7: Atomic conditional UPDATE — prevents concurrent double execution
    const result = await prisma.$executeRaw`
      UPDATE payouts
      SET status = 'processing', "updatedAt" = NOW()
      WHERE id = ${payoutId} AND status = 'approved'
    `;

    if (result === 0) {
      throw new AppError(409, 'Payout is already being processed (concurrent execution detected)');
    }

    try {
      // Always re-resolve the account name immediately before transfer —
      // NUBAN-to-name mismatches are often irreversible once money moves.
      const lookup = await nombaClient.accountNameEnquiry({
        accountNumber: bankAccount.accountNumber,
        bankCode: bankAccount.bankCode,
      });

      // Use payout.id as idempotency key (ADR critical rule #8)
      const transfer = await nombaClient.initiateTransfer({
        accountNumber: bankAccount.accountNumber,
        bankCode: bankAccount.bankCode,
        accountName: lookup.accountName,
        senderName: payout.fund.organization.name,
        amount: payout.amount,
        narration: `UnityFund payout ${payoutId}`,
        merchantTxRef: payoutId,   // payoutId serves as idempotency key per ADR-011
      });

      await prisma.payout.update({
        where: { id: payoutId },
        data: { providerReference: transfer.id },
      });

      await auditLog(orgId, actorId, 'payout', payoutId, 'executed',
        `Transfer initiated via Nomba: ${transfer.id}`,
      );
    } catch (err) {
      // Revert to approved so it can be retried
      await prisma.payout.update({
        where: { id: payoutId },
        data: { status: 'approved' },
      }).catch(() => {});

      throw err;
    }

    return prisma.payout.findUnique({ where: { id: payoutId }, select: PAYOUT_SELECT });
  }

  async list(orgId: string, fundId?: string) {
    return prisma.payout.findMany({
      where: {
        fund: { organizationId: orgId },
        ...(fundId ? { fundId } : {}),
      },
      select: PAYOUT_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orgId: string, payoutId: string) {
    const payout = await prisma.payout.findFirst({
      where: { id: payoutId, fund: { organizationId: orgId } },
      select: PAYOUT_SELECT,
    });
    if (!payout) throw new AppError(404, 'Payout not found');
    return payout;
  }
}

export const payoutService = new PayoutService();
