import { z } from 'zod';

export const RegisterBankAccountDto = z.object({
  accountNumber: z.string().min(10).max(10, 'Account number must be exactly 10 digits'),
  bankCode: z.string().min(3).max(10),
  bankName: z.string().min(1).max(100),
  isDefault: z.boolean().default(false),
});

export const UpdateBankAccountDto = z.object({
  isDefault: z.boolean(),
});

export type RegisterBankAccountDtoType = z.infer<typeof RegisterBankAccountDto>;
export type UpdateBankAccountDtoType = z.infer<typeof UpdateBankAccountDto>;
