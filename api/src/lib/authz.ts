import type { OrgMemberRole } from '@prisma/client';
import { AppError } from './errors';

// Roles allowed to view/manage another member's bank accounts and mandates
// for support purposes. Deliberately excludes 'treasurer' — least privilege,
// they don't need cross-member financial-PII access.
const ELEVATED_ROLES: OrgMemberRole[] = ['organization_admin', 'platform_admin'];

/** Throws 403 unless the caller owns the target record or holds an elevated role. */
export function assertOwnerOrElevated(
  caller: { id: string; role: OrgMemberRole },
  targetOrgMemberId: string,
): void {
  if (caller.id === targetOrgMemberId || ELEVATED_ROLES.includes(caller.role)) return;
  throw new AppError(403, "Not authorized to access this member's records");
}
