import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import { auditLog } from '../../services/audit.service';
import type { CreateOrganizationDtoType, UpdateOrganizationDtoType } from './organization.dto';

const ORG_SELECT = {
  id: true,
  name: true,
  organizationType: true,
  email: true,
  phone: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

export class OrganizationService {
  async create(userId: string, data: CreateOrganizationDtoType) {
    const { org, membership } = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({ data, select: ORG_SELECT });
      const membership = await tx.orgMember.create({
        data: { organizationId: org.id, userId, role: 'organization_admin' },
        select: { id: true, role: true },
      });
      return { org, membership };
    });

    await auditLog(org.id, userId, 'organization', org.id, 'created', `Organization "${org.name}" created`);

    return { ...org, membership };
  }

  async listForUser(userId: string) {
    const memberships = await prisma.orgMember.findMany({
      where: { userId, status: 'active' },
      select: {
        id: true,
        role: true,
        joinedAt: true,
        organization: { select: ORG_SELECT },
      },
      orderBy: { joinedAt: 'desc' },
    });
    return memberships;
  }

  async findById(orgId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        ...ORG_SELECT,
        _count: { select: { members: { where: { status: 'active' } }, funds: true } },
      },
    });
    if (!org) throw new AppError(404, 'Organization not found');
    return org;
  }

  async update(orgId: string, actorId: string, data: UpdateOrganizationDtoType) {
    const org = await prisma.organization.update({
      where: { id: orgId },
      data,
      select: ORG_SELECT,
    });
    await auditLog(orgId, actorId, 'organization', orgId, 'updated', 'Organization details updated', data);
    return org;
  }
}

export const organizationService = new OrganizationService();
