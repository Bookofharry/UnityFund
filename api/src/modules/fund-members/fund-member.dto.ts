import { z } from 'zod';

export const EnrollFundMemberDto = z.object({
  orgMemberId: z.string().uuid('Must be a valid org member ID'),
  rotationPosition: z.number().int().positive().optional(),
});

export const UpdateFundMemberDto = z.object({
  rotationPosition: z.number().int().positive().nullable(),
});

export type EnrollFundMemberDtoType = z.infer<typeof EnrollFundMemberDto>;
export type UpdateFundMemberDtoType = z.infer<typeof UpdateFundMemberDto>;
