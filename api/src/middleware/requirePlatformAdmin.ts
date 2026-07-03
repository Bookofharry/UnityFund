import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';

export async function requirePlatformAdmin(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const membership = await prisma.orgMember.findFirst({
      where: { userId: req.user!.id, role: 'platform_admin', status: 'active' },
      select: { id: true },
    });

    if (!membership) {
      return next(new AppError(403, 'Platform admin access required'));
    }

    next();
  } catch (err) {
    next(err);
  }
}
