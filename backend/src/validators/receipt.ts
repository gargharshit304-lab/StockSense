import { z } from 'zod';

export const createReceiptSchema = z.object({
  body: z.object({
    warehouseId: z.string().uuid('Invalid warehouse ID'),
    partnerId: z.string().uuid('Invalid partner ID'),
    scheduledDate: z.string().datetime('Invalid scheduled date'),
    responsibleId: z.string().uuid('Invalid responsible user ID'),
    destLocationId: z.string().uuid('Invalid destination location ID'),
    lines: z.array(z.object({
      productId: z.string().uuid('Invalid product ID'),
      quantity: z.number().positive('Quantity must be positive'),
    })).min(1, 'At least one line is required'),
  }),
});

export const updateReceiptSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid receipt ID'),
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

export const getReceiptSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid receipt ID'),
  }),
});

export const listReceiptsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED']).optional(),
    warehouseId: z.string().uuid().optional(),
    search: z.string().optional(),
  }),
});

export const validateReceiptSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid receipt ID'),
  }),
});

export const cancelReceiptSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid receipt ID'),
  }),
});