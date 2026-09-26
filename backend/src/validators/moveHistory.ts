import { z } from 'zod';

export const moveHistorySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    productId: z.string().uuid().optional(),
    locationId: z.string().uuid().optional(),
    docType: z.enum(['RECEIPT', 'DELIVERY', 'INTERNAL_TRANSFER', 'ADJUSTMENT']).optional(),
    status: z.enum(['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED']).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
  }),
});