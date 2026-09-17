import React, { useState, useEffect, useMemo } from 'react';
import {
  Utensils,
  Clock,
  CreditCard,
  Layers,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Printer,
  ChevronRight,
  ShoppingBag,
  Users,
  Coffee,
  X,
  FileText,
  DollarSign,
  QrCode,
  Smartphone,
  CreditCard as CardIcon,
  HelpCircle,
  CalendarCheck,
  Calendar,
} from 'lucide-react';
import { posApi } from '../../services/posApi';

export const POSDashboard = () => {
  // State
  const [tables, setTables] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter & Selection
  const [tableFilter, setTableFilter] = useState('all'); // 'all', 'vacant', 'occupied', 'reserved'
  const [selectedTable, setSelectedTable] = useState(null); // Table object or { isTakeaway: true }
  const [activeOrder, setActiveOrder] = useState(null); // Loaded or newly creating order

  // Terminal state
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReservationsModal, setShowReservationsModal] = useState(false);
  const [selectedTableForAssign, setSelectedTableForAssign] = useState({});
  const [reservationActionLoading, setReservationActionLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'cash', 'upi', 'card', 'split'
  const [cashTendered, setCashTendered] = useState('');
  const [splitCash, setSplitCash] = useState('');
  const [splitUpi, setSplitUpi] = useState('');
  const [splitCard, setSplitCard] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [receiptData, setReceiptData] = useState(null);
  const [notification, setNotification] = useState(null);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Initial Data Fetch
  const loadData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const [tablesRes, menuRes, reservationsRes] = await Promise.all([
        posApi.getTables(),
        posApi.getMenu(),
        posApi.getReservations(),
      ]);

      if (tablesRes.success) setTables(tablesRes.data || []);
      if (menuRes.success) setMenuCategories(menuRes.data || []);
      if (reservationsRes.success) setReservations(reservationsRes.data || []);
    } catch (err) {
      console.error('[POS Load Error]', err);
      setError('Unable to reach POS server. Retrying with fallback state...');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Tables
  const filteredTables = useMemo(() => {
    if (tableFilter === 'vacant') return tables.filter((t) => t.status === 'vacant');
    if (tableFilter === 'occupied') return tables.filter((t) => t.status === 'occupied');
    if (tableFilter === 'reserved') return tables.filter((t) => t.status === 'reserved');
    return tables;
  }, [tables, tableFilter]);

  // Overall Stats
  const stats = useMemo(() => {
    const total = tables.length;
    const occupied = tables.filter((t) => t.status === 'occupied').length;
    const reserved = tables.filter((t) => t.status === 'reserved').length;
    const vacant = total - occupied - reserved;
    const occupancyRate = total > 0 ? Math.round(((occupied + reserved) / total) * 100) : 0;
    const activeRevenue = tables.reduce((acc, t) => {
      if (t.currentOrderId && t.currentOrderId.grandTotal) {
        return acc + t.currentOrderId.grandTotal;
      }
      return acc;
    }, 0);
    const pendingReservations = reservations.filter((r) => r.status === 'Pending').length;

    return { total, occupied, reserved, vacant, occupancyRate, activeRevenue, pendingReservations };
  }, [tables, reservations]);

  // Menu items flattened & filtered
  const allMenuItems = useMemo(() => {
    return menuCategories.flatMap((cat) =>
      (cat.items || []).map((item) => ({ ...item, categoryName: cat.name, categorySlug: cat.slug }))
    );
  }, [menuCategories]);

  const displayMenuItems = useMemo(() => {
    return allMenuItems.filter((item) => {
      const matchCat =
        activeCategory === 'all' || item.categorySlug === activeCategory;
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [allMenuItems, activeCategory, searchQuery]);

  // Select a table to open POS terminal
  const handleSelectTable = async (table) => {
    setSelectedTable(table);
    setSearchQuery('');
    setActiveCategory('all');
    setDiscountAmount(0);

    if (table.status === 'occupied' && table.currentOrderId) {
      // Table has existing order: load details
      try {
        const orderId = table.currentOrderId._id || table.currentOrderId;
        const res = await posApi.getOrder(orderId);
        if (res.success) {
          setActiveOrder(res.data);
          setCustomerName(res.data.customerName || '');
          setCustomerPhone(res.data.customerPhone || '');
          setDiscountAmount(res.data.discountAmount || 0);
          setCartItems(
            res.data.items.map((i) => ({
              menuItemId: i.menuItemId,
              name: i.name,
              price: i.unitPrice,
              quantity: i.quantity,
              notes: i.notes || '',
              totalPrice: i.totalPrice,
              status: i.status,
              isExisting: true,
            }))
          );
          return;
        }
      } catch (err) {
        console.error('Error fetching table order:', err);
      }
    }

    if (table.status === 'reserved' && table.currentReservationId) {
      const resv = table.currentReservationId;
      setCustomerName(resv.name || '');
      setCustomerPhone(resv.phone || '');
      setActiveOrder(null);
      setCartItems([]);
      showToast(`Loaded booking for ${resv.name} (${resv.guestCount} guests)`);
      return;
    }

    // Vacant table: fresh order
    setActiveOrder(null);
    setCartItems([]);
    setCustomerName('');
    setCustomerPhone('');
  };

  // Reservation Actions
  const handleAssignTable = async (reservationId) => {
    const tableId = selectedTableForAssign[reservationId];
    if (!tableId) {
      showToast('Please select a table to assign', 'error');
      return;
    }
    try {
      setReservationActionLoading(true);
      const res = await posApi.assignReservation(reservationId, tableId);
      if (res.success) {
        showToast(res.message || 'Table assigned and reserved successfully!');
        await loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to assign table', 'error');
    } finally {
      setReservationActionLoading(false);
    }
  };

  const handleSeatReservation = async (reservation) => {
    try {
      setReservationActionLoading(true);
      const res = await posApi.seatReservation(reservation._id);
      if (res.success) {
        showToast(`Seated ${reservation.name}!`);
        setShowReservationsModal(false);
        await loadData();
        const targetTable = tables.find(
          (t) => String(t._id) === String(reservation.tableId?._id || reservation.tableId)
        );
        if (targetTable) {
          setSelectedTable(targetTable);
          setCustomerName(reservation.name || '');
          setCustomerPhone(reservation.phone || '');
          setActiveOrder(null);
          setCartItems([]);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to seat guests', 'error');
    } finally {
      setReservationActionLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      setReservationActionLoading(true);
      const res = await posApi.cancelReservation(reservationId);
      if (res.success) {
        showToast('Reservation cancelled');
        await loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel reservation', 'error');
    } finally {
      setReservationActionLoading(false);
    }
  };

  // Launch Takeaway Order
  const handleLaunchTakeaway = () => {
    setSelectedTable({ isTakeaway: true, tableNumber: 'Takeaway' });
    setActiveOrder(null);
    setCartItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscountAmount(0);
  };

  // Cart operations
  const handleAddToCart = (item) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => String(i.menuItemId) === String(item._id));
      if (existing) {
        return prev.map((i) =>
          String(i.menuItemId) === String(item._id)
            ? {
                ...i,
                quantity: i.quantity + 1,
                totalPrice: Math.round((i.quantity + 1) * i.price * 100) / 100,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          quantity: 1,
          notes: '',
          totalPrice: item.price,
          isExisting: false,
        },
      ];
    });
  };

  const handleUpdateQuantity = (menuItemId, delta) => {
    setCartItems((prev) => {
      return prev
        .map((i) => {
          if (String(i.menuItemId) === String(menuItemId)) {
            const newQty = i.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...i,
              quantity: newQty,
              totalPrice: Math.round(newQty * i.price * 100) / 100,
            };
          }
          return i;
        })
        .filter(Boolean);
    });
  };

  const handleUpdateNotes = (menuItemId, notes) => {
    setCartItems((prev) =>
      prev.map((i) =>
        String(i.menuItemId) === String(menuItemId) ? { ...i, notes } : i
      )
    );
  };

  const handleRemoveItem = (menuItemId) => {
    setCartItems((prev) => prev.filter((i) => String(i.menuItemId) !== String(menuItemId)));
  };

  // Financial calculations
  const cartSubTotal = useMemo(() => {
    const sum = cartItems.reduce((acc, i) => acc + (i.totalPrice || 0), 0);
    return Math.round(sum * 100) / 100;
  }, [cartItems]);

  const cartTaxTotal = useMemo(() => {
    const taxable = Math.max(0, cartSubTotal - (Number(discountAmount) || 0));
    return Math.round(taxable * 0.05 * 100) / 100;
  }, [cartSubTotal, discountAmount]);

  const cartGrandTotal = useMemo(() => {
    const taxable = Math.max(0, cartSubTotal - (Number(discountAmount) || 0));
    return Math.round((taxable + cartTaxTotal) * 100) / 100;
  }, [cartSubTotal, discountAmount, cartTaxTotal]);

  // Actions: Save / Create Order
  const handleSaveOrder = async () => {
    if (cartItems.length === 0) {
      showToast('Please add at least one menu item to the order', 'error');
      return;
    }

    try {
      if (activeOrder) {
        // Order exists: append new items
        const newItems = cartItems
          .filter((i) => !i.isExisting)
          .map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            notes: i.notes || '',
          }));

        if (newItems.length > 0) {
          const res = await posApi.addItems(activeOrder._id, newItems);
          if (res.success) {
            setActiveOrder(res.data);
            showToast('New items added to running bill');
          }
        } else {
          showToast('No new items to add');
        }
      } else {
        // Create new order
        const payload = {
          tableId: selectedTable?.isTakeaway ? null : selectedTable?._id,
          orderType: selectedTable?.isTakeaway ? 'takeaway' : 'dine-in',
          items: cartItems.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            notes: i.notes || '',
          })),
          customerName,
          customerPhone,
        };

        const res = await posApi.createOrder(payload);
        if (res.success) {
          setActiveOrder(res.data);
          showToast(`Order ${res.data.orderNumber} created successfully!`);
          await loadData();
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to save order', 'error');
    }
  };

  // Action: Send to Kitchen (KOT)
  const handleSendKot = async () => {
    if (!activeOrder && cartItems.length > 0) {
      // Create first then send KOT
      try {
        const payload = {
          tableId: selectedTable?.isTakeaway ? null : selectedTable?._id,
          orderType: selectedTable?.isTakeaway ? 'takeaway' : 'dine-in',
          items: cartItems.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            notes: i.notes || '',
          })),
          customerName,
          customerPhone,
        };
        const createRes = await posApi.createOrder(payload);
        if (createRes.success) {
          const kotRes = await posApi.sendKot(createRes.data._id);
          setActiveOrder(kotRes.data);
          showToast(`KOT generated for ${kotRes.data.orderNumber}! Items sent to kitchen.`);
          await loadData();
          return;
        }
      } catch (err) {
        showToast(err.message || 'Failed to send KOT', 'error');
        return;
      }
    }

    if (activeOrder) {
      try {
        const res = await posApi.sendKot(activeOrder._id);
        if (res.success) {
          setActiveOrder(res.data);
          showToast(`KOT sent to kitchen for ${activeOrder.orderNumber}!`);
          await loadData();
        }
      } catch (err) {
        showToast(err.message || 'Failed to send KOT', 'error');
      }
    }
  };

  // Action: Settle Bill
  const handleOpenSettleModal = () => {
    if (!activeOrder && cartItems.length === 0) {
      showToast('No active bill to settle', 'error');
      return;
    }
    setPaymentMethod('upi');
    setCashTendered(String(cartGrandTotal));
    setSplitCash(String(Math.round(cartGrandTotal / 2)));
    setSplitUpi(String(Math.round(cartGrandTotal / 2)));
    setSplitCard('0');
    setShowPaymentModal(true);
  };

  const handleConfirmSettlement = async () => {
    try {
      let orderIdToSettle = activeOrder?._id;

      // If order not yet created in DB, create it first
      if (!orderIdToSettle) {
        const createPayload = {
          tableId: selectedTable?.isTakeaway ? null : selectedTable?._id,
          orderType: selectedTable?.isTakeaway ? 'takeaway' : 'dine-in',
          items: cartItems.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            notes: i.notes || '',
          })),
          customerName,
          customerPhone,
        };
        const createRes = await posApi.createOrder(createPayload);
        if (!createRes.success) throw new Error('Could not initialize bill');
        orderIdToSettle = createRes.data._id;
      }

      const payload = {
        paymentMethod,
        discountAmount: Number(discountAmount) || 0,
        customerName,
        customerPhone,
      };

      if (paymentMethod === 'split') {
        payload.splitDetails = {
          cash: Number(splitCash) || 0,
          upi: Number(splitUpi) || 0,
          card: Number(splitCard) || 0,
        };
      }

      const res = await posApi.settleOrder(orderIdToSettle, payload);
      if (res.success) {
        setShowPaymentModal(false);
        setReceiptData(res.receipt);
        showToast(`Bill settled successfully via ${paymentMethod.toUpperCase()}!`);
        await loadData();
        // Reset terminal view
        setSelectedTable(null);
        setActiveOrder(null);
        setCartItems([]);
      }
    } catch (err) {
      showToast(err.message || 'Failed to settle bill', 'error');
    }
  };

  // Action: Cancel Order
  const handleConfirmCancel = async () => {
    if (!activeOrder) {
      // Just clear local state
      setSelectedTable(null);
      setCartItems([]);
      setShowCancelModal(false);
      showToast('Order draft cleared');
      return;
    }

    if (!cancelReason.trim()) {
      showToast('Please provide a reason for cancelling this order', 'error');
      return;
    }

    try {
      const res = await posApi.cancelOrder(activeOrder._id, cancelReason);
      if (res.success) {
        setShowCancelModal(false);
        setCancelReason('');
        setSelectedTable(null);
        setActiveOrder(null);
        setCartItems([]);
        showToast('Order cancelled and audit log recorded');
        await loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel order', 'error');
    }
  };

  return (
    <div className="pos-container">
      {/* Toast Notification */}
      {notification && (
        <div className={`pos-toast pos-toast-${notification.type}`}>
          {notification.type === 'success' ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Main Floor View (When no table or order is open) */}
      {!selectedTable ? (
        <div>
          {/* Top Stat Row */}
          <div className="dashboard-grid">
            <div className="stat-card">
              <span className="stat-label">Active Tables</span>
              <span className="stat-value">
                {stats.occupied} / {stats.total}
              </span>
              <span className="stat-badge">{stats.occupancyRate}% Floor Active</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Vacant Ready</span>
              <span className="stat-value">{stats.vacant}</span>
              <span className="stat-badge" style={{ color: 'var(--success)' }}>
                Ready to Seat
              </span>
            </div>
            <div
              className="stat-card"
              style={{
                cursor: 'pointer',
                border: stats.pendingReservations > 0 ? '1px solid #d97706' : '1px solid var(--border-color)',
                background: stats.pendingReservations > 0 ? 'linear-gradient(180deg, rgba(217, 119, 6, 0.1), var(--bg-card))' : 'var(--bg-card)',
              }}
              onClick={() => setShowReservationsModal(true)}
              title="Click to view online table bookings"
            >
              <span className="stat-label">Online Bookings</span>
              <span className="stat-value" style={{ color: stats.pendingReservations > 0 ? '#fbbf24' : 'inherit' }}>
                {reservations.length} Bookings
              </span>
              <span
                className="stat-badge"
                style={{
                  color: stats.pendingReservations > 0 ? '#fbbf24' : 'var(--text-secondary)',
                  fontWeight: stats.pendingReservations > 0 ? 700 : 'normal',
                }}
              >
                {stats.pendingReservations > 0 ? `⚡ ${stats.pendingReservations} New to Assign` : 'All Managed'}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Active Floor Revenue</span>
              <span className="stat-value">₹{stats.activeRevenue.toLocaleString('en-IN')}</span>
              <span className="stat-badge">5% GST Applicable</span>
            </div>
          </div>

          {/* Floor Controls */}
          <div className="pos-floor-header">
            <div className="pos-filter-group">
              <button
                className={`filter-btn ${tableFilter === 'all' ? 'active' : ''}`}
                onClick={() => setTableFilter('all')}
              >
                All Tables ({tables.length})
              </button>
              <button
                className={`filter-btn ${tableFilter === 'vacant' ? 'active' : ''}`}
                onClick={() => setTableFilter('vacant')}
              >
                Vacant ({stats.vacant})
              </button>
              <button
                className={`filter-btn ${tableFilter === 'occupied' ? 'active' : ''}`}
                onClick={() => setTableFilter('occupied')}
              >
                Occupied ({stats.occupied})
              </button>
              <button
                className={`filter-btn ${tableFilter === 'reserved' ? 'active' : ''}`}
                onClick={() => setTableFilter('reserved')}
              >
                Reserved ({stats.reserved})
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn-primary"
                style={{
                  background: stats.pendingReservations > 0 ? 'linear-gradient(135deg, #d97706, #b45309)' : 'var(--bg-surface)',
                  color: '#fff',
                  border: '1px solid var(--border-color)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onClick={() => setShowReservationsModal(true)}
              >
                <CalendarCheck size={16} />
                <span>Online Bookings</span>
                {reservations.length > 0 && (
                  <span
                    style={{
                      background: stats.pendingReservations > 0 ? '#ef4444' : 'rgba(255,255,255,0.2)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                    }}
                  >
                    {stats.pendingReservations > 0 ? `${stats.pendingReservations} New` : reservations.length}
                  </span>
                )}
              </button>
              <button
                className="btn-secondary"
                onClick={loadData}
                disabled={refreshing}
                title="Refresh Table States"
              >
                <RotateCcw size={16} className={refreshing ? 'spin' : ''} />
                <span>Refresh</span>
              </button>
              <button className="btn-primary" onClick={handleLaunchTakeaway}>
                <ShoppingBag size={16} />
                <span>Quick Takeaway Order</span>
              </button>
            </div>
          </div>

          {/* Table Grid */}
          <div className="pos-table-grid">
            {filteredTables.map((table) => {
              const isOccupied = table.status === 'occupied';
              const isReserved = table.status === 'reserved';
              const order = table.currentOrderId;
              const reservation = table.currentReservationId;

              return (
                <div
                  key={table._id}
                  className={`table-card ${
                    isOccupied ? 'table-card-occupied' : isReserved ? 'table-card-reserved' : 'table-card-vacant'
                  }`}
                  onClick={() => handleSelectTable(table)}
                >
                  <div className="table-card-header">
                    <div className="table-number-box">
                      <Utensils size={16} />
                      <span className="table-num">{table.tableNumber}</span>
                    </div>
                    <span
                      className={`status-pill ${
                        isOccupied ? 'pill-occupied' : isReserved ? 'pill-reserved' : 'pill-vacant'
                      }`}
                    >
                      {isOccupied ? 'Occupied' : isReserved ? 'Reserved' : 'Vacant'}
                    </span>
                  </div>

                  <div className="table-capacity">
                    <Users size={14} />
                    <span>{table.capacity} Seater</span>
                  </div>

                  {isOccupied && order ? (
                    <div className="table-order-preview">
                      <div className="order-chip">{order.orderNumber}</div>
                      <div className="order-running-total">
                        ₹{(order.grandTotal || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="order-meta">
                        {order.items?.length || 0} items • Running
                      </div>
                    </div>
                  ) : isReserved ? (
                    <div className="table-order-preview">
                      <div className="order-chip" style={{ color: '#c084fc' }}>
                        {reservation?.name || 'Customer Booking'}
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                        {reservation?.guestCount || 2} Guests • {reservation?.time || 'Reserved'}
                      </div>
                      <div className="order-meta" style={{ color: 'var(--text-muted)' }}>
                        📞 {reservation?.phone || ''}
                      </div>
                      <div className="table-vacant-hint" style={{ color: '#c084fc', paddingTop: '6px' }}>
                        <span>Click to Seat & Order</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  ) : (
                    <div className="table-vacant-hint">
                      <span>Click to Seat & Order</span>
                      <ChevronRight size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* POS Split Order Taking Terminal */
        <div className="pos-terminal-layout">
          {/* Left Column: Menu Catalog Browser */}
          <div className="pos-menu-section">
            <div className="pos-terminal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  className="btn-secondary"
                  onClick={() => setSelectedTable(null)}
                  style={{ padding: '8px 12px' }}
                >
                  ← Floor View
                </button>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    {selectedTable.isTakeaway
                      ? '🛍️ Takeaway / Delivery Order'
                      : `🪑 Table ${selectedTable.tableNumber} (${selectedTable.capacity} Seater)`}
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {activeOrder
                      ? `Order: ${activeOrder.orderNumber} • Status: ${activeOrder.status}`
                      : 'New Order Entry'}
                  </span>
                </div>
              </div>

              {/* Search input */}
              <div className="pos-search-bar">
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search coffee, toasts, pastries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Navigation Pills */}
            <div className="pos-category-tabs">
              <button
                className={`cat-tab ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                All Items ({allMenuItems.length})
              </button>
              {menuCategories.map((cat) => (
                <button
                  key={cat._id}
                  className={`cat-tab ${activeCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.slug)}
                >
                  {cat.name} ({(cat.items || []).length})
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="pos-items-grid">
              {displayMenuItems.map((item) => (
                <div
                  key={item._id}
                  className="menu-item-tile"
                  onClick={() => handleAddToCart(item)}
                >
                  <div className="item-tile-top">
                    <span className="item-veg-badge">🌱</span>
                    <span className="item-price">₹{item.price}</span>
                  </div>
                  <h4 className="item-tile-title">{item.name}</h4>
                  <p className="item-tile-desc">{item.description}</p>
                  <button className="item-add-btn">
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>
              ))}
            </div>
            {/* Mobile Floating Cart Action Bar */}
            {cartItems.length > 0 && (
              <div className="pos-mobile-cart-bar">
                <div className="cart-bar-info">
                  <span className="cart-bar-count">{cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items Added</span>
                  <span className="cart-bar-total">₹{cartGrandTotal.toLocaleString('en-IN')}</span>
                </div>
                <button
                  type="button"
                  className="cart-bar-action-btn"
                  onClick={() => setIsMobileCartOpen(true)}
                >
                  <ShoppingBag size={18} />
                  <span>Review Bill ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Live Order Ticket & Billing Console */}
          <div className={`pos-cart-section ${isMobileCartOpen ? 'mobile-cart-open' : ''}`}>
            <div className="cart-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Current Bill</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="item-count-badge">
                  {cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items
                </span>
                <button
                  type="button"
                  className="cart-close-mobile-btn"
                  onClick={() => setIsMobileCartOpen(false)}
                  title="Minimize cart"
                  aria-label="Close cart sheet"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Customer Details */}
            <div className="cart-customer-box">
              <input
                type="text"
                placeholder="Customer Name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="cart-input"
              />
              <input
                type="text"
                placeholder="Phone (optional)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="cart-input"
              />
            </div>

            {/* Cart Line Items */}
            <div className="cart-items-list">
              {cartItems.length === 0 ? (
                <div className="cart-empty-state">
                  <Coffee size={36} color="var(--border-color)" />
                  <p>Order ticket is empty</p>
                  <span>Select items from menu catalog to add</span>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.menuItemId} className="cart-line-item">
                    <div className="line-item-top">
                      <span className="line-name">{item.name}</span>
                      <span className="line-total">₹{item.totalPrice}</span>
                    </div>

                    <div className="line-item-controls">
                      <div className="qty-stepper">
                        <button
                          onClick={() => handleUpdateQuantity(item.menuItemId, -1)}
                          className="qty-btn"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.menuItemId, 1)}
                          className="qty-btn"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Add preparation note..."
                        value={item.notes}
                        onChange={(e) => handleUpdateNotes(item.menuItemId, e.target.value)}
                        className="line-note-input"
                      />

                      <button
                        onClick={() => handleRemoveItem(item.menuItemId)}
                        className="line-remove-btn"
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Billing Breakdown */}
            <div className="cart-financials">
              <div className="calc-row">
                <span>Subtotal</span>
                <span>₹{cartSubTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="calc-row">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Discount</span>
                  <input
                    type="number"
                    min="0"
                    max={cartSubTotal}
                    value={discountAmount || ''}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="₹0"
                    className="discount-input"
                  />
                </span>
                <span style={{ color: 'var(--success)' }}>
                  -₹{Number(discountAmount) || 0}
                </span>
              </div>

              <div className="calc-row tax-breakdown">
                <span>GST (5% — CGST 2.5% + SGST 2.5%)</span>
                <span>₹{cartTaxTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="calc-divider" />

              <div className="grand-total-row">
                <span>Grand Total</span>
                <span className="grand-total-val">
                  ₹{cartGrandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="cart-action-bar">
              <button
                className="btn-secondary"
                onClick={handleSendKot}
                disabled={cartItems.length === 0}
                title="Send items to Kitchen Display System"
              >
                <Utensils size={16} />
                <span>Send KOT</span>
              </button>

              <button
                className="btn-primary btn-settle"
                onClick={handleOpenSettleModal}
                disabled={cartItems.length === 0}
              >
                <CreditCard size={18} />
                <span>Settle & Bill</span>
              </button>

              {activeOrder && (
                <button
                  className="btn-danger"
                  onClick={() => setShowCancelModal(true)}
                  title="Cancel this order (requires audit log)"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment & Settlement Modal */}
      {showPaymentModal && (
        <div className="pos-modal-overlay">
          <div className="pos-modal-card">
            <div className="modal-header">
              <h3>Settle & Complete Bill</h3>
              <button className="modal-close-btn" onClick={() => setShowPaymentModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="settle-amount-banner">
              <span className="banner-sub">Payable Amount</span>
              <span className="banner-total">₹{cartGrandTotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="form-group">
              <label>Select Payment Mode</label>
              <div className="payment-modes-grid">
                <button
                  type="button"
                  className={`pay-mode-card ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <QrCode size={24} />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  className={`pay-mode-card ${paymentMethod === 'cash' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <DollarSign size={24} />
                  <span>Cash</span>
                </button>
                <button
                  type="button"
                  className={`pay-mode-card ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CardIcon size={24} />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  className={`pay-mode-card ${paymentMethod === 'split' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('split')}
                >
                  <Layers size={24} />
                  <span>Split</span>
                </button>
              </div>
            </div>

            {/* Specific Payment Mode UI */}
            {paymentMethod === 'cash' && (
              <div className="payment-extra-box">
                <label>Cash Tendered by Guest (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  placeholder="e.g. 500"
                />
                {Number(cashTendered) >= cartGrandTotal && (
                  <div className="change-return-badge">
                    Change to return: ₹
                    {(Number(cashTendered) - cartGrandTotal).toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div className="payment-extra-box upi-box">
                <QrCode size={48} color="var(--primary)" />
                <div>
                  <h4>Scan Raahi UPI Dynamic QR</h4>
                  <p>UPI ID: raahicafe@icici • Verified Merchant</p>
                </div>
              </div>
            )}

            {paymentMethod === 'split' && (
              <div className="payment-extra-box">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div>
                    <label>Cash (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={splitCash}
                      onChange={(e) => setSplitCash(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>UPI (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={splitUpi}
                      onChange={(e) => setSplitUpi(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Card (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={splitCard}
                      onChange={(e) => setSplitCard(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowPaymentModal(false)}
              >
                Back
              </button>
              <button
                className="btn-primary btn-settle-confirm"
                onClick={handleConfirmSettlement}
              >
                <CheckCircle2 size={18} />
                <span>Confirm Payment & Close Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Dialog */}
      {showCancelModal && (
        <div className="pos-modal-overlay">
          <div className="pos-modal-card">
            <div className="modal-header">
              <h3 style={{ color: 'var(--danger)' }}>Cancel Order & Free Table</h3>
              <button className="modal-close-btn" onClick={() => setShowCancelModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              This action will release the table and record an immutable audit log entry with your staff credentials.
            </p>

            <div className="form-group">
              <label>Cancellation Reason (Mandatory per AGENTS.md)</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="e.g. Guest had to leave unexpectedly / duplicate punch"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                required
              />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowCancelModal(false)}>
                Back
              </button>
              <button className="btn-danger" onClick={handleConfirmCancel}>
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thermal Receipt Preview Modal */}
      {receiptData && (
        <div className="pos-modal-overlay">
          <div className="pos-modal-card receipt-modal">
            <div className="modal-header">
              <h3>Print Customer Receipt</h3>
              <button className="modal-close-btn" onClick={() => setReceiptData(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Printable Slip */}
            <div className="thermal-slip">
              <div className="thermal-header">
                <h2>{receiptData.cafeName || 'RAAHI CAFÉ'}</h2>
                <p>{receiptData.address || 'Indiranagar, Bengaluru'}</p>
                <p>GSTIN: {receiptData.gstin} • FSSAI: {receiptData.fssai}</p>
                <p className="thermal-tag">TAX INVOICE</p>
              </div>

              <div className="thermal-divider" />

              <div className="thermal-meta">
                <div>Inv: {receiptData.orderNumber}</div>
                <div>Date: {new Date(receiptData.date).toLocaleString('en-IN')}</div>
                <div>Mode: {receiptData.paymentMethod?.toUpperCase()}</div>
              </div>

              <div className="thermal-divider" />

              <table className="thermal-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Item</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {(receiptData.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: 'left' }}>{item.name}</td>
                      <td style={{ textAlign: 'center' }}>{item.qty}</td>
                      <td style={{ textAlign: 'right' }}>₹{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="thermal-divider" />

              <div className="thermal-totals">
                <div className="tot-row">
                  <span>Subtotal</span>
                  <span>₹{receiptData.subTotal}</span>
                </div>
                {receiptData.discount > 0 && (
                  <div className="tot-row">
                    <span>Discount</span>
                    <span>-₹{receiptData.discount}</span>
                  </div>
                )}
                <div className="tot-row">
                  <span>CGST (2.5%)</span>
                  <span>₹{receiptData.cgst}</span>
                </div>
                <div className="tot-row">
                  <span>SGST (2.5%)</span>
                  <span>₹{receiptData.sgst}</span>
                </div>
                <div className="tot-divider" />
                <div className="tot-grand">
                  <span>GRAND TOTAL</span>
                  <span>₹{receiptData.grandTotal}</span>
                </div>
              </div>

              <div className="thermal-footer">
                <p>Thank you for dining at Raahi Café!</p>
                <p>Have an artisanal day ☕</p>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setReceiptData(null)}>
                Close
              </button>
              <button className="btn-primary" onClick={() => window.print()}>
                <Printer size={16} />
                <span>Print Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Online Table Reservations Manager Modal */}
      {showReservationsModal && (
        <div className="pos-modal-overlay">
          <div className="pos-modal-card" style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CalendarCheck size={22} style={{ color: 'var(--accent)' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Online Table Bookings</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Incoming customer reservations submitted via customer website
                  </span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowReservationsModal(false)}>
                <X size={18} />
              </button>
            </div>

            {reservations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <Calendar size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p>No table reservations found yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '65vh', overflowY: 'auto', paddingRight: '4px' }}>
                {reservations.map((resv) => {
                  const isPending = resv.status === 'Pending';
                  const isConfirmed = resv.status === 'Confirmed';
                  const isSeated = resv.status === 'Seated';
                  const isCancelled = resv.status === 'Cancelled';
                  const assignedTable = tables.find(
                    (t) => String(t._id) === String(resv.tableId?._id || resv.tableId)
                  );

                  return (
                    <div
                      key={resv._id}
                      style={{
                        background: 'var(--bg-card)',
                        border: isPending ? '1px solid #d97706' : isConfirmed ? '1px solid #c084fc' : '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{resv.name}</h4>
                            <span
                              style={{
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                padding: '3px 10px',
                                borderRadius: '12px',
                                textTransform: 'uppercase',
                                background:
                                  isPending
                                    ? 'rgba(217, 119, 6, 0.2)'
                                    : isConfirmed
                                    ? 'rgba(168, 85, 247, 0.2)'
                                    : isSeated
                                    ? 'rgba(16, 185, 129, 0.2)'
                                    : 'rgba(239, 68, 68, 0.2)',
                                color:
                                  isPending
                                    ? '#fbbf24'
                                    : isConfirmed
                                    ? '#c084fc'
                                    : isSeated
                                    ? '#34d399'
                                    : '#f87171',
                              }}
                            >
                              {resv.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                            <span>📞 <a href={`tel:${resv.phone}`} style={{ color: 'var(--accent)' }}>{resv.phone}</a></span>
                            {resv.email && <span>✉️ {resv.email}</span>}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', fontSize: '0.86rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            📅 {resv.date} at ⏰ {resv.time}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                            👥 {resv.guestCount} Guest{resv.guestCount > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      {resv.specialRequests && (
                        <div style={{ fontSize: '0.82rem', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '6px', color: 'var(--text-muted)' }}>
                          <strong>Special Request:</strong> {resv.specialRequests}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Assigned Table: </span>
                          <strong style={{ color: assignedTable ? '#c084fc' : '#f59e0b' }}>
                            {assignedTable ? `Table ${assignedTable.tableNumber} (${assignedTable.capacity} seats)` : 'None (Action Required)'}
                          </strong>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {isPending && (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <select
                                className="form-select"
                                style={{ padding: '6px 10px', fontSize: '0.84rem', minWidth: '140px' }}
                                value={selectedTableForAssign[resv._id] || ''}
                                onChange={(e) =>
                                  setSelectedTableForAssign({
                                    ...selectedTableForAssign,
                                    [resv._id]: e.target.value,
                                  })
                                }
                              >
                                <option value="">Select Table...</option>
                                {tables
                                  .filter((t) => t.status === 'vacant')
                                  .map((t) => (
                                    <option key={t._id} value={t._id}>
                                      Table {t.tableNumber} ({t.capacity} seats)
                                    </option>
                                  ))}
                              </select>
                              <button
                                className="btn-primary"
                                style={{ padding: '6px 12px', fontSize: '0.84rem' }}
                                disabled={reservationActionLoading}
                                onClick={() => handleAssignTable(resv._id)}
                              >
                                Confirm & Reserve Table
                              </button>
                            </div>
                          )}

                          {isConfirmed && (
                            <button
                              className="btn-primary"
                              style={{ padding: '6px 14px', fontSize: '0.84rem', background: 'var(--success)' }}
                              disabled={reservationActionLoading}
                              onClick={() => handleSeatReservation(resv)}
                            >
                              Seat Guests Now
                            </button>
                          )}

                          {!isCancelled && !isSeated && (
                            <button
                              className="btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '0.82rem', color: 'var(--danger)' }}
                              disabled={reservationActionLoading}
                              onClick={() => handleCancelReservation(resv._id)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: '16px' }}>
              <button className="btn-secondary" onClick={() => setShowReservationsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
