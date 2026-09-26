import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    sku: z.string().min(1, 'SKU is required').max(50),
    name: z.string().min(1, 'Name is required').max(100),
    categoryId: z.string().uuid('Invalid category ID'),
    uomId: z.string().uuid('Invalid UoM ID'),
    unitCost: z.number().nonnegative('Unit cost must be non-negative'),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    sku: z.string().min(1, 'SKU is required').max(50).optional(),
    name: z.string().min(1, 'Name is required').max(100).optional(),
    categoryId: z.string().uuid('Invalid category ID').optional(),
    uomId: z.string().uuid('Invalid UoM ID').optional(),
    unitCost: z.number().nonnegative('Unit cost must be non-negative').optional(),
  }).refine(data => Object.keys(data).length > 0, 'At least one field is required'),
});

export const getProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});

export const listProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    uomId: z.string().uuid().optional(),
    include: z.enum(['stock']).optional(),
  }),
});

export const deleteProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});