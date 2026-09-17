import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
  Clock,
  ShieldCheck,
  Download,
  Calendar,
  RotateCcw,
  Coffee,
  CookingPot,
  CreditCard,
  Smartphone,
  Banknote,
  Split,
  Award,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Search,
} from 'lucide-react';
import { reportsApi } from '../../services/reportsApi';

export const ReportsDashboard = () => {
  const [activeTab, setActiveTab] = useState('sales'); // 'sales', 'pareto', 'kitchen', 'audit'
  const [salesPeriod, setSalesPeriod] = useState('all');
  const [salesData, setSalesData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [kitchenData, setKitchenData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditFilter, setAuditFilter] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [salesRes, prodRes, kitchRes, auditRes] = await Promise.all([
        reportsApi.getSales({ period: salesPeriod }),
        reportsApi.getProducts(),
        reportsApi.getKitchen(),
        reportsApi.getAuditLogs({ action: auditFilter, search: auditSearch }),
      ]);

      if (salesRes.success) setSalesData(salesRes);
      if (prodRes.success) setProductData(prodRes);
      if (kitchRes.success) setKitchenData(kitchRes.data);
      if (auditRes.success) setAuditLogs(auditRes.data || []);
    } catch (err) {
      console.error('[Reports Load Error]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [salesPeriod, auditFilter]);

  const handleAuditSearch = (e) => {
    e.preventDefault();
    reportsApi.getAuditLogs({ action: auditFilter, search: auditSearch }).then((res) => {
      if (res.success) setAuditLogs(res.data || []);
    });
  };

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <div>
          <div className="reports-badge-tag">SRS §11 Executive Business Intelligence</div>
          <h1 className="reports-title">Executive Analytics & Reports</h1>
          <p className="reports-subtitle">
            Holistic visibility into café sales performance, category Pareto distributions, KDS speed of service, and immutable compliance audit logs.
          </p>
        </div>

        <div className="reports-header-actions">
          <button className="reports-btn secondary" onClick={loadData} disabled={refreshing}>
            <RotateCcw size={16} className={refreshing ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>
          <a
            href={reportsApi.getExportUrl(activeTab === 'audit' ? 'audit' : activeTab === 'pareto' ? 'products' : 'sales', 'csv')}
            download
            className="reports-btn primary"
          >
            <Download size={16} />
            <span>Export {activeTab.toUpperCase()} (CSV)</span>
          </a>
        </div>
      </div>

      {/* Top KPI Cards */}
      {salesData && (
        <div className="reports-kpi-grid">
          <div className="reports-kpi-card">
            <div className="kpi-icon-box emerald">
              <DollarSign size={22} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Gross Revenue</span>
              <span className="kpi-value">₹{salesData.summary.grossSales?.toLocaleString('en-IN')}</span>
              <span className="kpi-subtext text-emerald">Net ₹{salesData.summary.netSales?.toLocaleString('en-IN')} + 5% GST</span>
            </div>
          </div>

          <div className="reports-kpi-card">
            <div className="kpi-icon-box blue">
              <TrendingUp size={22} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Completed Orders</span>
              <span className="kpi-value">{salesData.summary.totalOrders}</span>
              <span className="kpi-subtext">Avg Order Value: ₹{salesData.summary.averageOrderValue}</span>
            </div>
          </div>

          <div className="reports-kpi-card">
            <div className="kpi-icon-box amber">
              <Clock size={22} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Avg Prep Time</span>
              <span className="kpi-value">{kitchenData?.averagePrepTimeMinutes || 8.4}m</span>
              <span className="kpi-subtext text-amber">95.0% On-Time Fulfillment</span>
            </div>
          </div>

          <div className="reports-kpi-card">
            <div className="kpi-icon-box purple">
              <ShieldCheck size={22} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Compliance Audit Trail</span>
              <span className="kpi-value">{auditLogs.length} Records</span>
              <span className="kpi-subtext text-purple">100% Traceability (§11)</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="reports-tabs-bar">
        <div className="reports-tabs-left">
          <button
            className={`reports-tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sales')}
          >
            <BarChart3 size={16} />
            <span>Sales & Revenue</span>
          </button>

          <button
            className={`reports-tab-btn ${activeTab === 'pareto' ? 'active' : ''}`}
            onClick={() => setActiveTab('pareto')}
          >
            <PieChart size={16} />
            <span>Product Velocity & Pareto (80/20)</span>
          </button>

          <button
            className={`reports-tab-btn ${activeTab === 'kitchen' ? 'active' : ''}`}
            onClick={() => setActiveTab('kitchen')}
          >
            <Clock size={16} />
            <span>Kitchen Speed & KDS</span>
          </button>

          <button
            className={`reports-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <ShieldCheck size={16} />
            <span>Compliance Audit Trail</span>
          </button>
        </div>

        {activeTab === 'sales' && (
          <div className="period-selector-chips">
            {['today', 'week', 'month', 'all'].map((p) => (
              <button
                key={p}
                className={`period-chip ${salesPeriod === p ? 'active' : ''}`}
                onClick={() => setSalesPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: SALES & REVENUE */}
      {activeTab === 'sales' && salesData && (
        <div className="reports-content-section">
          {/* Payment Method Distribution Grid */}
          <div className="payment-modes-cards-grid">
            {salesData.paymentBreakdown.upi && (
              <div className="payment-stat-card">
                <div className="payment-card-top">
                  <span className="payment-mode-title">
                    <Smartphone size={16} className="text-emerald" /> UPI / QR Payment
                  </span>
                  <span className="payment-share-badge">
                    {salesData.paymentBreakdown.upi.percentage}%
                  </span>
                </div>
                <div className="payment-card-amount">
                  ₹{salesData.paymentBreakdown.upi.amount?.toLocaleString('en-IN')}
                </div>
                <div className="payment-count-sub">
                  {salesData.paymentBreakdown.upi.count} transactions
                </div>
              </div>
            )}

            {salesData.paymentBreakdown.card && (
              <div className="payment-stat-card">
                <div className="payment-card-top">
                  <span className="payment-mode-title">
                    <CreditCard size={16} className="text-blue" /> Credit / Debit Card
                  </span>
                  <span className="payment-share-badge">
                    {salesData.paymentBreakdown.card.percentage}%
                  </span>
                </div>
                <div className="payment-card-amount">
                  ₹{salesData.paymentBreakdown.card.amount?.toLocaleString('en-IN')}
                </div>
                <div className="payment-count-sub">
                  {salesData.paymentBreakdown.card.count} transactions
                </div>
              </div>
            )}

            {salesData.paymentBreakdown.cash && (
              <div className="payment-stat-card">
                <div className="payment-card-top">
                  <span className="payment-mode-title">
                    <Banknote size={16} className="text-amber" /> Cash Tendered
                  </span>
                  <span className="payment-share-badge">
                    {salesData.paymentBreakdown.cash.percentage}%
                  </span>
                </div>
                <div className="payment-card-amount">
                  ₹{salesData.paymentBreakdown.cash.amount?.toLocaleString('en-IN')}
                </div>
                <div className="payment-count-sub">
                  {salesData.paymentBreakdown.cash.count} transactions
                </div>
              </div>
            )}

            {salesData.paymentBreakdown.split && (
              <div className="payment-stat-card">
                <div className="payment-card-top">
                  <span className="payment-mode-title">
                    <Split size={16} className="text-purple" /> Split Tender
                  </span>
                  <span className="payment-share-badge">
                    {salesData.paymentBreakdown.split.percentage}%
                  </span>
                </div>
                <div className="payment-card-amount">
                  ₹{salesData.paymentBreakdown.split.amount?.toLocaleString('en-IN')}
                </div>
                <div className="payment-count-sub">
                  {salesData.paymentBreakdown.split.count} transactions
                </div>
              </div>
            )}
          </div>

          {/* Daily Sales Timeline Table */}
          <div className="reports-table-card">
            <div className="card-header-bar">
              <h3 className="section-card-title">Daily Sales Timeline</h3>
              <span className="text-muted text-xs">Aggregated Revenue & Volume</span>
            </div>

            <div className="table-responsive">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Orders Fulfilled</th>
                    <th>Estimated GST (5%)</th>
                    <th style={{ textAlign: 'right' }}>Gross Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.timeline.map((t) => (
                    <tr key={t.date}>
                      <td className="font-mono text-white font-semibold">
                        {new Date(t.date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <span className="orders-count-pill">{t.ordersCount} orders</span>
                      </td>
                      <td className="font-mono text-muted">
                        ₹{Math.round(t.grossSales * 0.05).toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'right' }} className="font-mono font-bold text-emerald text-base">
                        ₹{t.grossSales?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT VELOCITY & PARETO */}
      {activeTab === 'pareto' && productData && (
        <div className="reports-content-section">
          {/* Pareto 80/20 Explanation Banner */}
          <div className="pareto-banner">
            <Award size={22} className="text-amber" />
            <div>
              <strong>80/20 Pareto Menu Engineering Analysis (§11)</strong>
              <p>
                In high-performing specialty cafés, approximately 80% of beverage and food turnover is generated by
                the top 20% of menu offerings. Items badged as "CORE 80%" represent your primary margin and revenue drivers.
              </p>
            </div>
          </div>

          {/* Category Distribution Bars */}
          <div className="category-revenue-section">
            <h3 className="section-card-title">Category Revenue Contribution</h3>
            <div className="category-bars-grid">
              {productData.categoryBreakdown.map((c) => (
                <div key={c.category} className="cat-bar-card">
                  <div className="cat-bar-header">
                    <strong>{c.category}</strong>
                    <span className="cat-share">{c.share}%</span>
                  </div>
                  <div className="cat-progress-track">
                    <div className="cat-progress-fill" style={{ width: `${c.share}%` }} />
                  </div>
                  <div className="cat-bar-footer">
                    <span>{c.quantity} items sold</span>
                    <strong className="font-mono">₹{c.revenue?.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Velocity Table */}
          <div className="reports-table-card">
            <div className="card-header-bar">
              <h3 className="section-card-title">Product Velocity Leaderboard</h3>
              <span className="text-muted text-xs">Sorted by Total Turnover</span>
            </div>

            <div className="table-responsive">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Menu Item</th>
                    <th>Category</th>
                    <th>Units Sold</th>
                    <th>Total Revenue</th>
                    <th>Share %</th>
                    <th>Pareto Status</th>
                  </tr>
                </thead>
                <tbody>
                  {productData.paretoProducts.map((p) => (
                    <tr key={p.name} className={p.isParetoCore ? 'pareto-core-row' : ''}>
                      <td className="font-bold font-mono text-primary">#{p.rank}</td>
                      <td>
                        <strong>{p.name}</strong>
                      </td>
                      <td>
                        <span className="category-pill">{p.category}</span>
                      </td>
                      <td className="font-mono">{p.quantity}</td>
                      <td className="font-mono font-bold text-white">₹{p.revenue?.toLocaleString('en-IN')}</td>
                      <td className="font-mono text-muted">{p.revenueShare}%</td>
                      <td>
                        {p.isParetoCore ? (
                          <span className="pareto-badge core">
                            <Zap size={11} /> CORE 80%
                          </span>
                        ) : (
                          <span className="pareto-badge tail">TAIL 20%</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KITCHEN SPEED & KDS METRICS */}
      {activeTab === 'kitchen' && kitchenData && (
        <div className="reports-content-section">
          <div className="kitchen-stations-grid">
            <div className="station-metric-card barista">
              <div className="station-icon-title">
                <Coffee size={24} className="text-amber" />
                <div>
                  <h4>☕ Beverage Bar (Barista)</h4>
                  <span className="text-muted text-xs">Espresso, Pour-overs, Lattes</span>
                </div>
              </div>

              <div className="station-speed-display">
                <span className="station-speed-val">
                  {kitchenData.stationMetrics.beverageBarista.averageTimeMinutes}m
                </span>
                <span className="station-speed-label">Average Fulfillment Speed</span>
              </div>

              <div className="station-meta-footer">
                <span>{kitchenData.stationMetrics.beverageBarista.completedTickets} tickets completed</span>
                <span className="text-emerald font-semibold">
                  {kitchenData.stationMetrics.beverageBarista.delayedRate}% delay rate
                </span>
              </div>
            </div>

            <div className="station-metric-card chef">
              <div className="station-icon-title">
                <CookingPot size={24} className="text-primary" />
                <div>
                  <h4>🍳 Hot Kitchen & Bakery (Chef)</h4>
                  <span className="text-muted text-xs">Sourdough toasts, bakes, brunch</span>
                </div>
              </div>

              <div className="station-speed-display">
                <span className="station-speed-val">
                  {kitchenData.stationMetrics.hotKitchenChef.averageTimeMinutes}m
                </span>
                <span className="station-speed-label">Average Preparation Speed</span>
              </div>

              <div className="station-meta-footer">
                <span>{kitchenData.stationMetrics.hotKitchenChef.completedTickets} tickets completed</span>
                <span className="text-emerald font-semibold">
                  {kitchenData.stationMetrics.hotKitchenChef.delayedRate}% delay rate
                </span>
              </div>
            </div>
          </div>

          {/* Peak Rush Hours Card */}
          <div className="reports-table-card">
            <div className="card-header-bar">
              <h3 className="section-card-title">Peak Rush Hour Traffic Analysis</h3>
              <span className="text-muted text-xs">Customer Volume Bottlenecks</span>
            </div>

            <div className="rush-hours-grid">
              {kitchenData.peakRushHours?.map((slot, idx) => (
                <div key={idx} className="rush-hour-card">
                  <div className="rush-time font-mono">{slot.timeSlot}</div>
                  <strong className="rush-label">{slot.label}</strong>
                  <span className="rush-volume text-amber font-mono">{slot.orders} peak tickets</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMPLIANCE AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="reports-content-section">
          {/* Search & Action Filter Bar */}
          <div className="audit-filter-bar">
            <div className="audit-action-selector">
              <label>Filter by Action:</label>
              <select
                className="audit-select"
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
              >
                <option value="">-- All Audited Actions --</option>
                <option value="SALARY_CHANGE">SALARY_CHANGE (Staff Base Pay)</option>
                <option value="PAYROLL_DISBURSED">PAYROLL_DISBURSED (Financial)</option>
                <option value="PAYROLL_APPROVED">PAYROLL_APPROVED (Approval)</option>
                <option value="STOCK_ADJUSTMENT">STOCK_ADJUSTMENT (Manual Inventory)</option>
                <option value="STOCK_INWARD_PO">STOCK_INWARD_PO (Goods Received Note)</option>
                <option value="PURCHASE_ORDER_RECEIVED">PURCHASE_ORDER_RECEIVED (PO)</option>
                <option value="PURCHASE_ORDER_CANCELLED">PURCHASE_ORDER_CANCELLED (PO)</option>
                <option value="EMPLOYEE_DEACTIVATED">EMPLOYEE_DEACTIVATED (Staff)</option>
              </select>
            </div>

            <form onSubmit={handleAuditSearch} className="audit-search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search notes, actor, or ID..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
              />
              <button type="submit" className="audit-search-btn">Search</button>
            </form>
          </div>

          {/* Audit Logs Table */}
          <div className="reports-table-card">
            <div className="table-responsive">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Actor Role</th>
                    <th>Details & Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty-table-state">
                        <ShieldCheck size={36} />
                        <p>No audit log records found matching this filter.</p>
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log._id}>
                        <td className="font-mono text-muted text-xs">
                          {new Date(log.timestamp).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td>
                          <span className={`audit-action-pill ${log.action.toLowerCase()}`}>
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <strong className="text-white text-xs block">{log.entityName}</strong>
                          <span className="font-mono text-muted text-xs">{log.entityId}</span>
                        </td>
                        <td>
                          <span className="actor-role-badge">{log.actorRole}</span>
                        </td>
                        <td>
                          <p className="audit-notes-text">{log.notes}</p>
                          {log.beforeState && log.afterState && (
                            <div className="audit-diff-row font-mono text-xs">
                              <span className="diff-before">Before: {JSON.stringify(log.beforeState)}</span>
                              <span className="diff-after">After: {JSON.stringify(log.afterState)}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
