import { Router } from 'express';
import {
  getPublicMenu,
  createReservation,
  createInquiry,
} from './controller.js';

const router = Router();

// Public Menu Endpoint
router.get('/menu', getPublicMenu);

// Table Reservation Endpoint
router.post('/reservations', createReservation);

// Event & General Contact Inquiries Endpoint
router.post('/inquiries', createInquiry);

export default router;
