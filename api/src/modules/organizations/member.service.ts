import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import { auditLog } from '../../services/audit.service';
import type { UpdateMemberRoleDtoType, UpdateMemberStatusDtoType } from './organization.dto';

const MEMBER_SELECT = {
  id: true,
  role: true,
  status: true,
  joinedAt: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
};

export class MemberService {
  async list(orgId: string) {
    return prisma.orgMember.findMany({
      where: { organizationId: orgId, status: { not: 'removed' } },
      select: MEMBER_SELECT,
      orderBy: { joinedAt: 'asc' },
    });
  }

  async findById(orgId: string, memberId: string) {
    const member = await prisma.orgMember.findFirst({
      where: { id: memberId, organizationId: orgId },
      select: MEMBER_SELECT,
    });
    if (!member) throw new AppError(404, 'Member not found');
    return member;
  }

  async updateRole(orgId: string, memberId: string, actorId: string, data: UpdateMemberRoleDtoType) {
    const member = await prisma.orgMember.findFirst({
      where: { id: memberId, organizationId: orgId, status: { not: 'removed' } },
    });
    if (!member) throw new AppError(404, 'Member not found');

    const updated = await prisma.orgMember.update({
      where: { id: memberId },
      data: { role: data.role },
      select: MEMBER_SELECT,
    });

    await auditLog(orgId, actorId, 'org_member', memberId, 'role_updated',
      `Member role changed to ${data.role}`, { previousRole: member.role, newRole: data.role });

    return updated;
  }

  async updateStatus(orgId: string, memberId: string, actorId: string, data: UpdateMemberStatusDtoType) {
    const member = await prisma.orgMember.findFirst({
      where: { id: memberId, organizationId: orgId, status: { not: 'removed' } },
    });
    if (!member) throw new AppError(404, 'Member not found');

    const updated = await prisma.orgMember.update({
      where: { id: memberId },
      data: { status: data.status },
      select: MEMBER_SELECT,
    });

    await auditLog(orgId, actorId, 'org_member', memberId, 'status_updated',
      `Member status changed to ${data.status}`, { previousStatus: member.status, newStatus: data.status });

    return updated;
  }

  async remove(orgId: string, memberId: string, actorId: string) {
    const member = await prisma.orgMember.findFirst({
      where: { id: memberId, organizationId: orgId, status: { not: 'removed' } },
    });
    if (!member) throw new AppError(404, 'Member not found');

    // Prevent removing self
    if (member.userId === actorId) {
      throw new AppError(400, 'Cannot remove yourself from the organization');
    }

    await prisma.orgMember.update({
      where: { id: memberId },
      data: { status: 'removed' },
    });

    await auditLog(orgId, actorId, 'org_member', memberId, 'removed', 'Member removed from organization');
  }
}

export const memberService = new MemberService();
