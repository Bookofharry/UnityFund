import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notification.service';

const p = (req: Request) => req.params as Record<string, string>;

export const notificationController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = await notificationService.list(req.user!.id);
      res.json({ notifications });
    } catch (err) { next(err); }
  },

  async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notification = await notificationService.markRead(req.user!.id, p(req).notificationId);
      res.json({ notification });
    } catch (err) { next(err); }
  },

  async markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await notificationService.markAllRead(req.user!.id);
      res.json(result);
    } catch (err) { next(err); }
  },
};
