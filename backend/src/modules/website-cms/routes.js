import { Router } from 'express';

const router = Router();

// Module stub: Website CMS & Reservations
router.get('/', (req, res) => {
  res.json({ module: 'website-cms', status: 'ready', endpoints: ['/reservations', '/inquiries', '/banners'] });
});

export default router;
