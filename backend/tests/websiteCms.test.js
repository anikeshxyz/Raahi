import request from 'supertest';
import app from '../src/app.js';
import { Reservation } from '../src/models/Reservation.js';
import { Category } from '../src/models/Category.js';
import { MenuItem } from '../src/models/MenuItem.js';

describe('Phase 1 Verification — Website CMS API & Reservations', () => {
  it('GET /api/v1/website-cms/menu should return success and data array', async () => {
    // Mock or check
    const res = await request(app).get('/api/v1/website-cms/menu');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/website-cms/reservations should reject past date with 400', async () => {
    const pastPayload = {
      name: 'Rohan Verma',
      phone: '9876543210',
      email: 'rohan@example.com',
      date: '2020-01-01',
      time: '19:00',
      guestCount: 2,
    };

    const res = await request(app)
      .post('/api/v1/website-cms/reservations')
      .send(pastPayload);

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContain('Reservation date cannot be in the past');
  });

  it('POST /api/v1/website-cms/reservations should reject zero or negative guests with 400', async () => {
    const invalidPayload = {
      name: 'Rohan Verma',
      phone: '9876543210',
      email: 'rohan@example.com',
      date: '2027-10-15',
      time: '19:00',
      guestCount: 0,
    };

    const res = await request(app)
      .post('/api/v1/website-cms/reservations')
      .send(invalidPayload);

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContain('Guest count must be at least 1');
  });

  it('POST /api/v1/website-cms/inquiries should accept valid inquiry', async () => {
    const inquiryPayload = {
      name: 'Priya Sen',
      email: 'priya@example.com',
      phone: '9876543210',
      inquiryType: 'Event',
      message: 'Looking to book outdoor terrace for 25 guests birthday celebration.',
    };

    const res = await request(app)
      .post('/api/v1/website-cms/inquiries')
      .send(inquiryPayload);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
  });
});
