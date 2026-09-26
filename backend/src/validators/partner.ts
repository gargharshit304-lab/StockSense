import { z } from 'zod';

export const createPartnerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    partnerType: z.enum(['VENDOR', 'CUSTOMER']),
    contactInfo: z.string().min(1, 'Contact info is required').max(500),
  }),
});

export const updatePartnerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid partner ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100).optional(),
    partnerType: z.enum(['VENDOR', 'CUSTOMER']).optional(),
    contactInfo: z.string().min(1, 'Contact info is required').max(500).optional(),
  }).refine(data => Object.keys(data).length > 0, 'At least one field is required'),
});

export const getPartnerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid partner ID'),
  }),
});

export const listPartnersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    partnerType: z.enum(['VENDOR', 'CUSTOMER']).optional(),
  }),
});

export const deletePartnerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid partner ID'),
  }),
});