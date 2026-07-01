import { Router } from 'express';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { mandateController } from './mandate.controller';
import { InitiateMandateDto } from './mandate.dto';

export const mandateRouter = Router({ mergeParams: true });

mandateRouter.post(
  '/',
  requireRole('organization_admin', 'treasurer', 'member', 'platform_admin'),
  validate(InitiateMandateDto),
  mandateController.initiate,
);

mandateRouter.get('/', mandateController.list);

// Single mandate actions (mounted at /:orgId/mandates/:mandateId)
export const mandateActionsRouter = Router({ mergeParams: true });
mandateActionsRouter.get('/:mandateId', mandateController.get);
mandateActionsRouter.post('/:mandateId/suspend', requireRole('organization_admin', 'treasurer', 'platform_admin'), mandateController.suspend);
mandateActionsRouter.post('/:mandateId/cancel', requireRole('organization_admin', 'treasurer', 'platform_admin'), mandateController.cancel);
