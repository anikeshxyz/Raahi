import { z } from 'zod';

export const dateRangeQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'year', 'all', 'custom']).optional().default('all'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const auditLogQuerySchema = z.object({
  action: z.string().optional(),
  actorRole: z.string().optional(),
  search: z.string().optional(),
  page: z.string().or(z.number()).optional().default(1),
  limit: z.string().or(z.number()).optional().default(50),
});

export const exportQuerySchema = z.object({
  type: z.enum(['sales', 'products', 'audit', 'inventory']).default('sales'),
  format: z.enum(['csv', 'json']).default('csv'),
  period: z.enum(['today', 'week', 'month', 'year', 'all']).optional().default('all'),
});
