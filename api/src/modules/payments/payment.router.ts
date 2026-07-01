import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireOrgMember } from '../../middleware/requireOrgMember';
import { validate } from '../../middleware/validate';
import { paymentController } from './payment.controller';
import { InitiatePaymentDto } from './payment.dto';

export const paymentRouter = Router({ mergeParams: true });

paymentRouter.use(authenticate, requireOrgMember());

// POST /api/organizations/:orgId/contributions/:contributionId/payments
paymentRouter.post(
  '/',
  validate(InitiatePaymentDto),
  paymentController.initiate,
);

// GET /api/organizations/:orgId/payments
export const paymentListRouter = Router({ mergeParams: true });
paymentListRouter.use(authenticate, requireOrgMember());
paymentListRouter.get('/', paymentController.list);
paymentListRouter.get('/:paymentId', paymentController.get);
