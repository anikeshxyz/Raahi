import { Router } from 'express';
import {
  getSalesReport,
  getProductPerformance,
  getKitchenMetrics,
  getAuditLogsReport,
  exportReportData,
} from './controller.js';

const router = Router();

// Module info & status
router.get('/', (req, res) => {
  res.json({
    module: 'reports',
    status: 'ready',
    endpoints: [
      '/sales',
      '/products',
      '/kitchen',
      '/audit-logs',
      '/export',
    ],
  });
});

// Analytical endpoints
router.get('/sales', getSalesReport);
router.get('/products', getProductPerformance);
router.get('/kitchen', getKitchenMetrics);
router.get('/audit-logs', getAuditLogsReport);
router.get('/export', exportReportData);

export default router;
