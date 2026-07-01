import { Router } from 'express';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { cycleController } from './cycle.controller';
import { CreateCollectionCycleDto } from './cycle.dto';

export const cycleRouter = Router({ mergeParams: true });

cycleRouter.post(
  '/',
  requireRole('organization_admin', 'treasurer', 'platform_admin'),
  validate(CreateCollectionCycleDto),
  cycleController.create,
);

cycleRouter.get('/', cycleController.list);
cycleRouter.get('/:cycleId', cycleController.get);

cycleRouter.post(
  '/:cycleId/start',
  requireRole('organization_admin', 'treasurer', 'platform_admin'),
  cycleController.start,
);

cycleRouter.post(
  '/:cycleId/close',
  requireRole('organization_admin', 'treasurer', 'platform_admin'),
  cycleController.close,
);
