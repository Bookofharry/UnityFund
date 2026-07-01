import { prisma } from '../../lib/prisma';
import { hashPassword, comparePassword, generateSecureToken, sha256 } from '../../lib/hash';
import { signAccessToken } from '../../lib/jwt';
import { sendPasswordResetEmail } from '../../lib/email';
import { AppError } from '../../lib/errors';
import { env } from '../../config/env';
import { logger } from '../../lib/logger';
import type {
  RegisterDtoType,
  LoginDtoType,
  PasswordResetRequestDtoType,
  PasswordResetConfirmDtoType,
} from './auth.dto';

export class AuthService {
  async register(data: RegisterDtoType) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError(409, 'Email already registered', 'EMAIL_TAKEN');
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        phone: data.phone,
      },
      select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
    });

    const accessToken = signAccessToken({ sub: user.id, email: user.email });

    return { user, accessToken };
  }

  async login(data: LoginDtoType) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    // Constant-time comparison to prevent timing attacks
    if (!user) {
      await comparePassword(data.password, '$2b$12$invalidhashpadding000000000000000000000');
      throw new AppError(401, 'Invalid email or password');
    }

    const valid = await comparePassword(data.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new AppError(403, 'Account is inactive');
    }

    const accessToken = signAccessToken({ sub: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        createdAt: true,
        orgMemberships: {
          where: { status: 'active' },
          select: {
            id: true,
            role: true,
            joinedAt: true,
            organization: {
              select: { id: true, name: true, organizationType: true, status: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }

  async requestPasswordReset(data: PasswordResetRequestDtoType) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    // Always return success to prevent email enumeration
    if (!user || user.status !== 'active') {
      return;
    }

    // Invalidate any existing tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const rawToken = generateSecureToken();
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_EXPIRES_HOURS * 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const resetUrl = `${env.APP_URL}/reset-password?token=${rawToken}`;

    logger.info({ userId: user.id, resetUrl }, 'Password reset requested');
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  async confirmPasswordReset(data: PasswordResetConfirmDtoType) {
    const tokenHash = sha256(data.token);

    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new AppError(400, 'Invalid or expired reset token');
    }

    const newPasswordHash = await hashPassword(data.newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);
  }
}

export const authService = new AuthService();
