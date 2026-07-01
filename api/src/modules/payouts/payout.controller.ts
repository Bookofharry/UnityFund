import { Request, Response, NextFunction } from 'express';
import { payoutService } from './payout.service';

const p = (req: Request) => req.params as Record<string, string>;

export const payoutController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, fundId } = p(req);
      const payout = await payoutService.create(orgId, fundId, req.user!.id, req.body);
      res.status(201).json({ payout });
    } catch (err) { next(err); }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId } = p(req);
      const { fundId } = req.query as Record<string, string>;
      const payouts = await payoutService.list(orgId, fundId);
      res.json({ payouts });
    } catch (err) { next(err); }
  },

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payout = await payoutService.findById(p(req).orgId, p(req).payoutId);
      res.json({ payout });
    } catch (err) { next(err); }
  },

  async approve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, payoutId } = p(req);
      const payout = await payoutService.approve(orgId, payoutId, req.user!.id, req.body.note);
      res.json({ payout });
    } catch (err) { next(err); }
  },

  async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, payoutId } = p(req);
      const payout = await payoutService.execute(orgId, payoutId, req.user!.id);
      res.json({ payout });
    } catch (err) { next(err); }
  },
};
