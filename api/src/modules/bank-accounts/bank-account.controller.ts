import { Request, Response, NextFunction } from 'express';
import { bankAccountService } from './bank-account.service';

const p = (req: Request) => req.params as Record<string, string>;

export const bankAccountController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId, memberId } = p(req);
      const account = await bankAccountService.register(orgId, memberId, req.user!.id, req.body);
      res.status(201).json({ account });
    } catch (err) { next(err); }
  },
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accounts = await bankAccountService.list(p(req).orgId, p(req).memberId);
      res.json({ accounts });
    } catch (err) { next(err); }
  },
  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const account = await bankAccountService.findById(p(req).orgId, p(req).accountId);
      res.json({ account });
    } catch (err) { next(err); }
  },
  async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const account = await bankAccountService.verify(p(req).orgId, p(req).accountId, req.user!.id);
      res.json({ account });
    } catch (err) { next(err); }
  },
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const account = await bankAccountService.update(p(req).orgId, p(req).accountId, req.user!.id, req.body);
      res.json({ account });
    } catch (err) { next(err); }
  },
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await bankAccountService.remove(p(req).orgId, p(req).accountId, req.user!.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
