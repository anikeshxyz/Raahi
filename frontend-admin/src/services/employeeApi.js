const EMP_BASE = '/api/v1/employee';
const PAY_BASE = '/api/v1/payroll';

export const employeeApi = {
  // Employee Directory
  async getSummary() {
    const res = await fetch(`${EMP_BASE}/summary`);
    if (!res.ok) throw new Error('Failed to fetch employee summary');
    return res.json();
  },

  async getEmployees(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${EMP_BASE}/list?${query}` : `${EMP_BASE}/list`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch employees');
    return res.json();
  },

  async getEmployeeById(id) {
    const res = await fetch(`${EMP_BASE}/list/${id}`);
    if (!res.ok) throw new Error('Failed to fetch employee details');
    return res.json();
  },

  async createEmployee(payload) {
    const res = await fetch(`${EMP_BASE}/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || (data.errors ? data.errors.join(', ') : 'Failed to create employee'));
    return data;
  },

  async updateEmployee(id, payload) {
    const res = await fetch(`${EMP_BASE}/list/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || (data.errors ? data.errors.join(', ') : 'Failed to update employee'));
    return data;
  },

  async deleteEmployee(id) {
    const res = await fetch(`${EMP_BASE}/list/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to deactivate employee');
    return data;
  },

  // Attendance
  async getAttendance(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${EMP_BASE}/attendance?${query}` : `${EMP_BASE}/attendance`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return res.json();
  },

  async clockIn(payload) {
    const res = await fetch(`${EMP_BASE}/attendance/clock-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to clock in');
    return data;
  },

  async clockOut(payload) {
    const res = await fetch(`${EMP_BASE}/attendance/clock-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to clock out');
    return data;
  },

  // Leaves
  async getLeaves(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${EMP_BASE}/leaves?${query}` : `${EMP_BASE}/leaves`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch leaves');
    return res.json();
  },

  async createLeave(payload) {
    const res = await fetch(`${EMP_BASE}/leaves`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || (data.errors ? data.errors.join(', ') : 'Failed to submit leave request'));
    return data;
  },

  async updateLeaveStatus(id, payload) {
    const res = await fetch(`${EMP_BASE}/leaves/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update leave status');
    return data;
  },

  // Payroll
  async getPayrollRuns(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${PAY_BASE}/runs?${query}` : `${PAY_BASE}/runs`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch payroll runs');
    return res.json();
  },

  async getPayrollRunById(id) {
    const res = await fetch(`${PAY_BASE}/runs/${id}`);
    if (!res.ok) throw new Error('Failed to fetch payroll run');
    return res.json();
  },

  async generatePayroll(payload) {
    const res = await fetch(`${PAY_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to generate payroll');
    return data;
  },

  async updatePayoutAdjustment(runId, employeeId, payload) {
    const res = await fetch(`${PAY_BASE}/runs/${runId}/payouts/${employeeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to adjust payout');
    return data;
  },

  async updatePayrollStatus(runId, payload) {
    const res = await fetch(`${PAY_BASE}/runs/${runId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update payroll status');
    return data;
  },
};
