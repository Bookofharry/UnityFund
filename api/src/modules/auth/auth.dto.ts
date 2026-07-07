import { z } from 'zod';

export const RegisterDto = z.object({
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
});

export const LoginDto = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export const PasswordResetRequestDto = z.object({
  email: z.string().email().toLowerCase(),
});

export const PasswordResetConfirmDto = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const RefreshTokenDto = z.object({
  refreshToken: z.string().min(1),
});

export const LogoutDto = z.object({
  refreshToken: z.string().min(1).optional(),
});

export type RegisterDtoType = z.infer<typeof RegisterDto>;
export type LoginDtoType = z.infer<typeof LoginDto>;
export type PasswordResetRequestDtoType = z.infer<typeof PasswordResetRequestDto>;
export type PasswordResetConfirmDtoType = z.infer<typeof PasswordResetConfirmDto>;
export type RefreshTokenDtoType = z.infer<typeof RefreshTokenDto>;
export type LogoutDtoType = z.infer<typeof LogoutDto>;
