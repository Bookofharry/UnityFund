import { z } from 'zod';
import { OrgMemberRole } from '@prisma/client';

const assignableRoles = [
  OrgMemberRole.member,
  OrgMemberRole.treasurer,
  OrgMemberRole.organization_admin,
] as const;

export const SendInvitationDto = z.object({
  email: z.string().email().toLowerCase(),
  role: z.enum(assignableRoles),
});

// Case A: authenticated user — body can be empty
// Case B: new user — firstName, lastName, password required (validated at service layer)
export const AcceptInvitationDto = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  password: z.string().min(8).optional(),
});

export type SendInvitationDtoType = z.infer<typeof SendInvitationDto>;
export type AcceptInvitationDtoType = z.infer<typeof AcceptInvitationDto>;
