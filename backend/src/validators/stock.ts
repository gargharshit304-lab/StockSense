import { z } from 'zod';

export const listStockSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    locationId: z.string().uuid().optional(),
    warehouseId: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
    lowStockOnly: z.coerce.boolean().default(false),
  }),
});

export const getStockSchema = z.object({
  params: z.object({
    productId: z.string().uuid('Invalid product ID'),
    locationId: z.string().uuid('Invalid location ID'),
  }),
});

export const updateStockSchema = z.object({
  params: z.object({
    productId: z.string().uuid('Invalid product ID'),
    locationId: z.string().uuid('Invalid location ID'),
  }),
  body: z.object({
    onHand: z.number().nonnegative('onHand must be a non-negative number'),
  }),
});