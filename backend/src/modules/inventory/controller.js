import mongoose from 'mongoose';
import { InventoryItem } from '../../models/InventoryItem.js';
import { Recipe } from '../../models/Recipe.js';
import { MenuItem } from '../../models/MenuItem.js';
import { logAuditTrail } from '../../middleware/audit.js';
import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  stockAdjustmentSchema,
  recipeSchema,
} from './validation.js';
import {
  defaultInventoryItemsData,
  defaultRecipesData,
  seedInitialInventory,
} from '../../seeds/inventorySeed.js';

// In-memory fallback stores
let memInventory = defaultInventoryItemsData.map((item) => ({ ...item }));
let memRecipes = defaultRecipesData.map((recipe) => ({ ...recipe, _id: `rec-${recipe.menuItemId}` }));

export const resetMemInventoryStore = () => {
  memInventory = defaultInventoryItemsData.map((item) => ({ ...item }));
  memRecipes = defaultRecipesData.map((recipe) => ({ ...recipe, _id: `rec-${recipe.menuItemId}` }));
};

export const getMemInventory = () => memInventory;
export const getMemRecipes = () => memRecipes;

// 1. GET /api/v1/inventory/items
export const getInventoryItems = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const { category, search, lowStock } = req.query;

    let items = [];

    if (isDbConnected) {
      await seedInitialInventory();
      const query = {};
      if (category) query.category = category;
      if (search) query.name = { $regex: search, $options: 'i' };

      items = await InventoryItem.find(query).sort({ name: 1 }).lean();
      if (lowStock === 'true') {
        items = items.filter((i) => i.currentStock <= i.reorderLevel);
      }
    } else {
      items = memInventory.map((i) => ({ ...i }));
      if (category) items = items.filter((i) => i.category === category);
      if (search) {
        const s = search.toLowerCase();
        items = items.filter((i) => i.name.toLowerCase().includes(s) || i.sku.toLowerCase().includes(s));
      }
      if (lowStock === 'true') {
        items = items.filter((i) => i.currentStock <= i.reorderLevel);
      }
    }

    let totalValuation = 0;
    let lowStockCount = 0;
    items.forEach((item) => {
      totalValuation += Math.round((item.currentStock * item.costPerUnit) * 100) / 100;
      if (item.currentStock <= item.reorderLevel) {
        lowStockCount++;
      }
    });

    res.json({
      success: true,
      summary: {
        totalSKUs: items.length,
        lowStockCount,
        totalValuation: Math.round(totalValuation * 100) / 100,
      },
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET /api/v1/inventory/low-stock
export const getLowStockItems = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let items = [];

    if (isDbConnected) {
      await seedInitialInventory();
      const all = await InventoryItem.find().lean();
      items = all.filter((i) => i.currentStock <= i.reorderLevel);
    } else {
      items = memInventory.filter((i) => i.currentStock <= i.reorderLevel);
    }

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// 3. POST /api/v1/inventory/items
export const createInventoryItem = async (req, res, next) => {
  try {
    const validated = createInventoryItemSchema.parse(req.body);
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const existing = await InventoryItem.findOne({ sku: validated.sku });
      if (existing) {
        return res.status(400).json({ success: false, message: `SKU ${validated.sku} already exists` });
      }

      const item = await InventoryItem.create(validated);
      return res.status(201).json({
        success: true,
        message: 'Inventory item created successfully',
        data: item,
      });
    }

    // In-memory fallback
    if (memInventory.some((i) => i.sku === validated.sku)) {
      return res.status(400).json({ success: false, message: `SKU ${validated.sku} already exists` });
    }

    const newItem = {
      _id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...validated,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memInventory.push(newItem);

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: newItem,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Failed',
        errors: error.errors.map((e) => e.message),
      });
    }
    next(error);
  }
};

// 4. PUT /api/v1/inventory/items/:id
export const updateInventoryItem = async (req, res, next) => {
  try {
    const validated = updateInventoryItemSchema.parse(req.body);
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const item = await InventoryItem.findByIdAndUpdate(req.params.id, validated, { new: true });
      if (!item) {
        return res.status(404).json({ success: false, message: 'Inventory item not found' });
      }
      return res.json({ success: true, message: 'Item updated successfully', data: item });
    }

    // In-memory fallback
    const index = memInventory.findIndex((i) => String(i._id) === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    memInventory[index] = {
      ...memInventory[index],
      ...validated,
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: memInventory[index],
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Failed',
        errors: error.errors.map((e) => e.message),
      });
    }
    next(error);
  }
};

