import request from 'supertest';
import app from '../src/app.js';
import {
  resetMemPurchaseStore,
  getMemPurchaseOrders,
} from '../src/modules/purchase/controller.js';
import {
  resetMemInventoryStore,
  getMemInventory,
} from '../src/modules/inventory/controller.js';
import { getMemAuditLogs, resetMemAuditLogs } from '../src/middleware/audit.js';

describe('Phase 5: Purchase & Supplier Management API', () => {
  beforeEach(() => {
    resetMemPurchaseStore();
    resetMemInventoryStore();
    resetMemAuditLogs();
  });

  describe('Suppliers Management', () => {
    it('GET /api/v1/purchase/suppliers — should list seeded specialty suppliers', async () => {
      const res = await request(app).get('/api/v1/purchase/suppliers');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);

      const chikmagalur = res.body.data.find((s) => s.name.includes('Chikmagalur'));
      expect(chikmagalur).toBeDefined();
      expect(chikmagalur.gstin).toBe('29AAACG1234F1ZV');
    });

    it('POST /api/v1/purchase/suppliers — should create a new valid supplier', async () => {
      const newSupplier = {
        name: 'Coorg Spice & Vanilla Planters',
        contactPerson: 'Kavita Somanna',
        phone: '+919480112233',
        email: 'orders@coorgspice.in',
        address: 'Madikeri Road, Coorg, Karnataka 571201',
        gstin: '29AAACS4321K1ZX',
      };

      const res = await request(app)
        .post('/api/v1/purchase/suppliers')
        .send(newSupplier);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(newSupplier.name);
      expect(res.body.data.gstin).toBe(newSupplier.gstin);
    });

    it('POST /api/v1/purchase/suppliers — should reject invalid GSTIN format', async () => {
      const res = await request(app)
        .post('/api/v1/purchase/suppliers')
        .send({
          name: 'Faulty GSTIN Vendor',
          phone: '+919999988888',
          gstin: 'INVALID-GSTIN-123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e) => e.includes('GSTIN'))).toBe(true);
    });

    it('PUT /api/v1/purchase/suppliers/:id — should update supplier details', async () => {
      const res = await request(app)
        .put('/api/v1/purchase/suppliers/sup-chikmagalur-001')
        .send({
          contactPerson: 'Rohan Gowda (Senior Partner)',
          phone: '+919845099999',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.contactPerson).toBe('Rohan Gowda (Senior Partner)');
      expect(res.body.data.phone).toBe('+919845099999');
    });

    it('DELETE /api/v1/purchase/suppliers/:id — should soft-deactivate supplier', async () => {
      const res = await request(app).delete('/api/v1/purchase/suppliers/sup-ecopack-004');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isActive).toBe(false);

      // Verify active filter excludes deactivated supplier
      const activeRes = await request(app).get('/api/v1/purchase/suppliers?active=true');
      expect(activeRes.body.data.some((s) => s._id === 'sup-ecopack-004')).toBe(false);
    });
  });

  describe('Purchase Orders Management & Automated Stock Inward', () => {
    it('GET /api/v1/purchase/orders — should return orders with calculated totals', async () => {
      const res = await request(app).get('/api/v1/purchase/orders');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('POST /api/v1/purchase/orders — should create PO with line items and auto-calculate total', async () => {
      const payload = {
        supplierId: 'sup-chikmagalur-001',
        items: [
          {
            inventoryItemId: 'inv-beans-001',
            quantity: 15,
            unitCost: 1400,
          },
          {
            inventoryItemId: 'inv-matcha-006',
            quantity: 5,
            unitCost: 3200,
          },
        ],
        notes: 'Monthly batch order for specialty Arabica and Uji Matcha',
      };

      const res = await request(app)
        .post('/api/v1/purchase/orders')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.poNumber).toMatch(/^PO-\d{4}-\d{4}$/);
      expect(res.body.data.status).toBe('draft');
      // 15 * 1400 = 21000, 5 * 3200 = 16000 -> Total = 37000
      expect(res.body.data.totalAmount).toBe(37000);
      expect(res.body.data.items.length).toBe(2);
      expect(res.body.data.items[0].totalCost).toBe(21000);
      expect(res.body.data.items[1].totalCost).toBe(16000);
    });

    it('POST /api/v1/purchase/orders — should reject PO without items', async () => {
      const res = await request(app)
        .post('/api/v1/purchase/orders')
        .send({
          supplierId: 'sup-chikmagalur-001',
          items: [],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/purchase/orders/:id/receive — should credit inventory stock and record audit log', async () => {
      // 1. Check initial stock of Whole Milk (DAI-MLK-001)
      const invBefore = getMemInventory().find((i) => i.sku === 'DAI-MLK-001' || String(i._id) === '65f033333333333333330002');
      expect(invBefore).toBeDefined();
      const initialStock = invBefore.currentStock;

      // 2. PO po-initial-002 has 100 liters of Whole Milk
      const res = await request(app).post('/api/v1/purchase/orders/po-initial-002/receive');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('received');
      expect(res.body.data.receivedDate).toBeDefined();

      // 3. Verify stock has incremented by 100
      const invAfter = getMemInventory().find((i) => i.sku === 'DAI-MLK-001' || String(i._id) === '65f033333333333333330002');
      expect(invAfter.currentStock).toBe(initialStock + 100);

      // 4. Verify mandatory audit logs written
      const auditLogs = getMemAuditLogs();
      const stockLog = auditLogs.find((l) => l.action === 'STOCK_INWARD_PO');
      expect(stockLog).toBeDefined();
      expect(stockLog.entityName).toBe('InventoryItem');
      expect(stockLog.beforeState.currentStock).toBe(initialStock);
      expect(stockLog.afterState.currentStock).toBe(initialStock + 100);

      const poLog = auditLogs.find((l) => l.action === 'PURCHASE_ORDER_RECEIVED');
      expect(poLog).toBeDefined();
    });

    it('POST /api/v1/purchase/orders/:id/receive — should reject receiving an already received PO', async () => {
      // po-initial-001 is already received
      const res = await request(app).post('/api/v1/purchase/orders/po-initial-001/receive');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already been received');
    });

    it('POST /api/v1/purchase/orders/:id/cancel — should cancel PO and record audit log', async () => {
      const res = await request(app)
        .post('/api/v1/purchase/orders/po-initial-002/cancel')
        .send({ reason: 'Supplier out of stock for organic batch' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('cancelled');

      const auditLogs = getMemAuditLogs();
      const cancelLog = auditLogs.find((l) => l.action === 'PURCHASE_ORDER_CANCELLED');
      expect(cancelLog).toBeDefined();
      expect(cancelLog.notes).toContain('Supplier out of stock for organic batch');
    });

    it('POST /api/v1/purchase/orders/:id/cancel — should not cancel already received PO', async () => {
      const res = await request(app)
        .post('/api/v1/purchase/orders/po-initial-001/cancel')
        .send({ reason: 'Try to cancel received' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already been received');
    });

    it('GET /api/v1/purchase/summary — should return correct purchase KPIs', async () => {
      const res = await request(app).get('/api/v1/purchase/summary');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('activeSuppliers');
      expect(res.body.data).toHaveProperty('pendingOrders');
      expect(res.body.data).toHaveProperty('receivedOrders');
      expect(res.body.data).toHaveProperty('totalInwardSpend');
      expect(res.body.data.activeSuppliers).toBe(4);
      expect(res.body.data.receivedOrders).toBe(1);
      expect(res.body.data.totalInwardSpend).toBe(35000);
    });
  });
});
