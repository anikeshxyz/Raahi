import request from 'supertest';
import app from '../src/app.js';
import { logAuditTrail, resetMemAuditLogs } from '../src/middleware/audit.js';

describe('Phase 7: Executive Analytics, Reports & Audit Log System API', () => {
  beforeEach(() => {
    resetMemAuditLogs();
  });

  describe('Sales & Revenue Analytics', () => {
    it('GET /api/v1/reports/sales — should return sales summary and metrics', async () => {
      const res = await request(app).get('/api/v1/reports/sales');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.summary).toHaveProperty('grossSales');
      expect(res.body.summary).toHaveProperty('netSales');
      expect(res.body.summary).toHaveProperty('totalTax');
      expect(res.body.summary).toHaveProperty('totalOrders');
      expect(res.body.summary).toHaveProperty('averageOrderValue');
      expect(res.body.summary.grossSales).toBeGreaterThan(0);
      expect(res.body.summary.totalOrders).toBeGreaterThan(0);

      // Verify payment breakdown
      expect(res.body).toHaveProperty('paymentBreakdown');
      expect(res.body.paymentBreakdown).toHaveProperty('upi');
      expect(res.body.paymentBreakdown).toHaveProperty('card');

      // Verify timeline array
      expect(Array.isArray(res.body.timeline)).toBe(true);
      expect(res.body.timeline.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/reports/sales?period=today — should filter by period', async () => {
      const res = await request(app).get('/api/v1/reports/sales?period=today');
      expect(res.status).toBe(200);
      expect(res.body.period).toBe('today');
    });
  });

  describe('Product Velocity & Category Pareto (80/20 Rule)', () => {
    it('GET /api/v1/reports/products — should return Pareto analysis and top bestsellers', async () => {
      const res = await request(app).get('/api/v1/reports/products');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.totalMenuRevenue).toBeGreaterThan(0);
      expect(res.body.totalItemsSold).toBeGreaterThan(0);

      // Verify Pareto rankings
      expect(Array.isArray(res.body.paretoProducts)).toBe(true);
      expect(res.body.paretoProducts.length).toBeGreaterThan(0);
      expect(res.body.paretoProducts[0]).toHaveProperty('isParetoCore', true);
      expect(res.body.paretoProducts[0]).toHaveProperty('revenueShare');
      expect(res.body.paretoProducts[0]).toHaveProperty('cumulativePercentage');

      // Verify category breakdown
      expect(Array.isArray(res.body.categoryBreakdown)).toBe(true);
      expect(res.body.categoryBreakdown.length).toBeGreaterThan(0);
      const coffeeCat = res.body.categoryBreakdown.find((c) => c.category === 'Coffee');
      expect(coffeeCat).toBeDefined();
    });
  });

  describe('Kitchen Speed of Service Metrics', () => {
    it('GET /api/v1/reports/kitchen — should return station speeds and fulfillment rate', async () => {
      const res = await request(app).get('/api/v1/reports/kitchen');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('averagePrepTimeMinutes');
      expect(res.body.data).toHaveProperty('stationMetrics');
      expect(res.body.data.stationMetrics).toHaveProperty('beverageBarista');
      expect(res.body.data.stationMetrics).toHaveProperty('hotKitchenChef');
      expect(res.body.data).toHaveProperty('onTimeFulfillmentRate');
      expect(Array.isArray(res.body.data.peakRushHours)).toBe(true);
    });
  });

  describe('Centralized Audit Trail Inspector (SRS §11 Non-Negotiable)', () => {
    it('GET /api/v1/reports/audit-logs — should retrieve and filter audit log entries', async () => {
      // Seed an audit log entry
      await logAuditTrail({
        actorRole: 'Owner/Admin',
        action: 'TEST_AUDIT_ACTION',
        entityName: 'Order',
        entityId: 'ord-test-999',
        notes: 'Test audit log entry for Phase 7 verification',
      });

      const res = await request(app).get('/api/v1/reports/audit-logs');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.pagination).toHaveProperty('total');
      expect(Array.isArray(res.body.data)).toBe(true);

      const found = res.body.data.find((l) => l.action === 'TEST_AUDIT_ACTION');
      expect(found).toBeDefined();
      expect(found.notes).toContain('Phase 7 verification');

      // Filter by action
      const filterRes = await request(app).get('/api/v1/reports/audit-logs?action=TEST_AUDIT_ACTION');
      expect(filterRes.status).toBe(200);
      expect(filterRes.body.data.every((l) => l.action === 'TEST_AUDIT_ACTION')).toBe(true);
    });
  });

  describe('CSV Data Exports', () => {
    it('GET /api/v1/reports/export?type=sales&format=csv — should stream valid CSV headers', async () => {
      const res = await request(app).get('/api/v1/reports/export?type=sales&format=csv');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Order Number,Date,Type,Table,Payment Mode,Subtotal,Tax (5%),Discount,Total');
    });

    it('GET /api/v1/reports/export?type=products&format=csv — should stream product velocity CSV', async () => {
      const res = await request(app).get('/api/v1/reports/export?type=products&format=csv');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Item Name,Category,Quantity Sold,Total Revenue (INR)');
    });

    it('GET /api/v1/reports/export?type=audit&format=csv — should stream audit log CSV', async () => {
      const res = await request(app).get('/api/v1/reports/export?type=audit&format=csv');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Timestamp,Action,Entity,Entity ID,Actor Role,Notes');
    });
  });
});
