import rateLimit from 'express-rate-limit';
import { logger } from '../lib/logger';

function onLimitReached(req: import('express').Request, _res: import('express').Response) {
  logger.warn({ ip: req.ip, url: req.originalUrl, method: req.method }, 'Rate limit exceeded');
}

// Strict: login, register, password-reset — 10 attempts per 15 min per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  handler(req, res, _next, options) {
    onLimitReached(req, res);
    res.status(options.statusCode).json(options.message);
  },
});

// Public invitation endpoints — 20 requests per hour per IP
export const invitationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  handler(req, res, _next, options) {
    onLimitReached(req, res);
    res.status(options.statusCode).json(options.message);
  },
});

// Webhook endpoint — 200 requests per minute per IP
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many webhook requests.' },
  handler(req, res, _next, options) {
    onLimitReached(req, res);
    res.status(options.statusCode).json(options.message);
  },
});

// General authenticated API — 500 requests per 15 min per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  handler(req, res, _next, options) {
    onLimitReached(req, res);
    res.status(options.statusCode).json(options.message);
  },
});
