import { Router } from 'express';

const router = Router();

// Module stub: Payroll & Salary Slips
router.get('/', (req, res) => {
  res.json({ module: 'payroll', status: 'ready', endpoints: ['/runs', '/slips', '/calculate'] });
});

export default router;
