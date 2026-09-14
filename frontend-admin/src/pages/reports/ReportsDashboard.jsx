import React from 'react';
import { BarChart, TrendingUp, DollarSign } from 'lucide-react';

export const ReportsDashboard = () => {
  return (
    <div>
      <div className="dashboard-grid">
        <div className="stat-card">
          <span className="stat-label">Monthly Gross</span>
          <span className="stat-value">₹6,84,300</span>
          <span className="stat-badge">+18.2% MoM</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Top Selling Category</span>
          <span className="stat-value">Beverages</span>
          <span className="stat-badge">42% of total sales</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Food Cost %</span>
          <span className="stat-value">28.4%</span>
          <span className="stat-badge">Healthy Margin</span>
        </div>
      </div>

      <div className="module-card">
        <div className="card-header">
          <h3 className="card-title">Business Intelligence & Reports (Phase 8 Stub)</h3>
          <span className="status-pill">Ready for Phase 8 Implementation</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Provides sales analytics, inventory turnover ratios, profit margin heatmaps, and staff productivity reports.
        </p>
      </div>
    </div>
  );
};
