import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';

const p = (req: Request) => req.params as Record<string, string>;

// Finance/admin roles keep org-wide visibility for tracking collections;
// everyone else (member) only ever sees their own payment history.
const ELEVATED_ROLES = ['organization_admin', 'treasurer', 'platform_admin'];

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
      const membership = req.orgMembership!;
      const isElevated = ELEVATED_ROLES.includes(membership.role);
      const payments = await paymentService.list(orgId, {
        fundId,
        contributionId,
        restrictToOrgMemberId: isElevated ? undefined : membership.id,
      });
      res.json({ payments });
    } catch (err) { next(err); }
  },

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const membership = req.orgMembership!;
      const isElevated = ELEVATED_ROLES.includes(membership.role);
      const payment = await paymentService.findById(
        p(req).orgId,
        p(req).paymentId,
        isElevated ? undefined : membership.id,
      );
      res.json({ payment });
    } catch (err) { next(err); }
  },
};
