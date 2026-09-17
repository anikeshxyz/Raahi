import { Router } from 'express';
import {
  getPayrollRuns,
  getPayrollRunById,
  generatePayroll,
  updatePayoutAdjustment,
  updatePayrollStatus,
} from './controller.js';

const router = Router();

// Module info & status
router.get('/', (req, res) => {
  res.json({
    module: 'payroll',
    status: 'ready',
    endpoints: [
      '/runs',
      '/runs/:id',
      '/generate',
      '/runs/:id/payouts/:employeeId',
      '/runs/:id/status',
    ],
  });
});

// Payroll Runs
router.get('/runs', getPayrollRuns);
router.get('/runs/:id', getPayrollRunById);
router.post('/generate', generatePayroll);
router.put('/runs/:id/payouts/:employeeId', updatePayoutAdjustment);
router.put('/runs/:id/status', updatePayrollStatus);

export default router;
