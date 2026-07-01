import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async logout(_req: Request, res: Response): Promise<void> {
    // JWT is stateless — client discards the token
    res.json({ message: 'Logged out successfully' });
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getMe(req.user!.id);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },

  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.requestPasswordReset(req.body);
      // Always 200 — never reveal whether email exists
      res.json({ message: 'If this email is registered, a reset link has been sent' });
    } catch (err) {
      next(err);
    }
  },

  async confirmPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.confirmPasswordReset(req.body);
      res.json({ message: 'Password reset successfully' });
    } catch (err) {
      next(err);
    }
  },
};
