import { Router } from 'express';
import { notificationController } from '../controllers/notification';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { listNotificationsSchema, notificationIdSchema } from '../validators/notification';

const router = Router();

router.get(
  '/',
  authenticate,
  validate(listNotificationsSchema),
  notificationController.list
);

router.get(
  '/unread-count',
  authenticate,
  notificationController.unreadCount
);

router.patch(
  '/:id/read',
  authenticate,
  validate(notificationIdSchema),
  notificationController.markAsRead
);

router.patch(
  '/read-all',
  authenticate,
  notificationController.markAllAsRead
);

router.delete(
  '/:id',
  authenticate,
  validate(notificationIdSchema),
  notificationController.delete
);

export default router;