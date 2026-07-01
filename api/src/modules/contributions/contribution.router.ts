import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireOrgMember } from '../../middleware/requireOrgMember';
import { contributionController } from './contribution.controller';

export const contributionRouter = Router({ mergeParams: true });

// /api/organizations/:orgId/contributions
contributionRouter.use(authenticate);
contributionRouter.use(requireOrgMember());

contributionRouter.get('/', contributionController.list);
contributionRouter.get('/:contributionId', contributionController.get);
contributionRouter.get('/cycles/:cycleId/summary', contributionController.cycleSummary);
