import React, { useState, useEffect, useMemo } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Coffee,
  Flame,
  Volume2,
  VolumeX,
  Play,
  Bell,
  Check,
  Utensils,
  ShoppingBag,
  Layers,
  Filter,
} from 'lucide-react';
import { kotApi } from '../../services/kotApi';

export const KOTDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [summary, setSummary] = useState({
    activeTickets: 0,
    preparingItems: 0,
    readyItems: 0,
    delayedTickets: 0,
    avgPrepTime: 8,
  });
  const [stationFilter, setStationFilter] = useState('all'); // 'all', 'beverage', 'kitchen'
  const [statusFilter, setStatusFilter] = useState('active'); // 'active', 'preparing', 'ready', 'completed'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notification, setNotification] = useState(null);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Play audio alert beep on critical status change
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // AudioContext policy
    }
  };

  const loadKdsData = async () => {
    try {
      setRefreshing(true);
      const isHistory = statusFilter === 'completed';
      const [ticketsRes, summaryRes] = await Promise.all([
        kotApi.getTickets({
          station: stationFilter,
          status: statusFilter === 'active' ? 'all' : statusFilter,
          history: isHistory ? 'true' : 'false',
        }),
        kotApi.getSummary(),
      ]);

      if (ticketsRes.success) setTickets(ticketsRes.data || []);
      if (summaryRes.success) setSummary(summaryRes.data || {});
    } catch (err) {
      console.error('[KDS Load Error]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadKdsData();
  }, [stationFilter, statusFilter]);

  // Auto-refresh interval (every 8 seconds for real-time kitchen board)
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      loadKdsData();
    }, 8000);
    return () => clearInterval(timer);
  }, [autoRefresh, stationFilter, statusFilter]);

  // Actions: Advance whole ticket
  const handleAdvanceTicket = async (ticketId, nextStatus) => {
    try {
      const res = await kotApi.updateTicketStatus(ticketId, nextStatus);
      if (res.success) {
        playAlertSound();
        showToast(`Ticket status updated to ${nextStatus.toUpperCase()}`);
        await loadKdsData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update ticket', 'error');
    }
  };

  // Actions: Toggle individual item status
  const handleToggleItem = async (ticketId, itemId, currentStatus) => {
    const nextItemStatus =
      currentStatus === 'ready'
        ? 'served'
        : currentStatus === 'preparing'
        ? 'ready'
        : 'preparing';

    try {
      const res = await kotApi.updateItemStatus(ticketId, itemId, nextItemStatus);
      if (res.success) {
        showToast(`Item marked as ${nextItemStatus.toUpperCase()}`);
        await loadKdsData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update item', 'error');
    }
  };

  return (
    <div className="kds-container">
      {/* Toast Notification */}
      {notification && (
        <div className={`pos-toast pos-toast-${notification.type}`}>
          <CheckCircle2 size={18} />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Top Metric Strip */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <span className="stat-label">Tickets in Kitchen</span>
          <span className="stat-value">{summary.activeTickets}</span>
          <span className="stat-badge">Live Queue</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Items Preparing</span>
          <span className="stat-value">{summary.preparingItems}</span>
          <span className="stat-badge">On Stove / Oven</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Ready for Pickup</span>
          <span className="stat-value" style={{ color: 'var(--success)' }}>
            {summary.readyItems}
          </span>
          <span className="stat-badge" style={{ color: 'var(--success)' }}>
            Waitstaff Alerted
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Delayed Orders (&gt;15m)</span>
          <span
            className="stat-value"
            style={{ color: summary.delayedTickets > 0 ? 'var(--danger)' : 'var(--text-muted)' }}
          >
            {summary.delayedTickets}
          </span>
          <span
            className="stat-badge"
            style={{ color: summary.delayedTickets > 0 ? 'var(--danger)' : 'inherit' }}
          >
            {summary.delayedTickets > 0 ? 'Immediate Attention' : 'On Track'}
          </span>
        </div>
      </div>

      {/* KDS Station & Filter Controls */}
      <div className="kds-controls-bar">
        {/* Station Selectors */}
        <div className="kds-station-tabs">
          <button
            className={`station-tab ${stationFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStationFilter('all')}
          >
            <Layers size={16} />
            <span>All Stations</span>
          </button>
          <button
            className={`station-tab ${stationFilter === 'beverage' ? 'active' : ''}`}
            onClick={() => setStationFilter('beverage')}
          >
            <Coffee size={16} />
            <span>☕ Beverage Bar (Barista)</span>
          </button>
          <button
            className={`station-tab ${stationFilter === 'kitchen' ? 'active' : ''}`}
            onClick={() => setStationFilter('kitchen')}
          >
            <Flame size={16} />
            <span>🍳 Kitchen & Bakery (Chef)</span>
          </button>
        </div>

        {/* Status Queue Tabs & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div className="pos-filter-group">
            <button
              className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
              onClick={() => setStatusFilter('active')}
            >
              Active Queue
            </button>
            <button
              className={`filter-btn ${statusFilter === 'preparing' ? 'active' : ''}`}
              onClick={() => setStatusFilter('preparing')}
            >
              Preparing
            </button>
            <button
              className={`filter-btn ${statusFilter === 'ready' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ready')}
            >
              Ready
            </button>
            <button
              className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('completed')}
            >
              Completed Today
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn-secondary"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Alert Sound' : 'Enable Alert Sound'}
              style={{ padding: '8px 12px' }}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              className="btn-secondary"
              onClick={loadKdsData}
              disabled={refreshing}
              title="Refresh KDS Board"
              style={{ padding: '8px 14px' }}
            >
              <RotateCcw size={16} className={refreshing ? 'spin' : ''} />
              <span>Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* KDS Kitchen Ticket Grid */}
      {tickets.length === 0 ? (
        <div className="kds-empty-state">
          <ChefHat size={48} color="var(--border-color)" />
          <h3>All Caught Up!</h3>
          <p>There are no active orders waiting in this station queue right now.</p>
        </div>
      ) : (
        <div className="kds-tickets-grid">
          {tickets.map((ticket) => {
            const isDelayed = ticket.isDelayed;
            const elapsed = ticket.elapsedMinutes || 0;
            const isReady = ticket.kotStatus === 'ready';
            const isPreparing = ticket.kotStatus === 'preparing';
            const isCompleted = ticket.kotStatus === 'completed';

            return (
              <div
                key={ticket._id}
                className={`kds-ticket-card ${
                  isDelayed ? 'kds-card-delayed' : isReady ? 'kds-card-ready' : 'kds-card-normal'
                }`}
              >
                {/* Ticket Header */}
                <div className="kds-ticket-header">
                  <div className="kds-table-badge">
                    {ticket.orderType === 'takeaway' ? (
                      <>
                        <ShoppingBag size={18} />
                        <span>Takeaway</span>
                      </>
                    ) : (
                      <>
                        <Utensils size={18} />
                        <span>Table {ticket.tableNumber}</span>
                      </>
                    )}
                  </div>

                  <div className="kds-timer-badge">
                    <Clock size={14} />
                    <span>{elapsed}m</span>
                    {isDelayed && <span className="delayed-pill">URGENT</span>}
                  </div>
                </div>

                {/* Sub-header meta */}
                <div className="kds-ticket-meta">
                  <span className="kds-order-num">{ticket.orderNumber}</span>
                  <span className={`kds-status-tag tag-${ticket.kotStatus}`}>
                    {ticket.kotStatus.toUpperCase()}
                  </span>
                </div>

                {/* Item List */}
                <div className="kds-items-list">
                  {ticket.items.map((item) => {
                    const itemIsReady = item.status === 'ready' || item.status === 'served';
                    return (
                      <div
                        key={item._id}
                        className={`kds-item-row ${itemIsReady ? 'kds-item-done' : ''}`}
                        onClick={() => handleToggleItem(ticket._id, item._id, item.status)}
                      >
                        <div className="kds-item-qty-badge">{item.quantity}x</div>

                        <div className="kds-item-info">
                          <div className="kds-item-name-row">
                            <span className="kds-item-name">{item.name}</span>
                            <span className={`kds-station-pill pill-${item.station}`}>
                              {item.station === 'beverage' ? '☕ Barista' : '🍳 Kitchen'}
                            </span>
                          </div>

                          {item.notes && (
                            <div className="kds-item-note">
                              <AlertTriangle size={12} />
                              <span>{item.notes}</span>
                            </div>
                          )}
                        </div>

                        <button
                          className={`kds-item-check-btn ${itemIsReady ? 'checked' : ''}`}
                          title={itemIsReady ? 'Mark pending' : 'Mark ready'}
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons Toolbar */}
                <div className="kds-ticket-footer">
                  {ticket.kotStatus === 'sent' && (
                    <button
                      className="btn-primary kds-btn-action"
                      onClick={() => handleAdvanceTicket(ticket._id, 'preparing')}
                    >
                      <Play size={16} />
                      <span>Start Preparing</span>
                    </button>
                  )}

                  {ticket.kotStatus === 'preparing' && (
                    <button
                      className="btn-primary kds-btn-action btn-kds-ready"
                      onClick={() => handleAdvanceTicket(ticket._id, 'ready')}
                    >
                      <CheckCircle2 size={16} />
                      <span>Mark All Ready</span>
                    </button>
                  )}

                  {ticket.kotStatus === 'ready' && (
                    <button
                      className="btn-primary kds-btn-action btn-kds-serve"
                      onClick={() => handleAdvanceTicket(ticket._id, 'completed')}
                    >
                      <Bell size={16} />
                      <span>Mark Served & Complete</span>
                    </button>
                  )}

                  {isCompleted && (
                    <div className="kds-completed-badge">
                      <CheckCircle2 size={16} />
                      <span>Order Served to Table</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
