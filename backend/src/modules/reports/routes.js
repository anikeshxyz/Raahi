import { Router } from 'express';

const router = Router();

// Module stub: Analytics & Reports
router.get('/', (req, res) => {
  res.json({ module: 'reports', status: 'ready', endpoints: ['/sales', '/inventory-turnover', '/staff-summary'] });
});

export default router;
