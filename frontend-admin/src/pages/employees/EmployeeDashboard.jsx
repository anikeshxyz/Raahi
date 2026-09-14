import React from 'react';
import { Users, Clock, Calendar } from 'lucide-react';

export const EmployeeDashboard = () => {
  return (
    <div>
      <div className="dashboard-grid">
        <div className="stat-card">
          <span className="stat-label">Active Staff</span>
          <span className="stat-value">16</span>
          <span className="stat-badge">Across 5 Departments</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Present Today</span>
          <span className="stat-value">14</span>
          <span className="stat-badge">87.5% Attendance</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending Leaves</span>
          <span className="stat-value">2</span>
          <span className="stat-badge" style={{ color: '#f59e0b' }}>Requires Review</span>
        </div>
      </div>

      <div className="module-card">
        <div className="card-header">
          <h3 className="card-title">Staff, Attendance & Leave Management (Phase 6 Stub)</h3>
          <span className="status-pill">Ready for Phase 6 Implementation</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Covers employee profiles, daily check-in/out timestamps, leave approval workflows, and provides inputs for automated payroll processing.
        </p>
      </div>
    </div>
  );
};
