import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import { auditLog } from '../../services/audit.service';
import type { CreateFundDtoType, UpdateFundDtoType, CreateFundRulesDtoType, UpdateFundRulesDtoType } from './fund.dto';

const FUND_SELECT = {
  id: true,
  organizationId: true,
  name: true,
  fundType: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

const RULES_SELECT = {
  id: true,
  contributionAmount: true,
  contributionFrequency: true,
  collectionDay: true,
  startDate: true,
  endDate: true,
  allowPartialPayment: true,
  payoutAllowed: true,
  payoutTrigger: true,
  payoutThresholdPct: true,
  approvalRequired: true,
  penaltyEnabled: true,
  updatedAt: true,
};

export class FundService {
  async create(orgId: string, actorId: string, data: CreateFundDtoType) {
    const fund = await prisma.fund.create({
      data: { ...data, organizationId: orgId },
      select: { ...FUND_SELECT, rules: { select: RULES_SELECT } },
    });
    await auditLog(orgId, actorId, 'fund', fund.id, 'created', `Fund "${fund.name}" created`);
    return fund;
  }

  async list(orgId: string) {
    return prisma.fund.findMany({
      where: { organizationId: orgId, status: { not: 'archived' } },
      select: {
        ...FUND_SELECT,
        rules: { select: { contributionAmount: true, contributionFrequency: true } },
        _count: { select: { members: { where: { status: 'active' } }, collectionCycles: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orgId: string, fundId: string) {
    const fund = await prisma.fund.findFirst({
      where: { id: fundId, organizationId: orgId },
      select: {
        ...FUND_SELECT,
        rules: { select: RULES_SELECT },
        _count: {
          select: {
            members: { where: { status: 'active' } },
            collectionCycles: { where: { status: 'active' } },
          },
        },
      },
    });
    if (!fund) throw new AppError(404, 'Fund not found');
    return fund;
  }

  async update(orgId: string, fundId: string, actorId: string, data: UpdateFundDtoType) {
    await this.findById(orgId, fundId);
    const fund = await prisma.fund.update({
      where: { id: fundId },
      data,
      select: FUND_SELECT,
    });
    await auditLog(orgId, actorId, 'fund', fundId, 'updated', `Fund "${fund.name}" updated`, data);
    return fund;
  }

  async archive(orgId: string, fundId: string, actorId: string) {
    const fund = await this.findById(orgId, fundId);

    if (fund.status === 'archived') {
      throw new AppError(400, 'Fund is already archived');
    }

    const activeCount = await prisma.collectionCycle.count({
      where: { fundId, status: 'active' },
    });
    if (activeCount > 0) {
      throw new AppError(400, 'Cannot archive fund with an active collection cycle');
    }

    await prisma.fund.update({ where: { id: fundId }, data: { status: 'archived' } });
    await auditLog(orgId, actorId, 'fund', fundId, 'archived', `Fund "${fund.name}" archived`);
  }

  async getRules(orgId: string, fundId: string) {
    await this.findById(orgId, fundId);
    const rules = await prisma.fundRule.findUnique({
      where: { fundId },
      select: RULES_SELECT,
    });
    if (!rules) throw new AppError(404, 'Fund rules not configured yet');
    return rules;
  }

  async upsertRules(orgId: string, fundId: string, actorId: string, data: CreateFundRulesDtoType | UpdateFundRulesDtoType) {
    await this.findById(orgId, fundId);

    const rules = await prisma.fundRule.upsert({
      where: { fundId },
      create: { fundId, ...data } as never,
      update: data,
      select: RULES_SELECT,
    });

    await auditLog(orgId, actorId, 'fund_rules', fundId, 'updated', 'Fund rules updated');
    return rules;
  }
}

export const fundService = new FundService();
