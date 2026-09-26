import { z } from 'zod';

export const createProductCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
  }),
});

export const updateProductCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product category ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100).optional(),
  }).refine(data => Object.keys(data).length > 0, 'At least one field is required'),
});

export const getProductCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product category ID'),
  }),
});

export const listProductCategoriesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
  }),
});

export const deleteProductCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product category ID'),
  }),
});