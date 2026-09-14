import React from 'react';
import { AlertTriangle, PackageCheck, RefreshCw } from 'lucide-react';

export const InventoryDashboard = () => {
  return (
    <div>
      <div className="dashboard-grid">
        <div className="stat-card">
          <span className="stat-label">Total SKUs</span>
          <span className="stat-value">142</span>
          <span className="stat-badge">Active Catalog</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Low Stock Alerts</span>
          <span className="stat-value" style={{ color: '#ef4444' }}>3 Items</span>
          <span className="stat-badge" style={{ color: '#ef4444' }}>Needs Reorder</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Stock Value</span>
          <span className="stat-value">₹1,84,200</span>
          <span className="stat-badge">Current Valuation</span>
        </div>
      </div>

      <div className="module-card">
        <div className="card-header">
          <h3 className="card-title">Inventory & Recipe Mapping (Phase 4 Stub)</h3>
          <span className="status-pill">Ready for Phase 4 Implementation</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Per <code>AGENTS.md</code> non-negotiables, stock deductions will trigger automatically via recipe mapping on every POS sale in an atomic MongoDB transaction.
        </p>
      </div>
    </div>
  );
};
