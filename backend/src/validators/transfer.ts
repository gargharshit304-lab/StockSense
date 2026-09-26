import { z } from 'zod';

export const createTransferSchema = z.object({
  body: z.object({
    warehouseId: z.string().uuid('Invalid warehouse ID'),
    scheduledDate: z.string().datetime('Invalid scheduled date'),
    responsibleId: z.string().uuid('Invalid responsible user ID'),
    srcLocationId: z.string().uuid('Invalid source location ID'),
    destLocationId: z.string().uuid('Invalid destination location ID'),
    lines: z.array(z.object({
      productId: z.string().uuid('Invalid product ID'),
      quantity: z.number().positive('Quantity must be positive'),
    })).min(1, 'At least one line is required'),
  }),
});

export const updateTransferSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid transfer ID') }),
  body: z.object({
    scheduledDate: z.string().datetime('Invalid scheduled date').optional(),
    responsibleId: z.string().uuid('Invalid responsible user ID').optional(),
    lines: z.array(z.object({
      productId: z.string().uuid('Invalid product ID'),
      quantity: z.number().positive('Quantity must be positive'),
    })).optional(),
  }).refine(data => Object.keys(data).length > 0, 'At least one field is required'),
});

export const getTransferSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid transfer ID') }),
});

export const listTransfersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED']).optional(),
    warehouseId: z.string().uuid().optional(),
    search: z.string().optional(),
  }),
});

export const validateTransferSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid transfer ID') }),
});

export const cancelTransferSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid transfer ID') }),
});