import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';

const p = (req: Request) => req.params as Record<string, string>;

export const paymentController = {
  async initiate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, contributionId } = p(req);
      const result = await paymentService.initiate(orgId, contributionId, req.user!.id, req.body);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId } = p(req);
      const { fundId, contributionId } = req.query as Record<string, string>;
      const payments = await paymentService.list(orgId, { fundId, contributionId });
      res.json({ payments });
    } catch (err) { next(err); }
  },

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payment = await paymentService.findById(p(req).orgId, p(req).paymentId);
      res.json({ payment });
    } catch (err) { next(err); }
  },
};
