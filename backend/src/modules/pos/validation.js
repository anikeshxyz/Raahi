import { z } from 'zod';

export const createOrderSchema = z
  .object({
    tableId: z.string().optional().nullable(),
    orderType: z.enum(['dine-in', 'takeaway', 'delivery']).default('dine-in'),
    items: z
      .array(
        z.object({
          menuItemId: z.string().min(1, 'Menu item ID is required'),
          quantity: z.number().int().min(1, 'Quantity must be at least 1'),
          notes: z.string().max(200, 'Notes cannot exceed 200 characters').optional().default(''),
        })
      )
      .min(1, 'Order must contain at least one item'),
    customerName: z.string().trim().max(100).optional().default(''),
    customerPhone: z
      .string()
      .trim()
      .regex(/^[0-9+\s-]{0,15}$/, 'Invalid phone number format')
      .optional()
      .default(''),
  })
  .refine(
    (data) => {
      if (data.orderType === 'dine-in' && !data.tableId) {
        return false;
      }
      return true;
    },
    {
      message: 'Table selection is required for dine-in orders',
      path: ['tableId'],
    }
  );

export const addItemsSchema = z.object({
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1, 'Menu item ID is required'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        notes: z.string().max(200).optional().default(''),
      })
    )
    .min(1, 'At least one item must be added'),
});

export const settleBillSchema = z.object({
  paymentMethod: z.enum(['cash', 'card', 'upi', 'split'], {
    errorMap: () => ({ message: 'Payment method must be cash, card, upi, or split' }),
  }),
  splitDetails: z
    .object({
      cash: z.number().min(0).optional().default(0),
      card: z.number().min(0).optional().default(0),
      upi: z.number().min(0).optional().default(0),
    })
    .optional(),
  discountAmount: z.number().min(0, 'Discount amount cannot be negative').optional().default(0),
  customerName: z.string().trim().max(100).optional().default(''),
  customerPhone: z.string().trim().optional().default(''),
});

export const cancelOrderSchema = z.object({
  reason: z.string().trim().min(3, 'Cancellation reason must be at least 3 characters').max(500),
});

export const tableStatusSchema = z.object({
  status: z.enum(['vacant', 'occupied', 'reserved'], {
    errorMap: () => ({ message: 'Status must be vacant, occupied, or reserved' }),
  }),
});
