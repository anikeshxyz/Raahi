import request from 'supertest';
import app from '../src/app.js';
import mongoose from 'mongoose';
import { AuditLog } from '../src/models/AuditLog.js';
import { getMemAuditLogs, resetMemStore } from '../src/modules/pos/controller.js';

describe('Phase 2 Verification — POS Core, Tables, Billing & Payments', () => {
  let sampleMenuItem;
  let secondMenuItem;
  let testTable;

  beforeAll(async () => {
    resetMemStore();
    // Fetch menu items through the POS endpoint (works with both DB and in-memory fallback)
    const menuRes = await request(app).get('/api/v1/pos/menu');
    const allItems = menuRes.body.data.flatMap((cat) => cat.items);
    sampleMenuItem = allItems[0];
    secondMenuItem = allItems[1];
  });

  it('GET /api/v1/pos/tables should auto-seed and return café tables', async () => {
    const res = await request(app).get('/api/v1/pos/tables');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(12);

    testTable = res.body.data[0];
    expect(testTable).toHaveProperty('tableNumber');
    expect(testTable).toHaveProperty('capacity');
    expect(testTable.status).toBe('vacant');
  });

  it('GET /api/v1/pos/menu should return categories populated with menu items', async () => {
    const res = await request(app).get('/api/v1/pos/menu');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty('items');
    expect(res.body.data[0].items.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/pos/orders should reject dine-in order without tableId', async () => {
    const invalidPayload = {
      orderType: 'dine-in',
      items: [{ menuItemId: String(sampleMenuItem._id), quantity: 2 }],
    };

    const res = await request(app).post('/api/v1/pos/orders').send(invalidPayload);
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContain('Table selection is required for dine-in orders');
  });

  it('POST /api/v1/pos/orders should create dine-in order and mark table occupied', async () => {
    const orderPayload = {
      tableId: String(testTable._id),
      orderType: 'dine-in',
      items: [
        {
          menuItemId: String(sampleMenuItem._id),
          quantity: 2,
          notes: 'Extra hot',
        },
      ],
      customerName: 'Rahul Verma',
      customerPhone: '9876543210',
    };

    const res = await request(app).post('/api/v1/pos/orders').send(orderPayload);
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('orderNumber');
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.paymentStatus).toBe('unpaid');

    const expectedSubTotal = Math.round(sampleMenuItem.price * 2 * 100) / 100;
    const expectedTax = Math.round(expectedSubTotal * 0.05 * 100) / 100;
    const expectedGrandTotal = expectedSubTotal + expectedTax;

    expect(res.body.data.subTotal).toBe(expectedSubTotal);
    expect(res.body.data.taxTotal).toBe(expectedTax);
    expect(res.body.data.grandTotal).toBe(expectedGrandTotal);

    // Verify table updated to occupied
    const tablesRes = await request(app).get('/api/v1/pos/tables');
    const updatedTable = tablesRes.body.data.find((t) => String(t._id) === String(testTable._id));
    expect(updatedTable.status).toBe('occupied');
    expect(String(updatedTable.currentOrderId._id || updatedTable.currentOrderId)).toBe(
      String(res.body.data._id)
    );
  });

  it('PUT /api/v1/pos/orders/:id/items should append items and recompute running bill', async () => {
    const tablesRes = await request(app).get('/api/v1/pos/tables');
    const tableWithOrder = tablesRes.body.data.find((t) => String(t._id) === String(testTable._id));
    const orderId = tableWithOrder.currentOrderId._id || tableWithOrder.currentOrderId;

    const addPayload = {
      items: [
        {
          menuItemId: String(secondMenuItem._id),
          quantity: 1,
          notes: 'No sugar',
        },
      ],
    };

    const res = await request(app).put(`/api/v1/pos/orders/${orderId}/items`).send(addPayload);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(2);

    const expectedSub =
      Math.round((sampleMenuItem.price * 2 + secondMenuItem.price * 1) * 100) / 100;
    const expectedTax = Math.round(expectedSub * 0.05 * 100) / 100;
    expect(res.body.data.subTotal).toBe(expectedSub);
    expect(res.body.data.taxTotal).toBe(expectedTax);
  });

  it('POST /api/v1/pos/orders/:id/kot should update status to in-kitchen and set kotPrintedAt', async () => {
    const tablesRes = await request(app).get('/api/v1/pos/tables');
    const tableWithOrder = tablesRes.body.data.find((t) => String(t._id) === String(testTable._id));
    const orderId = tableWithOrder.currentOrderId._id || tableWithOrder.currentOrderId;

    const res = await request(app).post(`/api/v1/pos/orders/${orderId}/kot`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.status).toBe('in-kitchen');
    expect(res.body.data.kotStatus).toBe('preparing');
    expect(res.body.data.items[0].status).toBe('preparing');
    expect(res.body.data.items[0].kotPrintedAt).not.toBeNull();
  });

  it('POST /api/v1/pos/orders/:id/settle should settle bill, free table, and generate receipt', async () => {
    const tablesRes = await request(app).get('/api/v1/pos/tables');
    const tableWithOrder = tablesRes.body.data.find((t) => String(t._id) === String(testTable._id));
    const orderId = tableWithOrder.currentOrderId._id || tableWithOrder.currentOrderId;

    const settlePayload = {
      paymentMethod: 'split',
      splitDetails: {
        cash: 300,
        upi: 200,
      },
      discountAmount: 50,
      customerName: 'Rahul Verma',
    };

    const res = await request(app).post(`/api/v1/pos/orders/${orderId}/settle`).send(settlePayload);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.paymentStatus).toBe('paid');
    expect(res.body.data.status).toBe('billed');
    expect(res.body.data.discountAmount).toBe(50);

    // Verify receipt payload
    expect(res.body).toHaveProperty('receipt');
    expect(res.body.receipt.cafeName).toBe('Raahi Café');
    expect(res.body.receipt.discount).toBe(50);
    expect(res.body.receipt.cgst).toBeGreaterThan(0);
    expect(res.body.receipt.sgst).toBeGreaterThan(0);

    // Verify table is freed
    const freedRes = await request(app).get('/api/v1/pos/tables');
    const freedTable = freedRes.body.data.find((t) => String(t._id) === String(testTable._id));
    expect(freedTable.status).toBe('vacant');
    expect(freedTable.currentOrderId).toBeNull();
  });

  it('POST /api/v1/pos/orders/:id/cancel should cancel order, free table, and log audit trail', async () => {
    // 1. Find table T2
    const tablesRes = await request(app).get('/api/v1/pos/tables');
    const table2 = tablesRes.body.data.find((t) => t.tableNumber === 'T2');

    // Create a fresh order on table2
    const createRes = await request(app)
      .post('/api/v1/pos/orders')
      .send({
        tableId: String(table2._id),
        orderType: 'dine-in',
        items: [{ menuItemId: String(sampleMenuItem._id), quantity: 1 }],
      });

    const newOrderId = createRes.body.data._id;

    // Verify table2 is occupied
    const checkOccupied = await request(app).get('/api/v1/pos/tables');
    const occupiedTable2 = checkOccupied.body.data.find((t) => t.tableNumber === 'T2');
    expect(occupiedTable2.status).toBe('occupied');

    // 2. Reject cancellation without reason
    const badCancel = await request(app)
      .post(`/api/v1/pos/orders/${newOrderId}/cancel`)
      .send({});
    expect(badCancel.statusCode).toEqual(400);

    // 3. Cancel with valid reason
    const cancelRes = await request(app)
      .post(`/api/v1/pos/orders/${newOrderId}/cancel`)
      .send({ reason: 'Guest changed mind before cooking started' });

    expect(cancelRes.statusCode).toEqual(200);
    expect(cancelRes.body.data.status).toBe('cancelled');

    // 4. Verify table2 is freed
    const checkFreed = await request(app).get('/api/v1/pos/tables');
    const releasedTable2 = checkFreed.body.data.find((t) => t.tableNumber === 'T2');
    expect(releasedTable2.status).toBe('vacant');
    expect(releasedTable2.currentOrderId).toBeNull();

    // 5. Verify mandatory AuditLog written
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const auditRecord = await AuditLog.findOne({
        entityId: String(newOrderId),
        action: 'ORDER_CANCELLED',
      });
      expect(auditRecord).not.toBeNull();
      expect(auditRecord.notes).toBe('Guest changed mind before cooking started');
    } else {
      const logs = getMemAuditLogs();
      const match = logs.find(
        (l) => l.action === 'ORDER_CANCELLED' && l.entityId === String(newOrderId)
      );
      expect(match).toBeDefined();
      expect(match.notes).toBe('Guest changed mind before cooking started');
    }
  });
});
