import { z } from 'zod';

export const createWarehouseSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    shortCode: z.string().min(1, 'Short code is required').max(20),
    address: z.string().min(1, 'Address is required').max(500),
  }),
});

export const updateWarehouseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid warehouse ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100).optional(),
    shortCode: z.string().min(1, 'Short code is required').max(20).optional(),
    address: z.string().min(1, 'Address is required').max(500).optional(),
  }).refine(data => Object.keys(data).length > 0, 'At least one field is required'),
});

export const getWarehouseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid warehouse ID'),
  }),
});

export const listWarehousesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    include: z.enum(['locations']).optional(),
  }),
});

export const deleteWarehouseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid warehouse ID'),
  }),
});