import { InventoryItem } from '../models/InventoryItem.js';
import { Recipe } from '../models/Recipe.js';
import { MenuItem } from '../models/MenuItem.js';

export const defaultInventoryItemsData = [
  {
    _id: '65f033333333333333330001',
    name: 'Estate Arabica Coffee Beans',
    sku: 'BEV-COF-001',
    category: 'beverage-supply',
    currentStock: 25.0, // in kg
    reorderLevel: 5.0,
    unit: 'kg',
    costPerUnit: 650,
  },
  {
    _id: '65f033333333333333330002',
    name: 'Fresh Whole Dairy Milk',
    sku: 'DAI-MLK-001',
    category: 'dairy',
    currentStock: 40.0, // in liters
    reorderLevel: 10.0,
    unit: 'l',
    costPerUnit: 70,
  },
  {
    _id: '65f033333333333333330003',
    name: 'Organic Barista Oat Milk',
    sku: 'DAI-OAT-001',
    category: 'dairy',
    currentStock: 15.0, // in liters
    reorderLevel: 5.0,
    unit: 'l',
    costPerUnit: 220,
  },
  {
    _id: '65f033333333333333330004',
    name: 'Organic Sourdough Loaves',
    sku: 'RAW-BAK-001',
    category: 'raw-material',
    currentStock: 18, // in pcs
    reorderLevel: 4,
    unit: 'pcs',
    costPerUnit: 90,
  },
  {
    _id: '65f033333333333333330005',
    name: 'Fresh Hass Avocados',
    sku: 'PRD-AVO-001',
    category: 'produce',
    currentStock: 8.5, // in kg
    reorderLevel: 3.0,
    unit: 'kg',
    costPerUnit: 320,
  },
  {
    _id: '65f033333333333333330006',
    name: 'Button & Portobello Mushrooms',
    sku: 'PRD-MSH-001',
    category: 'produce',
    currentStock: 6.0, // in kg
    reorderLevel: 2.0,
    unit: 'kg',
    costPerUnit: 180,
  },
  {
    _id: '65f033333333333333330007',
    name: 'French Butter Croissants (Frozen Raw)',
    sku: 'RAW-CRO-001',
    category: 'raw-material',
    currentStock: 30, // in pcs
    reorderLevel: 10,
    unit: 'pcs',
    costPerUnit: 65,
  },
  {
    _id: '65f033333333333333330008',
    name: '70% Callebaut Dark Chocolate Silk',
    sku: 'RAW-CHO-001',
    category: 'raw-material',
    currentStock: 4.5, // in kg
    reorderLevel: 2.0,
    unit: 'kg',
    costPerUnit: 850,
  },
  {
    _id: '65f033333333333333330009',
    name: 'Artisanal V60 Paper Filters',
    sku: 'PKG-FLT-001',
    category: 'packaging',
    currentStock: 250, // in pcs
    reorderLevel: 50,
    unit: 'pcs',
    costPerUnit: 4,
  },
  {
    _id: '65f033333333333333330010',
    name: 'Kashmiri Kahwa Tea Blend',
    sku: 'BEV-TEA-001',
    category: 'beverage-supply',
    currentStock: 3.0, // in kg
    reorderLevel: 1.0,
    unit: 'kg',
    costPerUnit: 1200,
  },
];

export const defaultRecipesData = [
  // 1. Chikmagalur Pour Over (V60) -> 0.018 kg beans + 1 filter
  {
    menuItemId: '65f011111111111111110001',
    ingredients: [
      {
        inventoryItemId: '65f033333333333333330001', // Beans
        quantity: 0.018, // 18 grams = 0.018 kg
        unit: 'kg',
      },
      {
        inventoryItemId: '65f033333333333333330009', // Filter
        quantity: 1,
        unit: 'pcs',
      },
    ],
    yieldServings: 1,
    preparationNotes: 'Medium coarse grind, 92°C water, 1:16 brew ratio',
  },
  // 2. Signature Flat White -> 0.018 kg beans + 0.22 L milk
  {
    menuItemId: '65f011111111111111110002',
    ingredients: [
      {
        inventoryItemId: '65f033333333333333330001', // Beans
        quantity: 0.018,
        unit: 'kg',
      },
      {
        inventoryItemId: '65f033333333333333330002', // Whole Milk
        quantity: 0.22, // 220 ml = 0.22 L
        unit: 'l',
      },
    ],
    yieldServings: 1,
    preparationNotes: 'Double ristretto, velvety microfoam at 65°C',
  },
  // 3. Avocado & Truffle Mushroom Sourdough
  {
    menuItemId: '65f011111111111111110008',
    ingredients: [
      {
        inventoryItemId: '65f033333333333333330004', // Sourdough
        quantity: 0.2, // 1/5th loaf
        unit: 'pcs',
      },
      {
        inventoryItemId: '65f033333333333333330005', // Avocado
        quantity: 0.08, // 80g
        unit: 'kg',
      },
      {
        inventoryItemId: '65f033333333333333330006', // Mushrooms
        quantity: 0.05, // 50g
        unit: 'kg',
      },
    ],
    yieldServings: 1,
    preparationNotes: 'Toast slice till golden, spread avocado mash, sautéed mushrooms on top',
  },
  // 4. French Butter Croissant -> 1 pcs croissant
  {
    menuItemId: '65f011111111111111110012',
    ingredients: [
      {
        inventoryItemId: '65f033333333333333330007', // Raw Croissant
        quantity: 1,
        unit: 'pcs',
      },
    ],
    yieldServings: 1,
    preparationNotes: 'Bake at 180°C for 18 mins until flaky golden brown',
  },
];

export const seedInitialInventory = async () => {
  const count = await InventoryItem.countDocuments();
  if (count > 0) {
    return;
  }

  console.log('[Seed] Seeding initial inventory items...');
  await InventoryItem.insertMany(defaultInventoryItemsData);

  const recipeCount = await Recipe.countDocuments();
  if (recipeCount === 0) {
    console.log('[Seed] Seeding default café recipes...');
    await Recipe.insertMany(defaultRecipesData);
  }
  console.log('[Seed] Inventory & Recipes seeded successfully.');
};
