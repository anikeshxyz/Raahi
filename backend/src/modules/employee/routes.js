import { Router } from 'express';

const router = Router();

// Module stub: Employee & Staff Management
router.get('/', (req, res) => {
  res.json({ module: 'employee', status: 'ready', endpoints: ['/list', '/attendance', '/leaves'] });
});

export default router;
