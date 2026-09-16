import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z.string().min(2, 'Supplier name must be at least 2 characters'),
  contactPerson: z.string().optional(),
  phone: z.string().min(7, 'Valid contact phone number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
  gstin: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format (15 characters)')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().optional().default(true),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const purchaseOrderItemSchema = z.object({
  inventoryItemId: z.string().min(1, 'Inventory Item ID is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unitCost: z.number().min(0, 'Unit cost cannot be negative'),
});

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  items: z.array(purchaseOrderItemSchema).min(1, 'At least one purchase order item is required'),
  notes: z.string().optional().default(''),
});

export const updatePOStatusSchema = z.object({
  status: z.enum(['draft', 'ordered', 'received', 'cancelled']),
  notes: z.string().optional(),
});
