import { z } from 'zod';

export const createInventoryItemSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  sku: z.string().trim().min(2, 'SKU must be at least 2 characters').toUpperCase(),
  category: z.enum(
    ['raw-material', 'beverage-supply', 'packaging', 'dairy', 'produce', 'condiments'],
    { errorMap: () => ({ message: 'Invalid category' }) }
  ),
  currentStock: z.number().min(0, 'Current stock cannot be negative').default(0),
  reorderLevel: z.number().min(0, 'Reorder level cannot be negative').default(5),
  unit: z.enum(['kg', 'g', 'l', 'ml', 'pcs'], {
    errorMap: () => ({ message: 'Unit must be kg, g, l, ml, or pcs' }),
  }),
  costPerUnit: z.number().min(0, 'Cost per unit cannot be negative'),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial();

export const stockAdjustmentSchema = z.object({
  adjustmentType: z.enum(['add', 'subtract', 'set'], {
    errorMap: () => ({ message: 'Adjustment type must be add, subtract, or set' }),
  }),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  reason: z.string().trim().min(3, 'Reason must be at least 3 characters').max(500),
});

export const recipeSchema = z.object({
  menuItemId: z.string().min(1, 'Menu item ID is required'),
  ingredients: z
    .array(
      z.object({
        inventoryItemId: z.string().min(1, 'Inventory item ID is required'),
        quantity: z.number().min(0.0001, 'Quantity must be positive'),
        unit: z.string().min(1, 'Unit is required'),
      })
    )
    .min(1, 'At least one ingredient is required in a recipe'),
  yieldServings: z.number().int().min(1).default(1),
  preparationNotes: z.string().max(1000).optional().default(''),
});
