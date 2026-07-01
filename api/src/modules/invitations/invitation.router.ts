import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { invitationController } from './invitation.controller';
import { AcceptInvitationDto } from './invitation.dto';

export const invitationRouter = Router();

// Public endpoints — no authentication required (handled optionally inside controller)
invitationRouter.get('/:token', invitationController.validate);
invitationRouter.post('/:token/accept', validate(AcceptInvitationDto), invitationController.accept);
