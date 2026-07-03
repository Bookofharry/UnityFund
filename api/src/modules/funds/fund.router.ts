import { Router } from 'express';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { fundController } from './fund.controller';
import { CreateFundDto, UpdateFundDto, CreateFundRulesDto, UpdateFundRulesDto } from './fund.dto';
import { fundMemberRouter } from '../fund-members/fund-member.router';
import { cycleRouter } from '../cycles/cycle.router';
import { payoutRouter } from '../payouts/payout.router';

// mergeParams: true exposes :orgId from the parent organizations router
export const fundRouter = Router({ mergeParams: true });

fundRouter.post(
  '/',
  requireRole('organization_admin', 'platform_admin'),
  validate(CreateFundDto),
  fundController.create,
);

fundRouter.get('/', fundController.list);

fundRouter.get('/:fundId', fundController.get);

fundRouter.patch(
  '/:fundId',
  requireRole('organization_admin', 'treasurer', 'platform_admin'),
  validate(UpdateFundDto),
  fundController.update,
);

fundRouter.post(
  '/:fundId/archive',
  requireRole('organization_admin', 'platform_admin'),
  fundController.archive,
);

fundRouter.get('/:fundId/rules', fundController.getRules);

fundRouter.post(
  '/:fundId/rules',
  requireRole('organization_admin', 'platform_admin'),
  validate(CreateFundRulesDto),
  fundController.upsertRules,
);

fundRouter.patch(
  '/:fundId/rules',
  requireRole('organization_admin', 'platform_admin'),
  validate(UpdateFundRulesDto),
  fundController.upsertRules,
);

// Fund members nested under fund
fundRouter.use('/:fundId/members', fundMemberRouter);

// Collection cycles nested under fund
fundRouter.use('/:fundId/collection-cycles', cycleRouter);

// Fund-scoped payouts
fundRouter.use('/:fundId/payouts', payoutRouter);
