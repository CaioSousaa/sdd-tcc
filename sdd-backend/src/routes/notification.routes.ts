import { Router } from 'express';
import { notificationController } from '../modules/notification/factories/notification.factory';
import { authenticate } from '../shared/http/authenticate';

const router = Router();

router.patch('/:id/read', authenticate, (req, res) => notificationController.markAsRead(req, res));
router.get('/', authenticate, (req, res) => notificationController.list(req, res));

export default router;
