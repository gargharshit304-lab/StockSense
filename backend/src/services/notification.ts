import prisma from '../utils/prisma';
import { Prisma, NotificationType } from '@prisma/client';

export const notificationService = {
  async findAll(userId: string, params: {
    page: number;
    limit: number;
    isRead?: boolean;
    notifType?: NotificationType;
  }) {
    const { page, limit, isRead, notifType } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(isRead !== undefined && { isRead }),
      ...(notifType && { notifType }),
    };

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          picking: { select: { id: true, reference: true, docType: true } },
        },
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  },

  async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      return null;
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        picking: { select: { id: true, reference: true, docType: true } },
      },
    });
  },

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  },

  async delete(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      return null;
    }

    await prisma.notification.delete({ where: { id: notificationId } });
    return { success: true };
  },
};