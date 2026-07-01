import { Request, Response, NextFunction } from 'express';
import { OrgMemberRole } from '@prisma/client';
import { AppError } from '../lib/errors';

export function requireRole(...roles: OrgMemberRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const membership = req.orgMembership;
    if (!membership) {
      return next(new AppError(403, 'Organization context required'));
    }
    if (!roles.includes(membership.role)) {
      return next(new AppError(403, `Required role: ${roles.join(' or ')}`));
    }
    next();
  };
}
