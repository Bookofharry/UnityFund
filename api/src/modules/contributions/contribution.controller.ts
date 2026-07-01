import { Request, Response, NextFunction } from 'express';
import { contributionService } from './contribution.service';

const p = (req: Request) => req.params as Record<string, string>;

export const contributionController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId } = p(req);
      const { fundId, cycleId, memberId, status } = req.query as Record<string, string>;
      const contributions = await contributionService.list({ orgId, fundId, cycleId, memberId, status });
      res.json({ contributions });
    } catch (err) { next(err); }
  },

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contribution = await contributionService.findById(p(req).orgId, p(req).contributionId);
      res.json({ contribution });
    } catch (err) { next(err); }
  },

  async cycleSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, cycleId } = p(req);
      const summary = await contributionService.cycleSummary(orgId, cycleId);
      res.json({ summary });
    } catch (err) { next(err); }
  },
};
