import { z } from 'zod';

export const dashboardSchema = z.object({
  query: z.object({}),
});

export const dashboardFiltersSchema = z.object({
  query: z.object({}),
});