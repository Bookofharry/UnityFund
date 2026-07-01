import { Request, Response, NextFunction } from 'express';
import { invitationService } from './invitation.service';
import { verifyAccessToken } from '../../lib/jwt';
import { signAccessToken } from '../../lib/jwt';
import { prisma } from '../../lib/prisma';

const params = (req: Request) => req.params as Record<string, string>;

export const invitationController = {
  async validate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitation = await invitationService.validate(params(req).token);
      res.json({ invitation });
    } catch (err) { next(err); }
  },

  async accept(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let authenticatedUserId: string | undefined;
      const authHeader = req.headers.authorization;

      if (authHeader?.startsWith('Bearer ')) {
        try {
          const payload = verifyAccessToken(authHeader.slice(7));
          const user = await prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, status: true },
          });
          if (user?.status === 'active') authenticatedUserId = user.id;
        } catch {
          // Invalid token — treat as unauthenticated (Case B)
        }
      }

      const result = await invitationService.accept(params(req).token, req.body, authenticatedUserId);

      const user = await prisma.user.findUnique({
        where: { id: result.userId },
        select: { id: true, email: true, firstName: true, lastName: true },
      });

      const accessToken = signAccessToken({ sub: result.userId, email: user!.email });

      res.json({
        message: 'Invitation accepted',
        accessToken,
        user,
        membership: result.membership,
        isNewUser: result.isNewUser,
      });
    } catch (err) { next(err); }
  },
};
