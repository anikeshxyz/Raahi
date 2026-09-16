import { Router } from 'express';
import {
  getInventoryItems,
  getLowStockItems,
  createInventoryItem,
  updateInventoryItem,
  adjustStock,
  getRecipes,
  getRecipeByMenuItem,
  createOrUpdateRecipe,
} from './controller.js';

const router = Router();

// Module info & status
router.get('/', (req, res) => {
  res.json({
    module: 'inventory',
    status: 'ready',
    endpoints: [
      '/items',
      '/low-stock',
      '/items/:id',
      '/items/:id/adjust',
      '/recipes',
      '/recipes/:menuItemId',
    ],
  });
});

// Inventory Stock Endpoints
router.get('/items', getInventoryItems);
router.get('/low-stock', getLowStockItems);
router.post('/items', createInventoryItem);
router.put('/items/:id', updateInventoryItem);
router.post('/items/:id/adjust', adjustStock);

// Recipe Mapping Endpoints
router.get('/recipes', getRecipes);
router.get('/recipes/:menuItemId', getRecipeByMenuItem);
router.post('/recipes', createOrUpdateRecipe);

export default router;
