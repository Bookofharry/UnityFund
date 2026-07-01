import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { notificationController } from './notification.controller';

export const notificationRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.get('/', notificationController.list);
notificationRouter.patch('/:notificationId/read', notificationController.markRead);
notificationRouter.post('/read-all', notificationController.markAllRead);
