import { Request, Response, NextFunction } from 'express';
import { organizationService } from './organization.service';
import { memberService } from './member.service';
import { invitationService } from '../invitations/invitation.service';

// Express 5 types req.params values as string | string[] — cast once per handler
const params = (req: Request) => req.params as Record<string, string>;

export const organizationController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const org = await organizationService.create(req.user!.id, req.body);
      res.status(201).json({ organization: org });
    } catch (err) { next(err); }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const memberships = await organizationService.listForUser(req.user!.id);
      res.json({ organizations: memberships });
    } catch (err) { next(err); }
  },

  async listAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizations = await organizationService.listAll();
      res.json({ organizations });
    } catch (err) { next(err); }
  },

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const org = await organizationService.findById(params(req).orgId);
      res.json({ organization: org, membership: req.orgMembership });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const org = await organizationService.update(params(req).orgId, req.user!.id, req.body);
      res.json({ organization: org });
    } catch (err) { next(err); }
  },
};

export const memberController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const members = await memberService.list(params(req).orgId);
      res.json({ members });
    } catch (err) { next(err); }
  },

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, memberId } = params(req);
      const member = await memberService.findById(orgId, memberId);
      res.json({ member });
    } catch (err) { next(err); }
  },

  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, memberId } = params(req);
      const member = await memberService.updateRole(orgId, memberId, req.user!.id, req.body);
      res.json({ member });
    } catch (err) { next(err); }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, memberId } = params(req);
      const member = await memberService.updateStatus(orgId, memberId, req.user!.id, req.body);
      res.json({ member });
    } catch (err) { next(err); }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, memberId } = params(req);
      await memberService.remove(orgId, memberId, req.user!.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};

export const orgInvitationController = {
  async send(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const inv = await invitationService.send(params(req).orgId, req.user!.id, req.body);
      res.status(201).json({ invitation: inv });
    } catch (err) { next(err); }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitations = await invitationService.list(params(req).orgId);
      res.json({ invitations });
    } catch (err) { next(err); }
  },

  async resend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, invitationId } = params(req);
      await invitationService.resend(orgId, invitationId, req.user!.id);
      res.json({ message: 'Invitation resent' });
    } catch (err) { next(err); }
  },

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, invitationId } = params(req);
      await invitationService.cancel(orgId, invitationId, req.user!.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
