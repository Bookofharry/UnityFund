import { Router } from 'express';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { bankAccountController } from './bank-account.controller';
import { RegisterBankAccountDto, UpdateBankAccountDto } from './bank-account.dto';

export const bankAccountRouter = Router({ mergeParams: true });

bankAccountRouter.post(
  '/',
  requireRole('organization_admin', 'treasurer', 'member', 'platform_admin'),
  validate(RegisterBankAccountDto),
  bankAccountController.register,
);

bankAccountRouter.get('/', bankAccountController.list);

// Single account actions (mounted at /:orgId/bank-accounts/:accountId)
export const bankAccountActionsRouter = Router({ mergeParams: true });
bankAccountActionsRouter.get('/:accountId', bankAccountController.get);
bankAccountActionsRouter.post('/:accountId/verify', requireRole('organization_admin', 'treasurer', 'platform_admin'), bankAccountController.verify);
bankAccountActionsRouter.patch('/:accountId', requireRole('organization_admin', 'treasurer', 'platform_admin'), validate(UpdateBankAccountDto), bankAccountController.update);
bankAccountActionsRouter.delete('/:accountId', requireRole('organization_admin', 'treasurer', 'platform_admin'), bankAccountController.remove);
