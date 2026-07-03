import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import { auditLog } from '../../services/audit.service';
import { bre } from '../../services/bre.service';
import type { CreateCollectionCycleDtoType } from './cycle.dto';

const CYCLE_SELECT = {
  id: true,
  fundId: true,
  name: true,
  cycleNumber: true,
  startDate: true,
  endDate: true,
  status: true,
  snapshotContributionAmount: true,
  snapshotContributionFrequency: true,
  snapshotAllowPartialPayment: true,
  snapshotPayoutTrigger: true,
  snapshotPayoutThresholdPct: true,
  snapshotApprovalRequired: true,
  snapshotPayoutAllowed: true,
  createdAt: true,
  updatedAt: true,
};

export class CollectionCycleService {
  async create(orgId: string, fundId: string, actorId: string, data: CreateCollectionCycleDtoType) {
    // Validate fund belongs to org and has rules configured
    const fund = await prisma.fund.findFirst({
      where: { id: fundId, organizationId: orgId, status: { not: 'archived' } },
      include: { rules: true },
    });
    if (!fund) throw new AppError(404, 'Fund not found');
    if (!fund.rules) throw new AppError(400, 'Fund rules must be configured before creating a collection cycle');

    const cycle = await prisma.collectionCycle.create({
      data: { fundId, ...data, status: 'draft' },
      select: CYCLE_SELECT,
    });

    await auditLog(orgId, actorId, 'collection_cycle', cycle.id, 'created',
      `Collection cycle "${cycle.name}" created`);

    return cycle;
  }

  async start(orgId: string, fundId: string, cycleId: string, actorId: string) {
    const cycle = await prisma.collectionCycle.findFirst({
      where: { id: cycleId, fundId, fund: { organizationId: orgId } },
    });
    if (!cycle) throw new AppError(404, 'Collection cycle not found');
    if (cycle.status !== 'draft') {
      throw new AppError(400, `Cannot start a cycle with status '${cycle.status}'`);
    }

    const rules = await prisma.fundRule.findUnique({ where: { fundId } });
    if (!rules) throw new AppError(400, 'Fund rules must be configured before starting a cycle');

    try {
      const started = await prisma.$transaction(async (tx) => {
        // ADR-011 Fix 3: Snapshot all rule fields onto the cycle (immutable after this point)
        const updated = await tx.collectionCycle.update({
          where: { id: cycleId },
          data: {
            status: 'active',
            snapshotContributionAmount: rules.contributionAmount,
            snapshotContributionFrequency: rules.contributionFrequency,
            snapshotAllowPartialPayment: rules.allowPartialPayment,
            snapshotPayoutTrigger: rules.payoutTrigger,
            snapshotPayoutThresholdPct: rules.payoutThresholdPct,
            snapshotApprovalRequired: rules.approvalRequired,
            snapshotPayoutAllowed: rules.payoutAllowed,
            snapshotRulesJson: rules.rulesJson ?? Prisma.DbNull,
          },
          select: CYCLE_SELECT,
        });

        // Bulk create one contribution per active fund member
        const members = await tx.fundMember.findMany({
          where: { fundId, status: 'active' },
          select: { id: true },
        });

        if (members.length === 0) {
          throw new AppError(400, 'Cannot start cycle: fund has no active members');
        }

        await tx.contribution.createMany({
          data: members.map((m) => ({
            collectionCycleId: cycleId,
            fundMemberId: m.id,
            expectedAmount: rules.contributionAmount,
            status: 'pending' as const,
          })),
        });

        await tx.auditLog.create({
          data: {
            organizationId: orgId,
            actorUserId: actorId,
            entityType: 'collection_cycle',
            entityId: cycleId,
            action: 'started',
            description: `Cycle started — ${members.length} contributions generated`,
            metadata: { contributionsCreated: members.length } as Prisma.InputJsonValue,
          },
        });

        return updated;
      });

      return started;
    } catch (err) {
      // Partial unique index violation: another cycle for this fund is already active
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new AppError(409, 'A collection cycle is already active for this fund');
      }
      throw err;
    }
  }

  async close(orgId: string, fundId: string, cycleId: string, actorId: string) {
    const cycle = await prisma.collectionCycle.findFirst({
      where: { id: cycleId, fundId, fund: { organizationId: orgId } },
    });
    if (!cycle) throw new AppError(404, 'Collection cycle not found');
    if (cycle.status !== 'active') {
      throw new AppError(400, `Cannot close a cycle with status '${cycle.status}'`);
    }

    await prisma.$transaction(async (tx) => {
      await tx.collectionCycle.update({
        where: { id: cycleId },
        data: { status: 'closed' },
      });

      // Mark outstanding contributions as overdue
      await tx.contribution.updateMany({
        where: { collectionCycleId: cycleId, status: { in: ['pending', 'partial'] } },
        data: { status: 'overdue' },
      });

      await tx.auditLog.create({
        data: {
          organizationId: orgId,
          actorUserId: actorId,
          entityType: 'collection_cycle',
          entityId: cycleId,
          action: 'closed',
          description: 'Collection cycle closed',
        },
      });
    });

    // BRE evaluation runs outside the transaction (non-blocking for MVP)
    await bre.onCycleClosed(cycleId);

    return prisma.collectionCycle.findUnique({ where: { id: cycleId }, select: CYCLE_SELECT });
  }

  async list(orgId: string, fundId: string) {
    return prisma.collectionCycle.findMany({
      where: { fundId, fund: { organizationId: orgId } },
      select: {
        ...CYCLE_SELECT,
        _count: { select: { contributions: true } },
      },
      orderBy: { cycleNumber: 'desc' },
    });
  }

  async findById(orgId: string, fundId: string, cycleId: string) {
    const cycle = await prisma.collectionCycle.findFirst({
      where: { id: cycleId, fundId, fund: { organizationId: orgId } },
      select: {
        ...CYCLE_SELECT,
        contributions: {
          select: {
            id: true,
            status: true,
            expectedAmount: true,
            paidAmount: true,
          },
        },
      },
    });
    if (!cycle) throw new AppError(404, 'Collection cycle not found');

    // Compute progress summary
    const total = cycle.contributions.length;
    const paid = cycle.contributions.filter((c) => c.status === 'paid').length;
    const totalExpected = cycle.contributions.reduce((s, c) => s + c.expectedAmount, 0);
    const totalCollected = cycle.contributions.reduce((s, c) => s + c.paidAmount, 0);

    return {
      ...cycle,
      progress: { total, paid, totalExpected, totalCollected, percentagePaid: total > 0 ? Math.floor((paid / total) * 100) : 0 },
    };
  }
}

export const collectionCycleService = new CollectionCycleService();
