import { z } from 'zod';

export const createLocationSchema = z.object({
  body: z.object({
    warehouseId: z.string().uuid('Invalid warehouse ID'),
    name: z.string().min(1, 'Name is required').max(100),
    shortCode: z.string().min(1, 'Short code is required').max(20),
  }),
});

export const updateLocationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid location ID'),
  }),
  body: z.object({
    warehouseId: z.string().uuid('Invalid warehouse ID').optional(),
    name: z.string().min(1, 'Name is required').max(100).optional(),
    shortCode: z.string().min(1, 'Short code is required').max(20).optional(),
  }).refine(data => Object.keys(data).length > 0, 'At least one field is required'),
});

export const getLocationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid location ID'),
  }),
});

export const listLocationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    warehouseId: z.string().uuid().optional(),
  }),
});

export const deleteLocationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid location ID'),
  }),
});