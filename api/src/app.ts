import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './lib/logger';
import { AppError } from './lib/errors';
import { NombaError } from './lib/nomba';
import { requestId } from './middleware/requestId';
import { apiLimiter, authLimiter, invitationLimiter, webhookLimiter } from './middleware/rateLimits';
import { authRouter } from './modules/auth/auth.router';
import { organizationRouter } from './modules/organizations/organization.router';
import { invitationRouter } from './modules/invitations/invitation.router';
import { paymentListRouter } from './modules/payments/payment.router';
import { webhookRouter } from './modules/webhooks/webhook.router';
import { notificationRouter } from './modules/notifications/notification.router';

export function createApp() {
  const app = express();

  // Express auto-generates ETags on res.json() by default. When the browser's
  // body cache for a prior response gets evicted but it still remembers the
  // ETag, a conditional GET comes back as 304 with NO body — axios then reads
  // r.data as undefined and crashes (e.g. r.data.bankAccounts). This is a
  // dynamic JSON API, not static assets, so conditional caching isn't useful
  // here — disable it entirely.
  app.disable('etag');

  // ─── Security headers ─────────────────────────────────────────────────────
  app.use(helmet());

  // ─── CORS ─────────────────────────────────────────────────────────────────
  // Vite auto-increments its port whenever the configured one is already in
  // use (3000 -> 3001 -> ...), which silently breaks a hardcoded single-origin
  // allowlist in local dev. Production stays locked to the exact configured
  // origin — this relaxation only applies below production.
  app.use(
    cors({
      origin:
        env.NODE_ENV === 'production'
          ? env.CORS_ORIGIN
          : (origin, callback) => {
              if (!origin || origin === env.CORS_ORIGIN || /^http:\/\/localhost:\d+$/.test(origin)) {
                return callback(null, true);
              }
              callback(new Error(`CORS: origin ${origin} not allowed`));
            },
      credentials: true,
    }),
  );

  // ─── Request ID (attach before logging so every log line carries it) ──────
  app.use(requestId);

  // ─── Request logging ──────────────────────────────────────────────────────
  app.use(pinoHttp({
    logger,
    genReqId: (req) => (req as express.Request).id,
    // Only log method, url, status, responseTime — suppress full headers
    serializers: {
      req: (req) => ({ id: req.id, method: req.method, url: req.url }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  }));

  // ─── Raw body capture (required for webhook signature verification) ────────
  // MUST come before express.json() — webhook handlers need the raw buffer
  app.use('/api/webhooks', express.raw({ type: 'application/json' }));

  // ─── JSON body parser ─────────────────────────────────────────────────────
  app.use(express.json());

  // ─── Health check ─────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ─── API routes (rate limiters applied per-router) ────────────────────────
  app.use('/api/auth', authLimiter, authRouter);
  app.use('/api/organizations', apiLimiter, organizationRouter);
  app.use('/api/invitations', invitationLimiter, invitationRouter);
  app.use('/api/organizations/:orgId/payments', apiLimiter, paymentListRouter);
  app.use('/api/webhooks', webhookLimiter, webhookRouter);
  app.use('/api/notifications', apiLimiter, notificationRouter);

  // ─── 404 handler ─────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // ─── Global error handler ─────────────────────────────────────────────────
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof AppError) {
      const body: Record<string, unknown> = { error: err.message };
      if (err.code) body.code = err.code;
      if (err.details) body.details = err.details;
      return res.status(err.statusCode).json(body);
    }

    if (err instanceof NombaError) {
      logger.warn({ err }, 'Nomba API error');
      return res.status(err.statusCode).json({ error: err.message, code: err.code });
    }

    logger.error({ err }, 'Unhandled error');
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
