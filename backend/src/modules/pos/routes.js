import { Router } from 'express';

const router = Router();

// Module stub: POS & Billing
router.get('/', (req, res) => {
  res.json({ module: 'pos', status: 'ready', endpoints: ['/orders', '/tables', '/bill'] });
});

export default router;
