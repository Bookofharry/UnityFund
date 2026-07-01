import { Router } from 'express';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { fundMemberController } from './fund-member.controller';
import { EnrollFundMemberDto } from './fund-member.dto';

// mergeParams: true exposes :orgId and :fundId from parent routers
export const fundMemberRouter = Router({ mergeParams: true });

fundMemberRouter.post(
  '/',
  requireRole('organization_admin', 'treasurer', 'platform_admin'),
  validate(EnrollFundMemberDto),
  fundMemberController.enroll,
);

fundMemberRouter.get('/', fundMemberController.list);
fundMemberRouter.get('/:fundMemberId', fundMemberController.get);

fundMemberRouter.delete(
  '/:fundMemberId',
  requireRole('organization_admin', 'treasurer', 'platform_admin'),
  fundMemberController.remove,
);
