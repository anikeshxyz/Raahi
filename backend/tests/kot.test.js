import request from 'supertest';
import app from '../src/app.js';
import { resetMemStore } from '../src/modules/pos/controller.js';

describe('Phase 3 Verification — KOT / KDS Kitchen Display System', () => {
  let sampleCoffee;
  let sampleToast;
  let sampleTable;
  let createdOrderId;
  let coffeeItemId;

  beforeAll(async () => {
    resetMemStore();

    // Get menu & tables
    const menuRes = await request(app).get('/api/v1/pos/menu');
    const allItems = menuRes.body.data.flatMap((cat) => cat.items);

    sampleCoffee = allItems.find((i) =>
      i.name.toLowerCase().includes('pour over') || i.name.toLowerCase().includes('coffee')
    ) || allItems[0];

    sampleToast = allItems.find((i) =>
      i.name.toLowerCase().includes('sourdough') || i.name.toLowerCase().includes('fries')
    ) || allItems[1];

    const tablesRes = await request(app).get('/api/v1/pos/tables');
    sampleTable = tablesRes.body.data[0];

    // Create an order with 1 coffee and 1 toast
    const orderRes = await request(app)
      .post('/api/v1/pos/orders')
      .send({
        tableId: String(sampleTable._id),
        orderType: 'dine-in',
        items: [
          { menuItemId: String(sampleCoffee._id), quantity: 1, notes: 'Extra hot' },
          { menuItemId: String(sampleToast._id), quantity: 1, notes: 'Gluten sensitive' },
        ],
        customerName: 'Kunal Singhania',
      });

    createdOrderId = orderRes.body.data._id;
    coffeeItemId = orderRes.body.data.items[0]._id;

    // Send KOT to kitchen
    await request(app).post(`/api/v1/pos/orders/${createdOrderId}/kot`);
  });

  it('GET /api/v1/kot should return module status', async () => {
    const res = await request(app).get('/api/v1/kot');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('module', 'kot');
    expect(res.body).toHaveProperty('status', 'ready');
  });

  it('GET /api/v1/kot/tickets should list active kitchen tickets with station tagging', async () => {
    const res = await request(app).get('/api/v1/kot/tickets');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const ticket = res.body.data.find((t) => String(t._id) === String(createdOrderId));
    expect(ticket).toBeDefined();
    expect(ticket.tableNumber).toBe(sampleTable.tableNumber);
    expect(ticket.kotStatus).toBe('preparing');
    expect(ticket).toHaveProperty('elapsedMinutes');
    expect(ticket.items.length).toBe(2);

    // Verify stations
    const beverageItem = ticket.items.find((i) => i.name === sampleCoffee.name);
    const kitchenItem = ticket.items.find((i) => i.name === sampleToast.name);

    expect(beverageItem.station).toBe('beverage');
    expect(kitchenItem.station).toBe('kitchen');
  });

  it('GET /api/v1/kot/tickets?station=beverage should filter to Barista station items only', async () => {
    const res = await request(app).get('/api/v1/kot/tickets?station=beverage');
    expect(res.statusCode).toEqual(200);

    const ticket = res.body.data.find((t) => String(t._id) === String(createdOrderId));
    expect(ticket).toBeDefined();
    expect(ticket.items.length).toBe(1);
    expect(ticket.items[0].station).toBe('beverage');
  });

  it('GET /api/v1/kot/tickets?station=kitchen should filter to Chef station items only', async () => {
    const res = await request(app).get('/api/v1/kot/tickets?station=kitchen');
    expect(res.statusCode).toEqual(200);

    const ticket = res.body.data.find((t) => String(t._id) === String(createdOrderId));
    expect(ticket).toBeDefined();
    expect(ticket.items.length).toBe(1);
    expect(ticket.items[0].station).toBe('kitchen');
  });

  it('PUT /api/v1/kot/tickets/:id/items/:itemId/status should update individual item to ready', async () => {
    const res = await request(app)
      .put(`/api/v1/kot/tickets/${createdOrderId}/items/${coffeeItemId}/status`)
      .send({ status: 'ready' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);

    const updatedItem = res.body.data.items.find(
      (i) => String(i._id) === String(coffeeItemId) || String(i.menuItemId) === String(sampleCoffee._id)
    );
    expect(updatedItem.status).toBe('ready');
  });

  it('PUT /api/v1/kot/tickets/:id/status should mark entire ticket as ready and then completed', async () => {
    // 1. Mark ready
    const readyRes = await request(app)
      .put(`/api/v1/kot/tickets/${createdOrderId}/status`)
      .send({ kotStatus: 'ready' });

    expect(readyRes.statusCode).toEqual(200);
    expect(readyRes.body.data.kotStatus).toBe('ready');

    // 2. Mark completed
    const completeRes = await request(app)
      .put(`/api/v1/kot/tickets/${createdOrderId}/status`)
      .send({ kotStatus: 'completed' });

    expect(completeRes.statusCode).toEqual(200);
    expect(completeRes.body.data.kotStatus).toBe('completed');
  });

  it('GET /api/v1/kot/summary should return live kitchen KPIs', async () => {
    const res = await request(app).get('/api/v1/kot/summary');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('activeTickets');
    expect(res.body.data).toHaveProperty('preparingItems');
    expect(res.body.data).toHaveProperty('readyItems');
    expect(res.body.data).toHaveProperty('delayedTickets');
    expect(res.body.data).toHaveProperty('avgPrepTime');
  });

  it('PUT /api/v1/kot/tickets/:id/status should reject invalid status with 400', async () => {
    const res = await request(app)
      .put(`/api/v1/kot/tickets/${createdOrderId}/status`)
      .send({ kotStatus: 'invalid_status' });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });
});
