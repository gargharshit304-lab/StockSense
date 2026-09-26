import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { notificationService } from '../services/notification';

export const notificationController = {
  async list(req: AuthRequest, res: Response): Promise<void> {
    const { page = 1, limit = 20, isRead, notifType } = req.query;
    const userId = req.user!.userId;

    const result = await notificationService.findAll(userId, {
      page: Number(page),
      limit: Number(limit),
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      notifType: notifType as any,
    });
    res.json(result);
  },

  async unreadCount(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const result = await notificationService.getUnreadCount(userId);
    res.json(result);
  },

  async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { id } = req.params;

    const notification = await notificationService.markAsRead(userId, id);
    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.json(notification);
  },

  async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const result = await notificationService.markAllAsRead(userId);
    res.json(result);
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { id } = req.params;

    const result = await notificationService.delete(userId, id);
    if (!result) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.json(result);
  },
};