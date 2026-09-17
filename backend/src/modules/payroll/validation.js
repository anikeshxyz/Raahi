import { z } from 'zod';

export const generatePayrollSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2050),
});

export const updatePayrollStatusSchema = z.object({
  status: z.enum(['Draft', 'Approved', 'Paid']),
});

export const updatePayoutAdjustmentSchema = z.object({
  additions: z.number().min(0).optional(),
  deductions: z.number().min(0).optional(),
  remarks: z.string().optional(),
});
