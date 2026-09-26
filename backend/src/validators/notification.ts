import { z } from 'zod';

export const listNotificationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    isRead: z.coerce.boolean().optional(),
    notifType: z.enum(['LOW_STOCK', 'OUT_OF_STOCK', 'PICKING_LATE', 'PICKING_READY', 'GENERAL']).optional(),
  }),
});

export const notificationIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid notification ID'),
  }),
});