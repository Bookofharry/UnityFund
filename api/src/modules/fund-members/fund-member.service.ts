import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import { auditLog } from '../../services/audit.service';
import type { EnrollFundMemberDtoType } from './fund-member.dto';

const MEMBER_SELECT = {
  id: true,
  rotationPosition: true,
  status: true,
  joinedAt: true,
  orgMember: {
    select: {
      id: true,
      role: true,
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  },
};

export class FundMemberService {
  async enroll(orgId: string, fundId: string, actorId: string, data: EnrollFundMemberDtoType) {
    // Validate org member belongs to this org
    const orgMember = await prisma.orgMember.findFirst({
      where: { id: data.orgMemberId, organizationId: orgId, status: { not: 'removed' } },
    });
    if (!orgMember) throw new AppError(404, 'Organization member not found in this organization');

    // Validate fund belongs to org
    const fund = await prisma.fund.findFirst({
      where: { id: fundId, organizationId: orgId },
      include: { rules: true },
    });
    if (!fund) throw new AppError(404, 'Fund not found');

    // Rotation position required for rotational_savings
    if (fund.fundType === 'rotational_savings' && data.rotationPosition === undefined) {
      throw new AppError(400, 'rotationPosition is required for rotational_savings funds');
    }
    if (fund.fundType !== 'rotational_savings' && data.rotationPosition !== undefined) {
      throw new AppError(400, 'rotationPosition only applies to rotational_savings funds');
    }

    // Check not already enrolled
    const existing = await prisma.fundMember.findUnique({
      where: { fundId_orgMemberId: { fundId, orgMemberId: data.orgMemberId } },
    });
    if (existing && existing.status !== 'removed') {
      throw new AppError(409, 'This member is already enrolled in the fund');
    }

    const fundMember = existing
      ? await prisma.fundMember.update({
          where: { id: existing.id },
          data: { status: 'active', rotationPosition: data.rotationPosition ?? null },
          select: MEMBER_SELECT,
        })
      : await prisma.fundMember.create({
          data: { fundId, orgMemberId: data.orgMemberId, rotationPosition: data.rotationPosition ?? null },
          select: MEMBER_SELECT,
        });

    await auditLog(orgId, actorId, 'fund_member', fundMember.id, 'enrolled',
      `Member enrolled in fund`, { fundId, rotationPosition: data.rotationPosition });

    return fundMember;
  }

  async list(fundId: string) {
    return prisma.fundMember.findMany({
      where: { fundId, status: { not: 'removed' } },
      select: MEMBER_SELECT,
      orderBy: [{ rotationPosition: 'asc' }, { joinedAt: 'asc' }],
    });
  }

  async findById(orgId: string, fundId: string, fundMemberId: string) {
    const member = await prisma.fundMember.findFirst({
      where: {
        id: fundMemberId,
        fundId,
        fund: { organizationId: orgId },
        status: { not: 'removed' },
      },
      select: MEMBER_SELECT,
    });
    if (!member) throw new AppError(404, 'Fund member not found');
    return member;
  }

  async remove(orgId: string, fundId: string, fundMemberId: string, actorId: string) {
    await this.findById(orgId, fundId, fundMemberId);

    // Block if member has pending/partial contributions in an active cycle
    const pendingContributions = await prisma.contribution.count({
      where: {
        fundMemberId,
        status: { in: ['pending', 'partial'] },
        collectionCycle: { status: 'active' },
      },
    });
    if (pendingContributions > 0) {
      throw new AppError(400, 'Cannot remove member with outstanding contributions in an active cycle');
    }

    await prisma.fundMember.update({
      where: { id: fundMemberId },
      data: { status: 'removed' },
    });

    await auditLog(orgId, actorId, 'fund_member', fundMemberId, 'removed', 'Fund member removed');
  }
}

export const fundMemberService = new FundMemberService();
