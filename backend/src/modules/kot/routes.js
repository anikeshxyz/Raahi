import { Router } from 'express';
import {
  getLiveTickets,
  getTicketById,
  updateTicketStatus,
  updateItemStatus,
  getKitchenSummary,
} from './controller.js';

const router = Router();

// Module info & status
router.get('/', (req, res) => {
  res.json({
    module: 'kot',
    status: 'ready',
    endpoints: [
      '/tickets',
      '/tickets/:id',
      '/tickets/:id/status',
      '/tickets/:id/items/:itemId/status',
      '/summary',
    ],
  });
});

// Kitchen Display System Endpoints
router.get('/tickets', getLiveTickets);
router.get('/tickets/:id', getTicketById);
router.put('/tickets/:id/status', updateTicketStatus);
router.put('/tickets/:id/items/:itemId/status', updateItemStatus);
router.get('/summary', getKitchenSummary);

export default router;
