import { Router } from 'express';
import { webhookController } from './webhook.controller';

export const webhookRouter = Router();

// Raw body is captured in app.ts (before JSON parser) — no auth, no JSON body parse here
webhookRouter.post('/nomba', webhookController.nomba);
