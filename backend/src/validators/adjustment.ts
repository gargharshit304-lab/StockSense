import { z } from 'zod';

export const createAdjustmentSchema = z.object({
  body: z.object({
    warehouseId: z.string().uuid('Invalid warehouse ID'),
    locationId: z.string().uuid('Invalid location ID'),
    scheduledDate: z.string().datetime('Invalid scheduled date'),
    responsibleId: z.string().uuid('Invalid responsible user ID'),
    lines: z.array(z.object({
      productId: z.string().uuid('Invalid product ID'),
      countedQuantity: z.number().nonnegative('Counted quantity must be non-negative'),
    })).min(1, 'At least one line is required'),
  }),
});

export const updateAdjustmentSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid adjustment ID') }),
  body: z.object({
    scheduledDate: z.string().datetime('Invalid scheduled date').optional(),
    responsibleId: z.string().uuid('Invalid responsible user ID').optional(),
    lines: z.array(z.object({
      productId: z.string().uuid('Invalid product ID'),
      countedQuantity: z.number().nonnegative('Counted quantity must be non-negative'),
    })).optional(),
  }).refine(data => Object.keys(data).length > 0, 'At least one field is required'),
});

export const getAdjustmentSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid adjustment ID') }),
});

export const listAdjustmentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED']).optional(),
    warehouseId: z.string().uuid().optional(),
    search: z.string().optional(),
  }),
});

export const validateAdjustmentSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid adjustment ID') }),
});

export const cancelAdjustmentSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid adjustment ID') }),
});