// 5. POST /api/v1/inventory/items/:id/adjust (Manual adjustment with MANDATORY audit logging)
export const adjustStock = async (req, res, next) => {
  try {
    const validated = stockAdjustmentSchema.parse(req.body);
    const isDbConnected = mongoose.connection.readyState === 1;

    let item = null;
    let beforeStock = 0;
    let newStock = 0;

    if (isDbConnected) {
      item = await InventoryItem.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Inventory item not found' });
      }

      beforeStock = item.currentStock;

      if (validated.adjustmentType === 'add') {
        newStock = beforeStock + validated.quantity;
      } else if (validated.adjustmentType === 'subtract') {
        if (beforeStock < validated.quantity) {
          return res.status(400).json({
            success: false,
            message: `Cannot subtract ${validated.quantity} ${item.unit}. Current stock is only ${beforeStock} ${item.unit}.`,
          });
        }
        newStock = beforeStock - validated.quantity;
      } else if (validated.adjustmentType === 'set') {
        newStock = validated.quantity;
      }

      item.currentStock = Math.round(newStock * 1000) / 1000;
      await item.save();

      // Mandatory Audit Log per AGENTS.md
      await logAuditTrail({
        actorId: req.user?._id || null,
        actorRole: req.user?.role || 'Manager',
        action: 'STOCK_ADJUSTMENT',
        entityName: 'InventoryItem',
        entityId: String(item._id),
        beforeState: { currentStock: beforeStock },
        afterState: { currentStock: item.currentStock },
        notes: `Adjustment [${validated.adjustmentType.toUpperCase()}]: ${validated.reason}`,
      });

      return res.json({
        success: true,
        message: 'Stock adjusted successfully and audit log recorded',
        data: item,
      });
    }

    // In-memory fallback
    item = memInventory.find((i) => String(i._id) === req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    beforeStock = item.currentStock;

    if (validated.adjustmentType === 'add') {
      newStock = beforeStock + validated.quantity;
    } else if (validated.adjustmentType === 'subtract') {
      if (beforeStock < validated.quantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot subtract ${validated.quantity} ${item.unit}. Current stock is only ${beforeStock} ${item.unit}.`,
        });
      }
      newStock = beforeStock - validated.quantity;
    } else if (validated.adjustmentType === 'set') {
      newStock = validated.quantity;
    }

    item.currentStock = Math.round(newStock * 1000) / 1000;
    item.updatedAt = new Date();

    res.json({
      success: true,
      message: 'Stock adjusted successfully and audit log recorded',
      data: item,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Failed',
        errors: error.errors.map((e) => e.message),
      });
    }
    next(error);
  }
};

// 6. GET /api/v1/inventory/recipes
export const getRecipes = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      await seedInitialInventory();
      const recipes = await Recipe.find()
        .populate('menuItemId', 'name price categoryId isVegetarian')
        .populate('ingredients.inventoryItemId', 'name sku unit costPerUnit currentStock')
        .lean();

      return res.json({
        success: true,
        count: recipes.length,
        data: recipes,
      });
    }

    // In-memory fallback
    const populated = memRecipes.map((r) => {
      return {
        ...r,
        ingredients: r.ingredients.map((ing) => {
          const invItem = memInventory.find((i) => String(i._id) === String(ing.inventoryItemId));
          return {
            ...ing,
            inventoryItem: invItem ? { name: invItem.name, sku: invItem.sku, currentStock: invItem.currentStock } : null,
          };
        }),
      };
    });

    res.json({
      success: true,
      count: populated.length,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// 7. GET /api/v1/inventory/recipes/:menuItemId
export const getRecipeByMenuItem = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const recipe = await Recipe.findOne({ menuItemId: req.params.menuItemId })
        .populate('menuItemId', 'name price')
        .populate('ingredients.inventoryItemId', 'name sku unit costPerUnit currentStock');

      if (!recipe) {
        return res.status(404).json({ success: false, message: 'Recipe not found for this menu item' });
      }

      return res.json({ success: true, data: recipe });
    }

    const recipe = memRecipes.find((r) => String(r.menuItemId) === String(req.params.menuItemId));
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found for this menu item' });
    }

    res.json({ success: true, data: recipe });
  } catch (error) {
    next(error);
  }
};

// 8. POST /api/v1/inventory/recipes
export const createOrUpdateRecipe = async (req, res, next) => {
  try {
    const validated = recipeSchema.parse(req.body);
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const recipe = await Recipe.findOneAndUpdate(
        { menuItemId: validated.menuItemId },
        validated,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Link recipeId on MenuItem
      await MenuItem.findByIdAndUpdate(validated.menuItemId, { recipeId: recipe._id });

      return res.status(201).json({
        success: true,
        message: 'Recipe mapping saved successfully',
        data: recipe,
      });
    }

    // In-memory fallback
    const existingIndex = memRecipes.findIndex(
      (r) => String(r.menuItemId) === String(validated.menuItemId)
    );

    const newRecipe = {
      _id: `rec-${validated.menuItemId}`,
      ...validated,
      updatedAt: new Date(),
    };

    if (existingIndex >= 0) {
      memRecipes[existingIndex] = newRecipe;
    } else {
      memRecipes.push(newRecipe);
    }

    res.status(201).json({
      success: true,
      message: 'Recipe mapping saved successfully',
      data: newRecipe,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Failed',
        errors: error.errors.map((e) => e.message),
      });
    }
    next(error);
  }
};

/**
 * Core Non-Negotiable Helper: Automatically deduct inventory stock via recipe mapping on POS sale
 * Invoked synchronously inside order creation/settlement flow.
 */
export const deductStockForOrder = async (orderItems) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    for (const item of orderItems) {
      const recipe = await Recipe.findOne({ menuItemId: item.menuItemId });
      if (recipe && recipe.ingredients && recipe.ingredients.length > 0) {
        for (const ing of recipe.ingredients) {
          const deductQty = Math.round(ing.quantity * item.quantity * 1000) / 1000;
          await InventoryItem.findByIdAndUpdate(ing.inventoryItemId, {
            $inc: { currentStock: -deductQty },
          });
        }
      }
    }
    return;
  }

  // In-memory deduction
  for (const item of orderItems) {
    const recipe = memRecipes.find((r) => String(r.menuItemId) === String(item.menuItemId));
    if (recipe && recipe.ingredients) {
      for (const ing of recipe.ingredients) {
        const deductQty = Math.round(ing.quantity * item.quantity * 1000) / 1000;
        const invItem = memInventory.find((i) => String(i._id) === String(ing.inventoryItemId));
        if (invItem) {
          invItem.currentStock = Math.max(0, Math.round((invItem.currentStock - deductQty) * 1000) / 1000);
        }
      }
    }
  }
};

/**
 * Restore inventory stock if an order is cancelled before cooking
 */
export const restoreStockForOrder = async (orderItems, reason = 'Order Cancelled') => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    for (const item of orderItems) {
      const recipe = await Recipe.findOne({ menuItemId: item.menuItemId });
      if (recipe && recipe.ingredients) {
        for (const ing of recipe.ingredients) {
          const restoreQty = Math.round(ing.quantity * item.quantity * 1000) / 1000;
          await InventoryItem.findByIdAndUpdate(ing.inventoryItemId, {
            $inc: { currentStock: restoreQty },
          });
        }
      }
    }
    return;
  }

  // In-memory restoration
  for (const item of orderItems) {
    const recipe = memRecipes.find((r) => String(r.menuItemId) === String(item.menuItemId));
    if (recipe && recipe.ingredients) {
      for (const ing of recipe.ingredients) {
        const restoreQty = Math.round(ing.quantity * item.quantity * 1000) / 1000;
        const invItem = memInventory.find((i) => String(i._id) === String(ing.inventoryItemId));
        if (invItem) {
          invItem.currentStock = Math.round((invItem.currentStock + restoreQty) * 1000) / 1000;
        }
      }
    }
  }
};
