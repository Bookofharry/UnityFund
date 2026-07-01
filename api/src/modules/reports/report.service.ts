import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';

export class ReportService {
  async orgDashboard(orgId: string) {
    const [funds, activeCyclesCount, collectedResult, outstandingResult] = await Promise.all([
      prisma.fund.count({ where: { organizationId: orgId, status: { in: ['active', 'inactive'] }} }),
      prisma.collectionCycle.count({ where: { fund: { organizationId: orgId }, status: 'active' } }),
      prisma.payment.aggregate({
        where: { organizationId: orgId, status: 'successful' },
        _sum: { amount: true },
      }),
      prisma.contribution.aggregate({
        where: {
          collectionCycle: { fund: { organizationId: orgId }, status: 'active' },
          status: { in: ['pending', 'partial', 'overdue'] },
        },
        _sum: { expectedAmount: true, paidAmount: true },
      }),
    ]);

    const totalOutstandingKobo =
      (outstandingResult._sum.expectedAmount ?? 0) - (outstandingResult._sum.paidAmount ?? 0);

    return {
      activeFunds: funds,
      activeCycles: activeCyclesCount,
      totalCollectedKobo: collectedResult._sum.amount ?? 0,
      totalOutstandingKobo,
    };
  }

  async cycleSummaryReport(orgId: string, cycleId: string) {
    const cycle = await prisma.collectionCycle.findFirst({
      where: { id: cycleId, fund: { organizationId: orgId } },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        snapshotContributionAmount: true,
        fund: { select: { name: true, fundType: true } },
        contributions: {
          select: {
            id: true,
            expectedAmount: true,
            paidAmount: true,
            status: true,
            dueDate: true,
            paidAt: true,
            fundMember: {
              select: {
                rotationPosition: true,
                orgMember: {
                  select: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true } },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
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
      ...cycle,
      summary: { total, paid, overdue, outstanding: total - paid - overdue, totalExpected, totalCollected,
        percentagePaid: total > 0 ? Math.floor((paid / total) * 100) : 0 },
    };
  }

  async fundSummary(orgId: string) {
    const funds = await prisma.fund.findMany({
      where: { organizationId: orgId },
      select: {
        id: true, name: true, fundType: true, status: true,
        _count: { select: { members: true } },
        collectionCycles: {
          select: {
            id: true, status: true,
            contributions: { select: { paidAmount: true } },
          },
        },
      },
    });

    return funds.map((f) => {
      const totalCollected = f.collectionCycles.flatMap((c) => c.contributions)
        .reduce((s, c) => s + c.paidAmount, 0);
      const cycleCount = f.collectionCycles.length;
      const activeCycle = f.collectionCycles.find((c) => c.status === 'active');
      return {
        id: f.id, name: f.name, fundType: f.fundType, status: f.status,
        memberCount: f._count.members, cycleCount, activeCycleId: activeCycle?.id ?? null,
        totalCollectedKobo: totalCollected,
      };
    });
  }

  async memberHistory(orgId: string, orgMemberId: string) {
    const member = await prisma.orgMember.findFirst({
      where: { id: orgMemberId, organizationId: orgId },
      select: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
    if (!member) throw new AppError(404, 'Organization member not found');

    const fundMembers = await prisma.fundMember.findMany({
      where: { orgMemberId, fund: { organizationId: orgId } },
      select: {
        id: true,
        rotationPosition: true,
        fund: { select: { id: true, name: true, fundType: true } },
        contributions: {
          select: {
            id: true, expectedAmount: true, paidAmount: true, status: true,
            paidAt: true, createdAt: true,
            collectionCycle: { select: { id: true, name: true, status: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return { member: member.user, funds: fundMembers };
  }
}

export const reportService = new ReportService();
