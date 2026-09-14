import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    taxPercent: {
      type: Number,
      default: 5.0, // Standard 5% GST on F&B in India
      min: 0,
    },
    isVegetarian: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      default: null,
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

menuItemSchema.index({ categoryId: 1 });
menuItemSchema.index({ isAvailable: 1 });
menuItemSchema.index({ name: 'text' });

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);
