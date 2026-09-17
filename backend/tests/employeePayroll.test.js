import request from 'supertest';
import app from '../src/app.js';
import {
  resetMemEmployeeStore,
  getMemEmployees,
} from '../src/modules/employee/controller.js';
import {
  resetMemPayrollStore,
  getMemPayrollRuns,
} from '../src/modules/payroll/controller.js';
import { getMemAuditLogs, resetMemAuditLogs } from '../src/middleware/audit.js';

describe('Phase 6: Employee, Attendance & Payroll Management API', () => {
  beforeEach(() => {
    resetMemEmployeeStore();
    resetMemPayrollStore();
    resetMemAuditLogs();
  });

  describe('Employee Management & Salary Change Audit Logging', () => {
    it('GET /api/v1/employee/list — should return seeded café employees', async () => {
      const res = await request(app).get('/api/v1/employee/list');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(6);

      const rajiv = res.body.data.find((e) => e.employeeCode === 'EMP-001');
      expect(rajiv).toBeDefined();
      expect(rajiv.designation).toContain('Head Barista');
      expect(rajiv.baseSalary).toBe(38000);
    });

    it('POST /api/v1/employee/list — should create a new employee', async () => {
      const newEmp = {
        firstName: 'Ananya',
        lastName: 'Sen',
        email: 'ananya.sen@raahicafe.com',
        phone: '+919845077777',
        department: 'Service/Floor',
        designation: 'Host & Cashier',
        baseSalary: 26000,
      };

      const res = await request(app).post('/api/v1/employee/list').send(newEmp);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe('Ananya');
      expect(res.body.data.employeeCode).toMatch(/^EMP-\d{3}$/);
      expect(res.body.data.status).toBe('Active');
    });

    it('POST /api/v1/employee/list — should reject invalid email', async () => {
      const res = await request(app).post('/api/v1/employee/list').send({
        firstName: 'Bad',
        lastName: 'Email',
        email: 'not-an-email',
        phone: '+919999988888',
        department: 'Kitchen',
        designation: 'Cook',
        baseSalary: 20000,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    // NON-NEGOTIABLE: Salary change must write to AuditLog per AGENTS.md
    it('PUT /api/v1/employee/list/:id — should update base salary and record mandatory AuditLog', async () => {
      const rajiv = getMemEmployees().find((e) => e.employeeCode === 'EMP-001');
      const prevSalary = rajiv.baseSalary; // 38000
      const newSalary = 42000;

      const res = await request(app)
        .put(`/api/v1/employee/list/${rajiv._id}`)
        .send({ baseSalary: newSalary });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.baseSalary).toBe(newSalary);
      expect(res.body.salaryAuditLogged).toBe(true);

      // Verify Audit Log entry
      const auditLogs = getMemAuditLogs();
      const salaryLog = auditLogs.find((l) => l.action === 'SALARY_CHANGE');
      expect(salaryLog).toBeDefined();
      expect(salaryLog.entityName).toBe('Employee');
      expect(salaryLog.entityId).toBe(String(rajiv._id));
      expect(salaryLog.beforeState.baseSalary).toBe(prevSalary);
      expect(salaryLog.afterState.baseSalary).toBe(newSalary);
      expect(salaryLog.notes).toContain('Base monthly salary updated');
    });

    it('DELETE /api/v1/employee/list/:id — should soft-deactivate employee', async () => {
      const emp = getMemEmployees().find((e) => e.employeeCode === 'EMP-006');

      const res = await request(app).delete(`/api/v1/employee/list/${emp._id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Inactive');

      const auditLogs = getMemAuditLogs();
      const deactLog = auditLogs.find((l) => l.action === 'EMPLOYEE_DEACTIVATED');
      expect(deactLog).toBeDefined();
    });
  });

  describe('Attendance & Shifts Tracking', () => {
    it('POST /api/v1/employee/attendance/clock-in — should record check-in', async () => {
      const emp = getMemEmployees().find((e) => e.employeeCode === 'EMP-003');
      const testDate = '2026-09-17';

      const res = await request(app).post('/api/v1/employee/attendance/clock-in').send({
        employeeId: String(emp._id),
        date: testDate,
        checkIn: '2026-09-17T08:00:00Z',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Present');
      expect(res.body.data.checkIn).toBeDefined();
    });

    it('POST /api/v1/employee/attendance/clock-out — should record check-out and compute working hours', async () => {
      const emp = getMemEmployees().find((e) => e.employeeCode === 'EMP-001');
      const today = new Date().toISOString().split('T')[0];

      const res = await request(app).post('/api/v1/employee/attendance/clock-out').send({
        employeeId: String(emp._id),
        date: today,
        checkOut: new Date(new Date().setHours(16, 30, 0, 0)),
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.workingHours).toBeGreaterThan(0);
      expect(res.body.data.status).toBe('Present');
    });

    it('GET /api/v1/employee/attendance — should return attendance records', async () => {
      const res = await request(app).get('/api/v1/employee/attendance');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Leave Requests & Approvals', () => {
    it('POST /api/v1/employee/leaves — should submit leave request', async () => {
      const emp = getMemEmployees().find((e) => e.employeeCode === 'EMP-002');

      const res = await request(app).post('/api/v1/employee/leaves').send({
        employeeId: String(emp._id),
        leaveType: 'Sick',
        startDate: '2026-10-01',
        endDate: '2026-10-02',
        totalDays: 2,
        reason: 'Seasonal flu recovery',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Pending');
      expect(res.body.data.leaveType).toBe('Sick');
    });

    it('PUT /api/v1/employee/leaves/:id/status — should approve leave request', async () => {
      const res = await request(app)
        .put('/api/v1/employee/leaves/leave-001/status')
        .send({
          status: 'Approved',
          adminNotes: 'Approved by Floor Manager',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Approved');
      expect(res.body.data.adminNotes).toBe('Approved by Floor Manager');
    });
  });

  describe('Payroll Calculation, Adjustments & Disbursement (Money-Touching)', () => {
    it('GET /api/v1/payroll/runs — should list existing payroll runs', async () => {
      const res = await request(app).get('/api/v1/payroll/runs');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('POST /api/v1/payroll/generate — should calculate monthly payroll across active employees', async () => {
      const res = await request(app)
        .post('/api/v1/payroll/generate')
        .send({ month: 9, year: 2026 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.month).toBe(9);
      expect(res.body.data.year).toBe(2026);
      expect(res.body.data.status).toBe('Draft');
      expect(res.body.data.payouts.length).toBe(6);
      expect(res.body.data.totalDisbursement).toBeGreaterThan(0);

      // Verify each payout structure
      res.body.data.payouts.forEach((p) => {
        expect(p).toHaveProperty('baseSalary');
        expect(p).toHaveProperty('additions');
        expect(p).toHaveProperty('deductions');
        expect(p).toHaveProperty('netSalary');
        expect(p.netSalary).toBe(p.baseSalary + p.additions - p.deductions);
      });
    });

    it('PUT /api/v1/payroll/runs/:id/payouts/:employeeId — should update bonuses and deductions', async () => {
      // First generate September 2026 payroll
      const genRes = await request(app)
        .post('/api/v1/payroll/generate')
        .send({ month: 9, year: 2026 });
      const runId = genRes.body.data._id;
      const targetEmpId = genRes.body.data.payouts[0].employeeId._id || genRes.body.data.payouts[0].employeeId;
      const originalBase = genRes.body.data.payouts[0].baseSalary;

      const adjustRes = await request(app)
        .put(`/api/v1/payroll/runs/${runId}/payouts/${targetEmpId}`)
        .send({
          additions: 3000,
          deductions: 500,
          remarks: 'Festive bonus less uniform advance',
        });

      expect(adjustRes.status).toBe(200);
      expect(adjustRes.body.success).toBe(true);

      const updatedPayout = adjustRes.body.data.payouts.find(
        (p) => String(p.employeeId._id || p.employeeId) === String(targetEmpId)
      );
      expect(updatedPayout.additions).toBe(3000);
      expect(updatedPayout.deductions).toBe(500);
      expect(updatedPayout.netSalary).toBe(originalBase + 3000 - 500);
    });

    it('PUT /api/v1/payroll/runs/:id/status — should approve and disburse payroll with AuditLog', async () => {
      // Generate run
      const genRes = await request(app)
        .post('/api/v1/payroll/generate')
        .send({ month: 9, year: 2026 });
      const runId = genRes.body.data._id;

      // 1. Approve run
      const approveRes = await request(app)
        .put(`/api/v1/payroll/runs/${runId}/status`)
        .send({ status: 'Approved' });
      expect(approveRes.status).toBe(200);
      expect(approveRes.body.data.status).toBe('Approved');

      // 2. Disburse (Paid)
      const payRes = await request(app)
        .put(`/api/v1/payroll/runs/${runId}/status`)
        .send({ status: 'Paid' });
      expect(payRes.status).toBe(200);
      expect(payRes.body.data.status).toBe('Paid');
      payRes.body.data.payouts.forEach((p) => {
        expect(p.isPaid).toBe(true);
        expect(p.paymentDate).toBeDefined();
      });

      // Verify Audit Log
      const auditLogs = getMemAuditLogs();
      const disburseLog = auditLogs.find((l) => l.action === 'PAYROLL_DISBURSED');
      expect(disburseLog).toBeDefined();
      expect(disburseLog.entityName).toBe('PayrollRun');
      expect(disburseLog.afterState.status).toBe('Paid');
    });

    it('GET /api/v1/employee/summary — should return HR & Payroll KPIs', async () => {
      const res = await request(app).get('/api/v1/employee/summary');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalStaff).toBe(6);
      expect(res.body.data.activeStaff).toBe(6);
      expect(res.body.data.monthlySalaryTotal).toBeGreaterThan(0);
    });
  });
});
