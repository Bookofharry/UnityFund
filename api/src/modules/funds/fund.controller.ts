import { Request, Response, NextFunction } from 'express';
import { fundService } from './fund.service';

const params = (req: Request) => req.params as Record<string, string>;

export const fundController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fund = await fundService.create(params(req).orgId, req.user!.id, req.body);
      res.status(201).json({ fund });
    } catch (err) { next(err); }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const funds = await fundService.list(params(req).orgId);
      res.json({ funds });
    } catch (err) { next(err); }
  },

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, fundId } = params(req);
      const fund = await fundService.findById(orgId, fundId);
      res.json({ fund });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, fundId } = params(req);
      const fund = await fundService.update(orgId, fundId, req.user!.id, req.body);
      res.json({ fund });
    } catch (err) { next(err); }
  },

  async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, fundId } = params(req);
      await fundService.archive(orgId, fundId, req.user!.id);
      res.json({ message: 'Fund archived' });
    } catch (err) { next(err); }
  },

  async getRules(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, fundId } = params(req);
      const rules = await fundService.getRules(orgId, fundId);
      res.json({ rules });
    } catch (err) { next(err); }
  },

  async upsertRules(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, fundId } = params(req);
      const rules = await fundService.upsertRules(orgId, fundId, req.user!.id, req.body);
      res.json({ rules });
    } catch (err) { next(err); }
  },
};
