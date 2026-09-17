import { Router } from 'express';
import {
  getPublicMenu,
  getReservations,
  createReservation,
  createInquiry,
} from './controller.js';

const router = Router();

// Public Menu Endpoint
router.get('/menu', getPublicMenu);

// Table Reservation Endpoints
router.get('/reservations', getReservations);
router.post('/reservations', createReservation);

// Event & General Contact Inquiries Endpoint
router.post('/inquiries', createInquiry);

export default router;
