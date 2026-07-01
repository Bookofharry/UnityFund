import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';

export function requireOrgMember(paramName = 'orgId') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.params[paramName] as string;
      if (!orgId) return next(new AppError(400, 'Organization ID required'));

      const membership = await prisma.orgMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: orgId,
            userId: req.user!.id,
          },
        },
        select: { id: true, role: true, status: true, organizationId: true, userId: true },
      });

      if (!membership || membership.status !== 'active') {
        return next(new AppError(403, 'Access denied — not a member of this organization'));
      }

      req.orgMembership = membership;
      next();
    } catch (err) {
      next(err);
    }
  };
}
