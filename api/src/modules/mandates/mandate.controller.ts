import { Request, Response, NextFunction } from 'express';
import { mandateService } from './mandate.service';

const p = (req: Request) => req.params as Record<string, string>;

export const mandateController = {
  async initiate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, memberId } = p(req);
      const result = await mandateService.initiate(orgId, memberId, req.user!.id, req.body, req.orgMembership!);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, memberId } = p(req);
      const mandates = await mandateService.list(orgId, memberId, req.orgMembership!);
      res.json({ mandates });
    } catch (err) { next(err); }
  },
  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mandate = await mandateService.findById(p(req).orgId, p(req).mandateId, req.orgMembership!);
      res.json({ mandate });
    } catch (err) { next(err); }
  },
  async suspend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mandate = await mandateService.suspend(p(req).orgId, p(req).mandateId, req.user!.id, req.orgMembership!);
      res.json({ mandate });
    } catch (err) { next(err); }
  },
  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mandate = await mandateService.cancel(p(req).orgId, p(req).mandateId, req.user!.id, req.orgMembership!);
      res.json({ mandate });
    } catch (err) { next(err); }
  },
};
