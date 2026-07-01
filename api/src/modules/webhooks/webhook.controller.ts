import { Request, Response, NextFunction } from 'express';
import { webhookService } from './webhook.service';
import { AppError } from '../../lib/errors';
import { logger } from '../../lib/logger';

export const webhookController = {
  async nomba(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawBody = req.body as Buffer;
      if (!Buffer.isBuffer(rawBody)) {
        return next(new AppError(400, 'Expected raw body for webhook'));
      }

      const signature = req.headers['nomba-signature'] as string ?? '';
      const timestamp = req.headers['nomba-timestamp'] as string ?? '';

      await webhookService.processNomba(rawBody, signature, timestamp);

      // Always respond 200 after durability write — processing happens asynchronously
      res.status(200).json({ received: true });
    } catch (err: unknown) {
      if (err instanceof Error && 'statusCode' in err && (err as { statusCode: number }).statusCode === 401) {
        logger.warn('Webhook: signature verification failed');
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }
      next(err);
    }
  },
};
