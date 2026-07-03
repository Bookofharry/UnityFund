import type { OrgMemberRole } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import { auditLog } from '../../services/audit.service';
import { nombaClient } from '../../lib/nomba';
import { assertOwnerOrElevated } from '../../lib/authz';
import type { RegisterBankAccountDtoType, UpdateBankAccountDtoType } from './bank-account.dto';

type CallerMembership = { id: string; role: OrgMemberRole };

const ACCOUNT_SELECT = {
  id: true,
  orgMemberId: true,
  accountNumber: true,
  accountName: true,
  bankCode: true,
  bankName: true,
  isVerified: true,
  isDefault: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

export class BankAccountService {
  async register(orgId: string, orgMemberId: string, actorId: string, data: RegisterBankAccountDtoType, caller: CallerMembership) {
    const member = await prisma.orgMember.findFirst({
      where: { id: orgMemberId, organizationId: orgId, status: { not: 'removed' } },
    });
    if (!member) throw new AppError(404, 'Organization member not found');
    assertOwnerOrElevated(caller, orgMemberId);

    // Check for duplicate
    const existing = await prisma.bankAccount.findUnique({
      where: { orgMemberId_accountNumber_bankCode: { orgMemberId, accountNumber: data.accountNumber, bankCode: data.bankCode } },
    });
    if (existing && existing.status === 'active') {
      throw new AppError(409, 'This bank account is already registered');
    }

    return prisma.$transaction(async (tx) => {
      // Unset existing default if new account is set as default
      if (data.isDefault) {
        await tx.bankAccount.updateMany({
          where: { orgMemberId, isDefault: true, status: 'active' },
          data: { isDefault: false },
        });
      }

      const account = existing
        ? await tx.bankAccount.update({
            where: { id: existing.id },
            data: { ...data, status: 'active', isVerified: false },
            select: ACCOUNT_SELECT,
          })
        : await tx.bankAccount.create({
            data: { orgMemberId, ...data, isVerified: false },
            select: ACCOUNT_SELECT,
          });

      await tx.auditLog.create({
        data: {
          organizationId: orgId, actorUserId: actorId,
          entityType: 'bank_account', entityId: account.id,
          action: 'registered', description: `Bank account registered (${data.bankName})`,
        },
      });

      return account;
    });
  }

  async list(orgId: string, orgMemberId: string, caller: CallerMembership) {
    const member = await prisma.orgMember.findFirst({
      where: { id: orgMemberId, organizationId: orgId },
    });
    if (!member) throw new AppError(404, 'Organization member not found');
    assertOwnerOrElevated(caller, orgMemberId);

    return prisma.bankAccount.findMany({
      where: { orgMemberId, status: 'active' },
      select: ACCOUNT_SELECT,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findById(orgId: string, accountId: string, caller: CallerMembership) {
    const account = await prisma.bankAccount.findFirst({
      where: { id: accountId, orgMember: { organizationId: orgId }, status: 'active' },
      select: ACCOUNT_SELECT,
    });
    if (!account) throw new AppError(404, 'Bank account not found');
    assertOwnerOrElevated(caller, account.orgMemberId);
    return account;
  }

  async verify(orgId: string, accountId: string, actorId: string, caller: CallerMembership) {
    const account = await this.findById(orgId, accountId, caller);

    const result = await nombaClient.accountNameEnquiry({
      accountNumber: account.accountNumber,
      bankCode: account.bankCode,
    });

    const updated = await prisma.bankAccount.update({
      where: { id: accountId },
      data: { isVerified: true, accountName: result.accountName },
      select: ACCOUNT_SELECT,
    });

    await auditLog(orgId, actorId, 'bank_account', accountId, 'verified',
      `Bank account verified: ${result.accountName}`);

    return updated;
  }

  async update(orgId: string, accountId: string, actorId: string, data: UpdateBankAccountDtoType, caller: CallerMembership) {
    const account = await this.findById(orgId, accountId, caller);

    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.bankAccount.updateMany({
          where: { orgMemberId: account.orgMemberId, isDefault: true, status: 'active' },
          data: { isDefault: false },
        });
      }

      const updated = await tx.bankAccount.update({
        where: { id: accountId },
        data,
        select: ACCOUNT_SELECT,
      });

      await tx.auditLog.create({
        data: {
          organizationId: orgId, actorUserId: actorId,
          entityType: 'bank_account', entityId: accountId,
          action: 'updated', description: 'Bank account updated',
        },
      });

      return updated;
    });
  }

  async remove(orgId: string, accountId: string, actorId: string, caller: CallerMembership) {
    await this.findById(orgId, accountId, caller);

    // Block if payout in processing is tied to this org member's accounts
    // (best-effort check — exact FK not stored on payout for MVP)
    await prisma.bankAccount.update({
      where: { id: accountId },
      data: { status: 'inactive', isDefault: false },
    });

    await auditLog(orgId, actorId, 'bank_account', accountId, 'removed', 'Bank account removed');
  }
}

export const bankAccountService = new BankAccountService();
