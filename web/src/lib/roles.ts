export type Role = 'member' | 'treasurer' | 'approver' | 'organization_admin' | 'platform_admin';

export const ORG_MANAGER_ROLES: Role[] = ['organization_admin', 'platform_admin'];
export const FINANCE_ROLES: Role[] = ['organization_admin', 'treasurer', 'platform_admin'];
export const APPROVER_ROLES: Role[] = ['approver', 'organization_admin', 'platform_admin'];
export const EXECUTOR_ROLES: Role[] = ['treasurer', 'organization_admin', 'platform_admin'];

export function hasRole(role: string | undefined | null, allowed: Role[]): boolean {
  return !!role && allowed.includes(role as Role);
}
