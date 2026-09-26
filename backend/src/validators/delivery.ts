import { z } from 'zod';

export const createDeliverySchema = z.object({
  body: z.object({
    warehouseId: z.string().uuid('Invalid warehouse ID'),
    partnerId: z.string().uuid('Invalid partner ID'),
    scheduledDate: z.string().datetime('Invalid scheduled date'),
    responsibleId: z.string().uuid('Invalid responsible user ID'),
    srcLocationId: z.string().uuid('Invalid source location ID'),
    lines: z.array(z.object({
      productId: z.string().uuid('Invalid product ID'),
      quantity: z.number().positive('Quantity must be positive'),
    })).min(1, 'At least one line is required'),
  }),
});

export const updateDeliverySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid delivery ID'),
  }),
  body: z.object({
    scheduledDate: z.string().datetime('Invalid scheduled date').optional(),
    responsibleId: z.string().uuid('Invalid responsible user ID').optional(),
    lines: z.array(z.object({
      productId: z.string().uuid('Invalid product ID'),
      quantity: z.number().positive('Quantity must be positive'),
    })).optional(),
  }).refine(data => Object.keys(data).length > 0, 'At least one field is required'),
});

export const getDeliverySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid delivery ID'),
  }),
});

export const listDeliveriesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED']).optional(),
    warehouseId: z.string().uuid().optional(),
    search: z.string().optional(),
  }),
});

export const validateDeliverySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid delivery ID'),
  }),
});

export const cancelDeliverySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid delivery ID'),
  }),
});