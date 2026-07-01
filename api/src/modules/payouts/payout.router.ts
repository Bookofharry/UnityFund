import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireOrgMember } from '../../middleware/requireOrgMember';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { payoutController } from './payout.controller';
import { CreatePayoutDto, ApprovePayoutDto } from './payout.dto';

export const payoutRouter = Router({ mergeParams: true });

payoutRouter.use(authenticate, requireOrgMember());

// Fund-scoped payout creation: POST /api/organizations/:orgId/funds/:fundId/payouts
payoutRouter.post('/', requireRole('treasurer', 'organization_admin', 'platform_admin'),
  validate(CreatePayoutDto), payoutController.create);

// Payout list/detail routers (org-scoped — can be at /api/organizations/:orgId/payouts)
export const payoutActionsRouter = Router({ mergeParams: true });

payoutActionsRouter.use(authenticate, requireOrgMember());

payoutActionsRouter.get('/', payoutController.list);
payoutActionsRouter.get('/:payoutId', payoutController.get);
payoutActionsRouter.post('/:payoutId/approve',
  requireRole('approver', 'organization_admin', 'platform_admin'),
  validate(ApprovePayoutDto), payoutController.approve);
payoutActionsRouter.post('/:payoutId/execute',
  requireRole('treasurer', 'organization_admin', 'platform_admin'),
  payoutController.execute);
