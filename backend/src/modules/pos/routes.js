import { Router } from 'express';
import {
  getTables,
  updateTableStatus,
  getPosMenu,
  createOrder,
  getOrders,
  getOrderById,
  addItemsToOrder,
  sendKot,
  settleOrder,
  cancelOrder,
  refundOrder,
} from './controller.js';

const router = Router();

// Module info & health check
router.get('/', (req, res) => {
  res.json({
    module: 'pos',
    status: 'ready',
    endpoints: [
      '/tables',
      '/menu',
      '/orders',
      '/orders/:id',
      '/orders/:id/items',
      '/orders/:id/kot',
      '/orders/:id/settle',
      '/orders/:id/cancel',
      '/orders/:id/refund',
    ],
  });
});

// Table Management
router.get('/tables', getTables);
router.put('/tables/:id/status', updateTableStatus);

// POS Menu
router.get('/menu', getPosMenu);

// Order Management
router.post('/orders', createOrder);
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/items', addItemsToOrder);

// Kitchen & Settlement Workflows
router.post('/orders/:id/kot', sendKot);
router.post('/orders/:id/settle', settleOrder);
router.post('/orders/:id/cancel', cancelOrder);
router.post('/orders/:id/refund', refundOrder);

export default router;
