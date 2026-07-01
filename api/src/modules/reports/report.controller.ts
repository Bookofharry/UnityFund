import { Request, Response, NextFunction } from 'express';
import { reportService } from './report.service';

const p = (req: Request) => req.params as Record<string, string>;

export const reportController = {
  async dashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await reportService.orgDashboard(p(req).orgId);
      res.json(data);
    } catch (err) { next(err); }
  },

  async cycleReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, cycleId } = p(req);
      const data = await reportService.cycleSummaryReport(orgId, cycleId);
      res.json(data);
    } catch (err) { next(err); }
  },

  async fundSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await reportService.fundSummary(p(req).orgId);
      res.json({ funds: data });
    } catch (err) { next(err); }
  },

  async memberHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, memberId } = p(req);
      const data = await reportService.memberHistory(orgId, memberId);
      res.json(data);
    } catch (err) { next(err); }
  },
};
