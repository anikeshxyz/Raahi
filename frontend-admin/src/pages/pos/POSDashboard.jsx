import React from 'react';
import { Utensils, Clock, CreditCard, Layers } from 'lucide-react';

export const POSDashboard = () => {
  return (
    <div>
      <div className="dashboard-grid">
        <div className="stat-card">
          <span className="stat-label">Active Tables</span>
          <span className="stat-value">6 / 18</span>
          <span className="stat-badge">32% Occupancy</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending KOTs</span>
          <span className="stat-value">4</span>
          <span className="stat-badge">Avg Prep: 11 mins</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Today's Revenue</span>
          <span className="stat-value">₹24,850</span>
          <span className="stat-badge">+14% vs yesterday</span>
        </div>
      </div>

      <div className="module-card">
        <div className="card-header">
          <h3 className="card-title">Live Floor & Table Management (Phase 2 Stub)</h3>
          <span className="status-pill">Ready for Phase 2 Implementation</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          The POS module will connect directly to <code>/api/v1/pos</code> and provide interactive table selection, real-time bill calculation with 5% GST, and payment options (Cash, UPI, Card, Split).
        </p>
      </div>
    </div>
  );
};
