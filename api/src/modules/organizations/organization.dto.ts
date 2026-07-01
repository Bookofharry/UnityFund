import { z } from 'zod';
import { OrganizationType, OrgMemberRole, OrgMemberStatus } from '@prisma/client';

export const CreateOrganizationDto = z.object({
  name: z.string().min(1).max(200).trim(),
  organizationType: z.nativeEnum(OrganizationType),
  email: z.string().email().toLowerCase(),
  phone: z.string().optional(),
});

export const UpdateOrganizationDto = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  email: z.string().email().toLowerCase().optional(),
  phone: z.string().optional(),
});

// Roles that can be assigned to members (platform_admin cannot be assigned via API)
const assignableRoles = [
  OrgMemberRole.member,
  OrgMemberRole.treasurer,
  OrgMemberRole.approver,
  OrgMemberRole.organization_admin,
] as const;

export const InviteMemberDto = z.object({
  email: z.string().email().toLowerCase(),
  role: z.enum(assignableRoles),
});

export const UpdateMemberRoleDto = z.object({
  role: z.enum(assignableRoles),
});

export const UpdateMemberStatusDto = z.object({
  status: z.enum([
    OrgMemberStatus.active,
    OrgMemberStatus.inactive,
    OrgMemberStatus.suspended,
  ]),
});

export type CreateOrganizationDtoType = z.infer<typeof CreateOrganizationDto>;
export type UpdateOrganizationDtoType = z.infer<typeof UpdateOrganizationDto>;
export type InviteMemberDtoType = z.infer<typeof InviteMemberDto>;
export type UpdateMemberRoleDtoType = z.infer<typeof UpdateMemberRoleDto>;
export type UpdateMemberStatusDtoType = z.infer<typeof UpdateMemberStatusDto>;
