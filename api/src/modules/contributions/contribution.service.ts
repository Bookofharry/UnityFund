import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';

const CONTRIBUTION_SELECT = {
  id: true,
  expectedAmount: true,
  paidAmount: true,
  status: true,
  dueDate: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
  fundMember: {
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
  collectionCycle: {
    select: { id: true, name: true, cycleNumber: true, status: true, fundId: true, fund: { select: { id: true, name: true } } },
  },
};

export class ContributionService {
  async list(filters: {
    orgId: string;
    fundId?: string;
    cycleId?: string;
    memberId?: string;
    status?: string;
    // Non-elevated callers (regular members) are hard-restricted to their own
    // contributions here, server-side — the memberId query param is only
    // honored for elevated (finance/admin) callers, see contribution.controller.ts.
    restrictToOrgMemberId?: string;
  }) {
    const where: Prisma.ContributionWhereInput = {
      collectionCycle: {
        fund: { organizationId: filters.orgId },
        ...(filters.fundId ? { fundId: filters.fundId } : {}),
        ...(filters.cycleId ? { id: filters.cycleId } : {}),
      },
      ...(filters.memberId ? { fundMemberId: filters.memberId } : {}),
      ...(filters.restrictToOrgMemberId ? { fundMember: { orgMemberId: filters.restrictToOrgMemberId } } : {}),
      ...(filters.status ? { status: filters.status as Prisma.EnumContributionStatusFilter } : {}),
    };

    return prisma.contribution.findMany({
      where,
      select: CONTRIBUTION_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orgId: string, contributionId: string, restrictToOrgMemberId?: string) {
    const contribution = await prisma.contribution.findFirst({
      where: {
        id: contributionId,
        collectionCycle: { fund: { organizationId: orgId } },
        ...(restrictToOrgMemberId ? { fundMember: { orgMemberId: restrictToOrgMemberId } } : {}),
      },
      select: {
        ...CONTRIBUTION_SELECT,
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            provider: true,
            providerReference: true,
            paidAt: true,
            createdAt: true,
          },
        },
      },
    });
    if (!contribution) throw new AppError(404, 'Contribution not found');
    return contribution;
  }

  async cycleSummary(orgId: string, cycleId: string) {
    const cycle = await prisma.collectionCycle.findFirst({
      where: { id: cycleId, fund: { organizationId: orgId } },
      select: {
        id: true,
        name: true,
        snapshotContributionAmount: true,
        status: true,
        contributions: {
          select: { status: true, expectedAmount: true, paidAmount: true },
        },
      },
    });
    if (!cycle) throw new AppError(404, 'Collection cycle not found');

    const total = cycle.contributions.length;
    const paid = cycle.contributions.filter((c) => c.status === 'paid').length;
    const overdue = cycle.contributions.filter((c) => c.status === 'overdue').length;
    const totalExpected = cycle.contributions.reduce((s, c) => s + c.expectedAmount, 0);
    const totalCollected = cycle.contributions.reduce((s, c) => s + c.paidAmount, 0);

    return {
      cycleId,
      name: cycle.name,
      status: cycle.status,
      total,
      paid,
      overdue,
      outstanding: total - paid - overdue,
      totalExpected,
      totalCollected,
      percentagePaid: total > 0 ? Math.floor((paid / total) * 100) : 0,
    };
  }
}

export const contributionService = new ContributionService();
