import mongoose from 'mongoose';

const recipeIngredientSchema = new mongoose.Schema(
  {
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
      unique: true,
    },
    ingredients: [recipeIngredientSchema],
    preparationNotes: {
      type: String,
      default: '',
    },
    yieldServings: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// unique index already created by menuItemId field definition

export const Recipe = mongoose.model('Recipe', recipeSchema);
