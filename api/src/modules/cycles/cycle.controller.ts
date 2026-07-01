import { Request, Response, NextFunction } from 'express';
import { collectionCycleService } from './cycle.service';

const p = (req: Request) => req.params as Record<string, string>;

export const cycleController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, fundId } = p(req);
      const cycle = await collectionCycleService.create(orgId, fundId, req.user!.id, req.body);
      res.status(201).json({ cycle });
    } catch (err) { next(err); }
  },
  async start(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, fundId, cycleId } = p(req);
      const cycle = await collectionCycleService.start(orgId, fundId, cycleId, req.user!.id);
      res.json({ cycle });
    } catch (err) { next(err); }
  },
  async close(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, fundId, cycleId } = p(req);
      const cycle = await collectionCycleService.close(orgId, fundId, cycleId, req.user!.id);
      res.json({ cycle });
    } catch (err) { next(err); }
  },
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, fundId } = p(req);
      const cycles = await collectionCycleService.list(orgId, fundId);
      res.json({ cycles });
    } catch (err) { next(err); }
  },
  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, fundId, cycleId } = p(req);
      const cycle = await collectionCycleService.findById(orgId, fundId, cycleId);
      res.json({ cycle });
    } catch (err) { next(err); }
  },
};
