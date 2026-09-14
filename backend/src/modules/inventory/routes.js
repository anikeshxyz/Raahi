import { Router } from 'express';

const router = Router();

// Module stub: Inventory & Recipes
router.get('/', (req, res) => {
  res.json({ module: 'inventory', status: 'ready', endpoints: ['/items', '/recipes', '/low-stock'] });
});

export default router;
