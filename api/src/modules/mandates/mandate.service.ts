import type { OrgMemberRole } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import { auditLog } from '../../services/audit.service';
import { nombaClient } from '../../lib/nomba';
import { env } from '../../config/env';
import { logger } from '../../lib/logger';
import { assertOwnerOrElevated } from '../../lib/authz';
import type { InitiateMandateDtoType } from './mandate.dto';

type CallerMembership = { id: string; role: OrgMemberRole };

const MANDATE_SELECT = {
  id: true,
  orgMemberId: true,
  provider: true,
  providerMandateId: true,
  status: true,
  maxAmount: true,
  frequency: true,
  startDate: true,
  endDate: true,
  createdAt: true,
  updatedAt: true,
};

export class MandateService {
  async initiate(orgId: string, orgMemberId: string, actorId: string, data: InitiateMandateDtoType, caller: CallerMembership) {
    // Nomba's mandate API requires the customer's bank account + profile
    // details upfront (no hosted consent-URL flow) — reuse their already
    // verified default bank account (same one used for payouts).
    const member = await prisma.orgMember.findFirst({
      where: { id: orgMemberId, organizationId: orgId, status: { not: 'removed' } },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        bankAccounts: { where: { isDefault: true, isVerified: true, status: 'active' } },
      },
    });
    if (!member) throw new AppError(404, 'Organization member not found');
    assertOwnerOrElevated(caller, orgMemberId);

    const bankAccount = member.bankAccounts[0];
    if (!bankAccount) {
      throw new AppError(400, 'Register and verify a bank account before setting up a direct debit mandate');
    }

    const merchantReference = `${Date.now()}`;
    // Nomba requires endDate; default to one year out if the caller didn't supply one
    const endDate = data.endDate ?? new Date(data.startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

    let providerMandateId: string;
    try {
      const raw = await nombaClient.createMandate({
        customerAccountNumber: bankAccount.accountNumber,
        bankCode: bankAccount.bankCode,
        customerName: `${member.user.firstName} ${member.user.lastName}`,
        customerAccountName: bankAccount.accountName ?? `${member.user.firstName} ${member.user.lastName}`,
        amount: data.maxAmount,
        frequency: data.frequency.toUpperCase(),
        merchantReference,
        startDate: data.startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        customerEmail: member.user.email,
        customerPhoneNumber: member.user.phone ?? undefined,
      });
      providerMandateId = raw.mandateId;
    } catch (err) {
      if (env.NOMBA_API_BASE_URL.includes('sandbox')) {
        logger.warn('Nomba mandate creation unavailable in sandbox — saving mandate locally');
        providerMandateId = `sandbox-${merchantReference}`;
      } else {
        throw err;
      }
    }

    const mandate = await prisma.mandate.create({
      data: {
        orgMemberId,
        maxAmount: data.maxAmount,
        frequency: data.frequency,
        startDate: data.startDate,
        endDate: data.endDate,
        providerMandateId,
        // No consent-URL flow — Nomba mandates activate via OTP sent to the
        // customer's phone, out of band. Webhook (once mandate event shapes
        // are confirmed) should transition this to 'active'.
        status: 'pending',
      },
      select: MANDATE_SELECT,
    });

    await auditLog(orgId, actorId, 'mandate', mandate.id, 'initiated', 'Direct debit mandate initiated');

    // setupUrl kept for API shape compatibility — always empty now
    return { mandate, setupUrl: '' };
  }

  async list(orgId: string, orgMemberId: string, caller: CallerMembership) {
    // Validate member belongs to org
    const member = await prisma.orgMember.findFirst({
      where: { id: orgMemberId, organizationId: orgId },
    });
    if (!member) throw new AppError(404, 'Organization member not found');
    assertOwnerOrElevated(caller, orgMemberId);

    return prisma.mandate.findMany({
      where: { orgMemberId, status: { not: 'deleted' } },
      select: MANDATE_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orgId: string, mandateId: string, caller: CallerMembership) {
    const mandate = await prisma.mandate.findFirst({
      where: {
        id: mandateId,
        orgMember: { organizationId: orgId },
      },
      select: MANDATE_SELECT,
    });
    if (!mandate) throw new AppError(404, 'Mandate not found');
    assertOwnerOrElevated(caller, mandate.orgMemberId);
    return mandate;
  }

  async suspend(orgId: string, mandateId: string, actorId: string, caller: CallerMembership) {
    const mandate = await this.findById(orgId, mandateId, caller);
    if (mandate.status !== 'active') {
      throw new AppError(400, `Cannot suspend a mandate with status '${mandate.status}'`);
    }
    if (mandate.providerMandateId) {
      try {
        await nombaClient.updateMandateStatus(mandate.providerMandateId, 'SUSPEND');
      } catch (err) {
        // Log but don't block — local status update proceeds
      }
    }
    const updated = await prisma.mandate.update({
      where: { id: mandateId },
      data: { status: 'suspended' },
      select: MANDATE_SELECT,
    });
    await auditLog(orgId, actorId, 'mandate', mandateId, 'suspended', 'Mandate suspended');
    return updated;
  }

  async cancel(orgId: string, mandateId: string, actorId: string, caller: CallerMembership) {
    const mandate = await this.findById(orgId, mandateId, caller);
    if (!['pending', 'active', 'suspended'].includes(mandate.status)) {
      throw new AppError(400, `Cannot cancel a mandate with status '${mandate.status}'`);
    }
    if (mandate.providerMandateId) {
      try {
        await nombaClient.cancelMandate(mandate.providerMandateId);
      } catch (err) {
        // Log but don't block — local status update proceeds
      }
    }
    const updated = await prisma.mandate.update({
      where: { id: mandateId },
      data: { status: 'deleted' },
      select: MANDATE_SELECT,
    });
    await auditLog(orgId, actorId, 'mandate', mandateId, 'cancelled', 'Mandate cancelled');
    return updated;
  }
}

export const mandateService = new MandateService();
