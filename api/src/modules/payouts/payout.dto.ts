import { z } from 'zod';

export const CreatePayoutDto = z.object({
  recipientFundMemberId: z.string().uuid(),
  amount: z.number().int().positive('Amount must be a positive integer in Kobo'),
  reason: z.string().min(1).max(500).optional(),
});

export const ApprovePayoutDto = z.object({
  note: z.string().max(500).optional(),
});

export type CreatePayoutDtoType = z.infer<typeof CreatePayoutDto>;
export type ApprovePayoutDtoType = z.infer<typeof ApprovePayoutDto>;
