import { z } from 'zod';

export const createUomSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(50),
  }),
});

export const updateUomSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid UoM ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').max(50).optional(),
  }).refine(data => Object.keys(data).length > 0, 'At least one field is required'),
});

export const getUomSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid UoM ID'),
  }),
});

export const listUomsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
  }),
});

export const deleteUomSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid UoM ID'),
  }),
});