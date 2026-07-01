import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireOrgMember } from '../../middleware/requireOrgMember';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { organizationController, memberController, orgInvitationController } from './organization.controller';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  UpdateMemberRoleDto,
  UpdateMemberStatusDto,
} from './organization.dto';
import { SendInvitationDto } from '../invitations/invitation.dto';
import { fundRouter } from '../funds/fund.router';
import { mandateRouter, mandateActionsRouter } from '../mandates/mandate.router';
import { bankAccountRouter, bankAccountActionsRouter } from '../bank-accounts/bank-account.router';
import { contributionRouter } from '../contributions/contribution.router';
import { paymentRouter } from '../payments/payment.router';
import { payoutRouter, payoutActionsRouter } from '../payouts/payout.router';
import { reportController } from '../reports/report.controller';

export const organizationRouter = Router();

// All org routes require authentication
organizationRouter.use(authenticate);

// ─── Organization CRUD ────────────────────────────────────────────────────────
organizationRouter.post('/', validate(CreateOrganizationDto), organizationController.create);
organizationRouter.get('/', organizationController.list);

organizationRouter.get(
  '/:orgId',
  requireOrgMember(),
  organizationController.get,
);

organizationRouter.patch(
  '/:orgId',
  requireOrgMember(),
  requireRole('organization_admin', 'platform_admin'),
  validate(UpdateOrganizationDto),
  organizationController.update,
);

// ─── Members ─────────────────────────────────────────────────────────────────
organizationRouter.get(
  '/:orgId/members',
  requireOrgMember(),
  memberController.list,
);

organizationRouter.get(
  '/:orgId/members/:memberId',
  requireOrgMember(),
  memberController.get,
);

organizationRouter.patch(
  '/:orgId/members/:memberId',
  requireOrgMember(),
  requireRole('organization_admin', 'platform_admin'),
  validate(UpdateMemberRoleDto),
  memberController.updateRole,
);

organizationRouter.patch(
  '/:orgId/members/:memberId/status',
  requireOrgMember(),
  requireRole('organization_admin', 'platform_admin'),
  validate(UpdateMemberStatusDto),
  memberController.updateStatus,
);

organizationRouter.delete(
  '/:orgId/members/:memberId',
  requireOrgMember(),
  requireRole('organization_admin', 'platform_admin'),
  memberController.remove,
);

// ─── Invitations (nested under org) ──────────────────────────────────────────
organizationRouter.post(
  '/:orgId/invitations',
  requireOrgMember(),
  requireRole('organization_admin', 'platform_admin'),
  validate(SendInvitationDto),
  orgInvitationController.send,
);

organizationRouter.get(
  '/:orgId/invitations',
  requireOrgMember(),
  requireRole('organization_admin', 'treasurer', 'platform_admin'),
  orgInvitationController.list,
);

organizationRouter.post(
  '/:orgId/invitations/:invitationId/resend',
  requireOrgMember(),
  requireRole('organization_admin', 'platform_admin'),
  orgInvitationController.resend,
);

organizationRouter.delete(
  '/:orgId/invitations/:invitationId',
  requireOrgMember(),
  requireRole('organization_admin', 'platform_admin'),
  orgInvitationController.cancel,
);

// ─── Funds ───────────────────────────────────────────────────────────────────
organizationRouter.use('/:orgId/funds', requireOrgMember(), fundRouter);

// ─── Mandates ────────────────────────────────────────────────────────────────
organizationRouter.use('/:orgId/members/:memberId/mandates', requireOrgMember(), mandateRouter);
organizationRouter.use('/:orgId/mandates', requireOrgMember(), mandateActionsRouter);

// ─── Bank Accounts ───────────────────────────────────────────────────────────
organizationRouter.use('/:orgId/members/:memberId/bank-accounts', requireOrgMember(), bankAccountRouter);
organizationRouter.use('/:orgId/bank-accounts', requireOrgMember(), bankAccountActionsRouter);

// ─── Contributions ────────────────────────────────────────────────────────────
organizationRouter.use('/:orgId/contributions', contributionRouter);

// ─── Payments (initiate on a contribution) ───────────────────────────────────
organizationRouter.use('/:orgId/contributions/:contributionId/payments', paymentRouter);

// ─── Payouts ────────────────────────────────────────────────────────────────
organizationRouter.use('/:orgId/payouts', payoutActionsRouter);

// ─── Reports & Dashboard ─────────────────────────────────────────────────────
organizationRouter.get('/:orgId/dashboard', requireOrgMember(), reportController.dashboard);
organizationRouter.get('/:orgId/reports/fund-summary', requireOrgMember(), reportController.fundSummary);
organizationRouter.get('/:orgId/reports/cycles/:cycleId', requireOrgMember(), reportController.cycleReport);
organizationRouter.get('/:orgId/members/:memberId/history', requireOrgMember(), reportController.memberHistory);
