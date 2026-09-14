import request from 'supertest';
import app from '../src/app.js';
import * as models from '../src/models/index.js';

describe('Phase 0 Verification — API & Model Integrity', () => {
  it('GET /api/v1/health should return status 200 with system info', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('system', 'Raahi Café API');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/v1/pos should return modular status', async () => {
    const res = await request(app).get('/api/v1/pos');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('module', 'pos');
    expect(res.body).toHaveProperty('status', 'ready');
  });

  it('All core Mongoose models should be defined and instantiable', () => {
    const requiredModels = [
      'User',
      'Employee',
      'Category',
      'MenuItem',
      'Table',
      'Order',
      'InventoryItem',
      'Recipe',
      'Supplier',
      'PurchaseOrder',
      'Attendance',
      'LeaveRequest',
      'PayrollRun',
      'AuditLog',
    ];

    requiredModels.forEach((modelName) => {
      expect(models[modelName]).toBeDefined();
      expect(typeof models[modelName]).toBe('function');
    });
  });
});
