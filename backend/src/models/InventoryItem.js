import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['raw-material', 'beverage-supply', 'packaging', 'dairy', 'produce', 'condiments'],
    },
    currentStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      required: true,
      min: 0,
      default: 5,
    },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'g', 'l', 'ml', 'pcs'],
    },
    costPerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

inventoryItemSchema.index({ currentStock: 1, reorderLevel: 1 });
inventoryItemSchema.index({ category: 1 });

export const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
