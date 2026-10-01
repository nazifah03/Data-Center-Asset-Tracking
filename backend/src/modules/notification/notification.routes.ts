import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// GET
router.get('/unread-count', NotificationController.getUnreadCount);
router.get('/', NotificationController.getAll);
router.get('/:id', NotificationController.getById);

// PUT / PATCH
router.put('/:id/read', NotificationController.markAsRead);
router.put('/read-all', NotificationController.markAllAsRead);

// DELETE
router.delete('/read', NotificationController.deleteAllRead);
router.delete('/:id', NotificationController.delete);

export default router;
