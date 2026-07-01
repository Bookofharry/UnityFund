import { Request, Response, NextFunction } from 'express';
import { fundMemberService } from './fund-member.service';

const p = (req: Request) => req.params as Record<string, string>;

export const fundMemberController = {
  async enroll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, fundId } = p(req);
      const member = await fundMemberService.enroll(orgId, fundId, req.user!.id, req.body);
      res.status(201).json({ member });
    } catch (err) { next(err); }
  },
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const members = await fundMemberService.list(p(req).fundId);
      res.json({ members });
    } catch (err) { next(err); }
  },
  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, fundId, fundMemberId } = p(req);
      const member = await fundMemberService.findById(orgId, fundId, fundMemberId);
      res.json({ member });
    } catch (err) { next(err); }
  },
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, fundId, fundMemberId } = p(req);
      await fundMemberService.remove(orgId, fundId, fundMemberId, req.user!.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
