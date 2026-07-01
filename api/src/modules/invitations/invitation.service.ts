import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import { auditLog } from '../../services/audit.service';
import { generateSecureToken, sha256, hashPassword } from '../../lib/hash';
import { sendInvitationEmail } from '../../lib/email';
import { env } from '../../config/env';
import type { SendInvitationDtoType, AcceptInvitationDtoType } from './invitation.dto';

export class InvitationService {
  async send(orgId: string, invitedByUserId: string, data: SendInvitationDtoType) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true },
    });
    if (!org) throw new AppError(404, 'Organization not found');

    // Check for existing pending invite (partial unique index in DB enforces this too)
    const existing = await prisma.invitation.findFirst({
      where: { organizationId: orgId, email: data.email, status: 'pending' },
    });
    if (existing) {
      throw new AppError(409, 'A pending invitation already exists for this email', 'INVITE_EXISTS');
    }

    // Check if email is already a member
    const existingMember = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        orgMemberships: {
          where: { organizationId: orgId, status: { not: 'removed' } },
          select: { id: true },
        },
      },
    });
    if (existingMember?.orgMemberships.length) {
      throw new AppError(409, 'This user is already a member of the organization');
    }

    const rawToken = generateSecureToken();
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + env.INVITATION_EXPIRES_HOURS * 60 * 60 * 1000);

    const invitation = await prisma.invitation.create({
      data: {
        organizationId: orgId,
        invitedByUserId,
        email: data.email,
        role: data.role,
        tokenHash,
        expiresAt,
      },
      select: { id: true, email: true, role: true, expiresAt: true, status: true, createdAt: true },
    });

    const inviteUrl = `${env.APP_URL}/invite/${rawToken}`;
    console.log(`[INVITE] ${data.email} → ${inviteUrl}`);
    await auditLog(orgId, invitedByUserId, 'invitation', invitation.id, 'sent',
      `Invitation sent to ${data.email} with role ${data.role}`);

    return invitation;
  }

  async validate(token: string) {
    const tokenHash = sha256(token);
    const invitation = await prisma.invitation.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        organization: { select: { id: true, name: true } },
      },
    });

    if (!invitation) throw new AppError(404, 'Invitation not found');
    if (invitation.status === 'accepted') throw new AppError(410, 'Invitation already accepted');
    if (invitation.status === 'cancelled') throw new AppError(410, 'Invitation has been cancelled');
    if (invitation.expiresAt < new Date()) throw new AppError(410, 'Invitation has expired');

    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
      select: { id: true },
    });

    return { ...invitation, requiresRegistration: !existingUser };
  }

  async accept(token: string, data: AcceptInvitationDtoType, authenticatedUserId?: string) {
    const tokenHash = sha256(token);

    const invitation = await prisma.invitation.findUnique({
      where: { tokenHash },
      select: { id: true, email: true, role: true, status: true, expiresAt: true, organizationId: true },
    });

    if (!invitation) throw new AppError(404, 'Invitation not found');
    if (invitation.status === 'accepted') throw new AppError(410, 'Invitation already accepted');
    if (invitation.status === 'cancelled') throw new AppError(410, 'Invitation has been cancelled');
    if (invitation.expiresAt < new Date()) throw new AppError(410, 'Invitation has expired');

    return prisma.$transaction(async (tx) => {
      let userId: string;
      let isNewUser = false;

      if (authenticatedUserId) {
        // Case A: link existing authenticated user
        const user = await tx.user.findUnique({ where: { id: authenticatedUserId } });
        if (!user) throw new AppError(401, 'Authenticated user not found');
        userId = user.id;
      } else {
        // Case B: register new user
        if (!data.firstName || !data.lastName || !data.password) {
          throw new AppError(400, 'firstName, lastName and password are required for new users',
            'REGISTRATION_REQUIRED');
        }

        // Check if email already has an account (must use Case A)
        const existing = await tx.user.findUnique({ where: { email: invitation.email } });
        if (existing) {
          throw new AppError(409, 'An account with this email already exists. Please log in to accept.',
            'USE_LOGIN');
        }

        const passwordHash = await hashPassword(data.password);
        const user = await tx.user.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: invitation.email,
            passwordHash,
          },
        });
        userId = user.id;
        isNewUser = true;
      }

      // Create org membership
      const existing = await tx.orgMember.findUnique({
        where: { organizationId_userId: { organizationId: invitation.organizationId, userId } },
      });
      if (existing && existing.status !== 'removed') {
        throw new AppError(409, 'User is already a member of this organization');
      }

      const membership = existing
        ? await tx.orgMember.update({
            where: { id: existing.id },
            data: { role: invitation.role, status: 'active' },
            select: { id: true, role: true, organizationId: true },
          })
        : await tx.orgMember.create({
            data: { organizationId: invitation.organizationId, userId, role: invitation.role },
            select: { id: true, role: true, organizationId: true },
          });

      // Mark invitation as accepted
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: 'accepted', acceptedAt: new Date() },
      });

      await tx.auditLog.create({
        data: {
          organizationId: invitation.organizationId,
          actorUserId: userId,
          entityType: 'invitation',
          entityId: invitation.id,
          action: 'accepted',
          description: `Invitation accepted by ${invitation.email}`,
          metadata: { isNewUser },
        },
      });

      return { membership, userId, isNewUser };
    });
  }

  async list(orgId: string) {
    return prisma.invitation.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        acceptedAt: true,
        createdAt: true,
        invitedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resend(orgId: string, invitationId: string, actorId: string) {
    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId, organizationId: orgId },
      select: { id: true, email: true, role: true, status: true },
    });
    if (!invitation) throw new AppError(404, 'Invitation not found');
    if (invitation.status !== 'pending') {
      throw new AppError(400, `Cannot resend a ${invitation.status} invitation`);
    }

    const rawToken = generateSecureToken();
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + env.INVITATION_EXPIRES_HOURS * 60 * 60 * 1000);

    await prisma.invitation.update({
      where: { id: invitationId },
      data: { tokenHash, expiresAt },
    });

    const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } });
    const inviteUrl = `${env.APP_URL}/invite/${rawToken}`;
    console.log(`[INVITE RESEND] ${invitation.email} → ${inviteUrl}`);
    await auditLog(orgId, actorId, 'invitation', invitationId, 'resent',
      `Invitation resent to ${invitation.email}`);
  }

  async cancel(orgId: string, invitationId: string, actorId: string) {
    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId, organizationId: orgId },
    });
    if (!invitation) throw new AppError(404, 'Invitation not found');
    if (invitation.status !== 'pending') {
      throw new AppError(400, `Cannot cancel a ${invitation.status} invitation`);
    }

    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'cancelled' },
    });

    await auditLog(orgId, actorId, 'invitation', invitationId, 'cancelled',
      `Invitation to ${invitation.email} cancelled`);
  }
}

export const invitationService = new InvitationService();
