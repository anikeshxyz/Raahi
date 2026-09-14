import { Router } from 'express';

const router = Router();

// Module stub: Kitchen Order Ticket (KOT / KDS)
router.get('/', (req, res) => {
  res.json({ module: 'kot', status: 'ready', endpoints: ['/live-tickets', '/item-status'] });
});

export default router;
