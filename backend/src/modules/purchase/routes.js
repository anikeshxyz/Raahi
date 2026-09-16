import { Router } from 'express';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePOStatus,
  receivePurchaseOrder,
  cancelPurchaseOrder,
  getPurchaseSummary,
} from './controller.js';

const router = Router();

// Module info
router.get('/', (req, res) => {
  res.json({
    module: 'purchase',
    status: 'ready',
    endpoints: [
      '/summary',
      '/suppliers',
      '/suppliers/:id',
      '/orders',
      '/orders/:id',
      '/orders/:id/status',
      '/orders/:id/receive',
      '/orders/:id/cancel',
    ],
  });
});

// Summary KPI metrics
router.get('/summary', getPurchaseSummary);

// Supplier routes
router.get('/suppliers', getSuppliers);
router.post('/suppliers', createSupplier);
router.put('/suppliers/:id', updateSupplier);
router.delete('/suppliers/:id', deleteSupplier);

// Purchase Order routes
router.get('/orders', getPurchaseOrders);
router.get('/orders/:id', getPurchaseOrderById);
router.post('/orders', createPurchaseOrder);
router.put('/orders/:id/status', updatePOStatus);
router.post('/orders/:id/receive', receivePurchaseOrder);
router.post('/orders/:id/cancel', cancelPurchaseOrder);

export default router;
