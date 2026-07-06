import { Request, Response, NextFunction } from 'express';
import { contributionService } from './contribution.service';

const p = (req: Request) => req.params as Record<string, string>;

// Finance/admin roles keep org-wide visibility for tracking collections;
// everyone else (member) only ever sees their own contributions.
const ELEVATED_ROLES = ['organization_admin', 'treasurer', 'platform_admin'];

export const contributionController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId } = p(req);
      const { fundId, cycleId, memberId, status } = req.query as Record<string, string>;
      const membership = req.orgMembership!;
      const isElevated = ELEVATED_ROLES.includes(membership.role);
      const contributions = await contributionService.list({
        orgId,
        fundId,
        cycleId,
        status,
        memberId: isElevated ? memberId : undefined,
        restrictToOrgMemberId: isElevated ? undefined : membership.id,
      });
      res.json({ contributions });
    } catch (err) { next(err); }
  },

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const membership = req.orgMembership!;
      const isElevated = ELEVATED_ROLES.includes(membership.role);
      const contribution = await contributionService.findById(
        p(req).orgId,
        p(req).contributionId,
        isElevated ? undefined : membership.id,
      );
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
