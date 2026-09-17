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
  getReservations,
  assignReservation,
  seatReservation,
  cancelReservation,
} from './controller.js';

const router = Router();

// Module info & health check
router.get('/', (req, res) => {
  res.json({
    module: 'pos',
    status: 'ready',
    endpoints: [
      '/tables',
      '/reservations',
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

// Online Table Reservations
router.get('/reservations', getReservations);
router.put('/reservations/:id/assign', assignReservation);
router.put('/reservations/:id/seat', seatReservation);
router.put('/reservations/:id/cancel', cancelReservation);

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
