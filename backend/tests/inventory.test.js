import request from 'supertest';
import app from '../src/app.js';
import mongoose from 'mongoose';
import { AuditLog } from '../src/models/AuditLog.js';
import { resetMemStore } from '../src/modules/pos/controller.js';
import { resetMemInventoryStore, getMemInventory } from '../src/modules/inventory/controller.js';

describe('Phase 4 Verification — Inventory, Recipe Mapping & Automated Stock Deduction', () => {
  let initialBeansStock = 0;
  let beansItem = null;
  let pourOverMenuItem = null;
  let testTable = null;

  beforeAll(async () => {
    resetMemStore();
    resetMemInventoryStore();

    // 1. Fetch inventory items to find coffee beans
    const invRes = await request(app).get('/api/v1/inventory/items');
    beansItem = invRes.body.data.find((i) => i.name.toLowerCase().includes('beans'));
    initialBeansStock = beansItem.currentStock;

    // 2. Fetch POS menu to find Pour Over
    const menuRes = await request(app).get('/api/v1/pos/menu');
    const allItems = menuRes.body.data.flatMap((c) => c.items);
    pourOverMenuItem = allItems.find((i) => i.name.toLowerCase().includes('pour over'));

    // 3. Fetch tables
    const tablesRes = await request(app).get('/api/v1/pos/tables');
    testTable = tablesRes.body.data[0];
  });

  it('GET /api/v1/inventory should return module status', async () => {
    const res = await request(app).get('/api/v1/inventory');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('module', 'inventory');
    expect(res.body).toHaveProperty('status', 'ready');
  });

  it('GET /api/v1/inventory/items should return catalog and summary metrics', async () => {
    const res = await request(app).get('/api/v1/inventory/items');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(10);

    expect(res.body.summary).toHaveProperty('totalSKUs');
    expect(res.body.summary).toHaveProperty('lowStockCount');
    expect(res.body.summary).toHaveProperty('totalValuation');
    expect(res.body.summary.totalValuation).toBeGreaterThan(0);
  });

  it('GET /api/v1/inventory/low-stock should return items at or below reorder level', async () => {
    const res = await request(app).get('/api/v1/inventory/low-stock');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    res.body.data.forEach((item) => {
      expect(item.currentStock).toBeLessThanOrEqual(item.reorderLevel);
    });
  });

  it('POST /api/v1/inventory/items should create new SKU and reject duplicates', async () => {
    const newSkuPayload = {
      name: 'Organic Madagascar Vanilla Pods',
      sku: 'RAW-VAN-001',
      category: 'condiments',
      currentStock: 1.5,
      reorderLevel: 0.5,
      unit: 'kg',
      costPerUnit: 4500,
    };

    const res = await request(app).post('/api/v1/inventory/items').send(newSkuPayload);
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sku).toBe('RAW-VAN-001');

    // Reject duplicate SKU
    const dupRes = await request(app).post('/api/v1/inventory/items').send(newSkuPayload);
    expect(dupRes.statusCode).toEqual(400);
    expect(dupRes.body.success).toBe(false);
  });

  it('POST /api/v1/inventory/items/:id/adjust should reject adjustment without reason', async () => {
    const res = await request(app)
      .post(`/api/v1/inventory/items/${beansItem._id}/adjust`)
      .send({
        adjustmentType: 'subtract',
        quantity: 1,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/inventory/items/:id/adjust should adjust stock and write to AuditLog', async () => {
    const res = await request(app)
      .post(`/api/v1/inventory/items/${beansItem._id}/adjust`)
      .send({
        adjustmentType: 'subtract',
        quantity: 2,
        reason: 'Barista batch calibration wastage',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.currentStock).toBe(initialBeansStock - 2);

    // Verify Audit Log
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const log = await AuditLog.findOne({
        entityId: String(beansItem._id),
        action: 'STOCK_ADJUSTMENT',
      });
      expect(log).not.toBeNull();
      expect(log.notes).toContain('Barista batch calibration wastage');
    }
  });

  it('GET /api/v1/inventory/recipes should list recipe mappings with ingredients', async () => {
    const res = await request(app).get('/api/v1/inventory/recipes');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(4);
  });

  // NON-NEGOTIABLE TEST: Automated stock deduction on POS sale & restoration on cancel
  it('POS sale must automatically deduct stock via recipe mapping', async () => {
    // Check beans stock prior to order
    const beforeRes = await request(app).get('/api/v1/inventory/items');
    const beansBefore = beforeRes.body.data.find((i) => String(i._id) === String(beansItem._id));
    const startStock = beansBefore.currentStock;

    // Place an order for 2 cups of Pour Over (each recipe specifies 0.018 kg beans -> total 0.036 kg)
    const orderRes = await request(app)
      .post('/api/v1/pos/orders')
      .send({
        tableId: String(testTable._id),
        orderType: 'dine-in',
        items: [
          {
            menuItemId: String(pourOverMenuItem._id),
            quantity: 2,
          },
        ],
        customerName: 'Aarav Patel',
      });

    expect(orderRes.statusCode).toEqual(201);
    const orderId = orderRes.body.data._id;

    // Verify beans stock was deducted by exactly 0.036 kg
    const afterRes = await request(app).get('/api/v1/inventory/items');
    const beansAfter = afterRes.body.data.find((i) => String(i._id) === String(beansItem._id));
    const expectedDeducted = Math.round((startStock - 0.036) * 1000) / 1000;
    expect(beansAfter.currentStock).toBe(expectedDeducted);

    // Cancel order and verify stock restored
    const cancelRes = await request(app)
      .post(`/api/v1/pos/orders/${orderId}/cancel`)
      .send({ reason: 'Guest cancelled order' });

    expect(cancelRes.statusCode).toEqual(200);

    const restoredRes = await request(app).get('/api/v1/inventory/items');
    const beansRestored = restoredRes.body.data.find((i) => String(i._id) === String(beansItem._id));
    expect(beansRestored.currentStock).toBe(startStock);
  });
});
