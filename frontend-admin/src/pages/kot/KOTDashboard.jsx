import React from 'react';
import { ChefHat, CheckCircle2, Clock } from 'lucide-react';

export const KOTDashboard = () => {
  return (
    <div>
      <div className="dashboard-grid">
        <div className="stat-card">
          <span className="stat-label">Tickets in Kitchen</span>
          <span className="stat-value">5</span>
          <span className="stat-badge">Live Orders</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Items Preparing</span>
          <span className="stat-value">12</span>
          <span className="stat-badge">On Stove / Oven</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Ready for Pickup</span>
          <span className="stat-value" style={{ color: '#10b981' }}>2</span>
          <span className="stat-badge">Waitstaff Alerted</span>
        </div>
      </div>

      <div className="module-card">
        <div className="card-header">
          <h3 className="card-title">Kitchen Display System (Phase 3 Stub)</h3>
          <span className="status-pill">Ready for Phase 3 Implementation</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Real-time kitchen order ticket management, order routing to kitchen stations, item preparation statuses (Preparing, Ready, Served), and delay alerts.
        </p>
      </div>
    </div>
  );
};
