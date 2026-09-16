import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  Building2,
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Search,
  RotateCcw,
  FileText,
  Boxes,
  DollarSign,
  X,
  AlertTriangle,
  ArrowDownRight,
  ShieldCheck,
  Send,
  Phone,
  Mail,
  MapPin,
  FileCheck2,
} from 'lucide-react';
import { purchaseApi } from '../../services/purchaseApi';
import { inventoryApi } from '../../services/inventoryApi';

export const PurchaseDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [summary, setSummary] = useState({
    activeSuppliers: 0,
    pendingOrders: 0,
    receivedOrders: 0,
    totalInwardSpend: 0,
  });

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'suppliers', 'reorder'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modals
  const [showCreatePOModal, setShowCreatePOModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [receiveTargetPO, setReceiveTargetPO] = useState(null);
  const [cancelTargetPO, setCancelTargetPO] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [viewOrderDetails, setViewOrderDetails] = useState(null);

  // New PO State
  const [newPO, setNewPO] = useState({
    supplierId: '',
    notes: '',
    items: [{ inventoryItemId: '', quantity: 1, unitCost: 0 }],
  });

  // New Supplier State
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    gstin: '',
  });

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [summaryRes, ordersRes, suppliersRes, invRes] = await Promise.all([
        purchaseApi.getSummary(),
        purchaseApi.getOrders(),
        purchaseApi.getSuppliers(),
        inventoryApi.getItems(),
      ]);

      if (summaryRes.success) setSummary(summaryRes.data);
      if (ordersRes.success) setOrders(ordersRes.data || []);
      if (suppliersRes.success) setSuppliers(suppliersRes.data || []);
      if (invRes.success) setInventoryItems(invRes.data || []);
    } catch (err) {
      console.error('[Purchase Load Error]', err);
      showToast('Failed to load purchase data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const supplierName = typeof o.supplierId === 'object' ? o.supplierId?.name || '' : '';
      const matchSearch =
        o.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplierName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(q)) ||
        (s.gstin && s.gstin.toLowerCase().includes(q))
      );
    });
  }, [suppliers, searchQuery]);

  // Low stock items for quick reorder
  const lowStockItems = useMemo(() => {
    return inventoryItems.filter((i) => i.currentStock <= i.reorderLevel);
  }, [inventoryItems]);

  // Handle Dynamic PO Item addition
  const handleAddPOItem = (prefillInvId = '') => {
    const inv = inventoryItems.find((i) => i._id === prefillInvId);
    setNewPO((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          inventoryItemId: prefillInvId || '',
          quantity: 1,
          unitCost: inv ? inv.costPerUnit : 0,
        },
      ],
    }));
  };

  const handleUpdatePOItem = (index, field, value) => {
    setNewPO((prev) => {
      const updated = [...prev.items];
      if (field === 'inventoryItemId') {
        const inv = inventoryItems.find((i) => i._id === value);
        updated[index] = {
          ...updated[index],
          inventoryItemId: value,
          unitCost: inv ? inv.costPerUnit : updated[index].unitCost,
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: field === 'quantity' || field === 'unitCost' ? parseFloat(value) || 0 : value,
        };
      }
      return { ...prev, items: updated };
    });
  };

  const handleRemovePOItem = (index) => {
    setNewPO((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const poTotalComputed = useMemo(() => {
    return newPO.items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitCost || 0), 0);
  }, [newPO.items]);

  // Action: Create PO
  const handleCreatePOSubmit = async (e) => {
    e.preventDefault();
    if (!newPO.supplierId) {
      showToast('Please select a supplier', 'error');
      return;
    }
    const validItems = newPO.items.filter((i) => i.inventoryItemId && i.quantity > 0);
    if (validItems.length === 0) {
      showToast('Please select at least one valid inventory item and quantity', 'error');
      return;
    }

    try {
      const res = await purchaseApi.createOrder({
        supplierId: newPO.supplierId,
        items: validItems,
        notes: newPO.notes,
      });

      if (res.success) {
        showToast(`Purchase order ${res.data.poNumber} created successfully`);
        setShowCreatePOModal(false);
        setNewPO({
          supplierId: '',
          notes: '',
          items: [{ inventoryItemId: '', quantity: 1, unitCost: 0 }],
        });
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Action: Receive PO (Automated Stock Inward)
  const handleConfirmReceive = async () => {
    if (!receiveTargetPO) return;
    try {
      const res = await purchaseApi.receiveOrder(receiveTargetPO._id);
      if (res.success) {
        showToast(`Goods received! Inward stock added to inventory for ${receiveTargetPO.poNumber}`);
        setReceiveTargetPO(null);
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Action: Cancel PO
  const handleConfirmCancel = async () => {
    if (!cancelTargetPO) return;
    try {
      const res = await purchaseApi.cancelOrder(cancelTargetPO._id, cancelReason);
      if (res.success) {
        showToast(`PO ${cancelTargetPO.poNumber} cancelled with audit log recorded`);
        setCancelTargetPO(null);
        setCancelReason('');
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Action: Change Status to 'ordered'
  const handleMarkOrdered = async (po) => {
    try {
      const res = await purchaseApi.updateOrderStatus(po._id, { status: 'ordered' });
      if (res.success) {
        showToast(`PO ${po.poNumber} marked as sent to supplier`);
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Action: Create Supplier Submit
  const handleCreateSupplierSubmit = async (e) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.phone) {
      showToast('Supplier name and phone are required', 'error');
      return;
    }

    try {
      const res = await purchaseApi.createSupplier(newSupplier);
      if (res.success) {
        showToast(`Supplier ${res.data.name} added successfully`);
        setShowAddSupplierModal(false);
        setNewSupplier({
          name: '',
          contactPerson: '',
          phone: '',
          email: '',
          address: '',
          gstin: '',
        });
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Quick reorder trigger from low stock item
  const handleQuickReorderItem = (item) => {
    setNewPO({
      supplierId: suppliers[0]?._id || '',
      notes: `Urgent restocking: ${item.name} below reorder threshold`,
      items: [
        {
          inventoryItemId: item._id,
          quantity: Math.max(item.reorderLevel * 2, 5),
          unitCost: item.costPerUnit,
        },
      ],
    });
    setShowCreatePOModal(true);
  };

  return (
    <div className="purchase-container">
      {/* Toast Notification */}
      {notification && (
        <div className={`purchase-toast ${notification.type}`}>
          {notification.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="purchase-header">
        <div>
          <div className="purchase-badge-tag">SRS §7 Procurement Subsystem</div>
          <h1 className="purchase-title">Purchase & Supplier Management</h1>
          <p className="purchase-subtitle">
            Manage vendor directories, issue purchase orders, and verify goods received with automated stock inward.
          </p>
        </div>

        <div className="purchase-header-actions">
          <button
            className="purchase-btn secondary"
            onClick={loadData}
            disabled={refreshing}
            title="Refresh data"
          >
            <RotateCcw size={16} className={refreshing ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>
          <button
            className="purchase-btn outline"
            onClick={() => setShowAddSupplierModal(true)}
          >
            <Building2 size={16} />
            <span>+ Add Supplier</span>
          </button>
          <button
            className="purchase-btn primary"
            onClick={() => setShowCreatePOModal(true)}
          >
            <Plus size={16} />
            <span>New Purchase Order</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="purchase-kpi-grid">
        <div className="purchase-kpi-card">
          <div className="kpi-icon-box blue">
            <Building2 size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Active Suppliers</span>
            <span className="kpi-value">{summary.activeSuppliers}</span>
          </div>
        </div>

        <div className="purchase-kpi-card">
          <div className="kpi-icon-box amber">
            <Clock size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Open / Pending POs</span>
            <span className="kpi-value">{summary.pendingOrders}</span>
          </div>
        </div>

        <div className="purchase-kpi-card">
          <div className="kpi-icon-box emerald">
            <FileCheck2 size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Received Orders (GRN)</span>
            <span className="kpi-value">{summary.receivedOrders}</span>
          </div>
        </div>

        <div className="purchase-kpi-card">
          <div className="kpi-icon-box purple">
            <DollarSign size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Inward Spend</span>
            <span className="kpi-value">₹{summary.totalInwardSpend?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="purchase-tabs-bar">
        <div className="purchase-tabs-left">
          <button
            className={`purchase-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ClipboardList size={16} />
            <span>Purchase Orders ({orders.length})</span>
          </button>

          <button
            className={`purchase-tab-btn ${activeTab === 'suppliers' ? 'active' : ''}`}
            onClick={() => setActiveTab('suppliers')}
          >
            <Building2 size={16} />
            <span>Suppliers Directory ({suppliers.length})</span>
          </button>

          <button
            className={`purchase-tab-btn ${activeTab === 'reorder' ? 'active' : ''}`}
            onClick={() => setActiveTab('reorder')}
          >
            <AlertTriangle size={16} />
            <span>Quick Reorder ({lowStockItems.length})</span>
            {lowStockItems.length > 0 && <span className="tab-pill-alert">{lowStockItems.length}</span>}
          </button>
        </div>

        <div className="purchase-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder={
              activeTab === 'orders'
                ? 'Search PO # or vendor...'
                : activeTab === 'suppliers'
                ? 'Search vendor, contact, or GSTIN...'
                : 'Search raw materials...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* TAB CONTENT: PURCHASE ORDERS */}
      {activeTab === 'orders' && (
        <div className="purchase-table-card">
          {/* Status Filter Sub-bar */}
          <div className="po-filter-row">
            <div className="po-status-chips">
              {['all', 'draft', 'ordered', 'received', 'cancelled'].map((st) => (
                <button
                  key={st}
                  className={`status-chip ${statusFilter === st ? 'active' : ''}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="table-responsive">
            <table className="purchase-table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Supplier</th>
                  <th>Created Date</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Fulfillment</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-table-state">
                      <ClipboardList size={36} />
                      <p>No purchase orders found matching this filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((po) => {
                    const supName = typeof po.supplierId === 'object' ? po.supplierId?.name : 'Vendor';
                    const supPhone = typeof po.supplierId === 'object' ? po.supplierId?.phone : '';
                    return (
                      <tr key={po._id} className="po-row">
                        <td className="font-mono font-bold po-number-cell">
                          {po.poNumber}
                        </td>
                        <td>
                          <div className="vendor-meta">
                            <span className="vendor-name">{supName}</span>
                            {supPhone && <span className="vendor-sub">{supPhone}</span>}
                          </div>
                        </td>
                        <td className="text-muted">
                          {new Date(po.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td>
                          <span className="items-count-badge">
                            {po.items?.length || 0} item{(po.items?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="amount-cell">
                          ₹{po.totalAmount?.toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span className={`po-status-pill ${po.status}`}>
                            {po.status === 'received' && <CheckCircle2 size={12} />}
                            {po.status === 'ordered' && <Send size={12} />}
                            {po.status === 'draft' && <Clock size={12} />}
                            {po.status === 'cancelled' && <XCircle size={12} />}
                            <span>{po.status.toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="text-muted">
                          {po.receivedDate ? (
                            <span className="received-date-stamp">
                              Received {new Date(po.receivedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </span>
                          ) : (
                            <span className="pending-stamp">—</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="action-buttons-row">
                            {po.status === 'draft' && (
                              <button
                                className="action-pill-btn blue"
                                onClick={() => handleMarkOrdered(po)}
                                title="Mark PO as sent to vendor"
                              >
                                <Send size={13} />
                                <span>Order</span>
                              </button>
                            )}

                            {(po.status === 'draft' || po.status === 'ordered') && (
                              <button
                                className="action-pill-btn green"
                                onClick={() => setReceiveTargetPO(po)}
                                title="Verify delivery and credit stock into inventory"
                              >
                                <PackageCheck size={13} />
                                <span>Receive</span>
                              </button>
                            )}

                            {(po.status === 'draft' || po.status === 'ordered') && (
                              <button
                                className="action-pill-btn red"
                                onClick={() => setCancelTargetPO(po)}
                                title="Cancel purchase order"
                              >
                                <X size={13} />
                                <span>Cancel</span>
                              </button>
                            )}

                            <button
                              className="action-pill-btn neutral"
                              onClick={() => setViewOrderDetails(po)}
                              title="View full PO details"
                            >
                              <FileText size={13} />
                              <span>Details</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SUPPLIERS DIRECTORY */}
      {activeTab === 'suppliers' && (
        <div className="suppliers-grid">
          {filteredSuppliers.map((s) => (
            <div key={s._id} className={`supplier-card ${!s.isActive ? 'inactive' : ''}`}>
              <div className="supplier-card-top">
                <div className="supplier-name-box">
                  <div className="supplier-avatar">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="supplier-title">{s.name}</h3>
                    <span className="supplier-contact">{s.contactPerson || 'Key Contact'}</span>
                  </div>
                </div>
                <span className={`supplier-status-pill ${s.isActive ? 'active' : 'inactive'}`}>
                  {s.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="supplier-details-list">
                <div className="supplier-detail-row">
                  <Phone size={14} className="icon-muted" />
                  <span>{s.phone}</span>
                </div>
                {s.email && (
                  <div className="supplier-detail-row">
                    <Mail size={14} className="icon-muted" />
                    <span>{s.email}</span>
                  </div>
                )}
                {s.address && (
                  <div className="supplier-detail-row">
                    <MapPin size={14} className="icon-muted" />
                    <span className="text-truncate">{s.address}</span>
                  </div>
                )}
                <div className="supplier-detail-row gstin-row">
                  <span className="gstin-badge">GSTIN</span>
                  <span className="font-mono">{s.gstin || 'Unregistered'}</span>
                </div>
              </div>

              <div className="supplier-card-footer">
                <button
                  className="quick-po-btn"
                  onClick={() => {
                    setNewPO({
                      supplierId: s._id,
                      notes: '',
                      items: [{ inventoryItemId: '', quantity: 1, unitCost: 0 }],
                    });
                    setShowCreatePOModal(true);
                  }}
                >
                  <Plus size={14} />
                  <span>Raise PO</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: QUICK REORDER FROM LOW STOCK */}
      {activeTab === 'reorder' && (
        <div className="reorder-container">
          <div className="reorder-banner">
            <AlertTriangle size={20} />
            <div>
              <strong>Low-Stock Automation (§6 & §7)</strong>
              <p>
                The following {lowStockItems.length} ingredients are below their configured reorder thresholds.
                Quickly raise a purchase order to replenish raw material stock before the kitchen runs out.
              </p>
            </div>
          </div>

          <div className="reorder-grid">
            {lowStockItems.length === 0 ? (
              <div className="empty-reorder-box">
                <ShieldCheck size={48} className="text-emerald" />
                <h3>All Inventory Levels Healthy</h3>
                <p>No ingredients are currently operating below safe minimum reorder levels.</p>
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div key={item._id} className="reorder-card">
                  <div className="reorder-card-header">
                    <div>
                      <span className="reorder-sku font-mono">{item.sku}</span>
                      <h4 className="reorder-name">{item.name}</h4>
                    </div>
                    <span className="category-pill">{item.category}</span>
                  </div>

                  <div className="reorder-stock-status">
                    <div className="stock-level-col">
                      <span className="label">Current Stock</span>
                      <span className="val current alert">
                        {item.currentStock} {item.unit}
                      </span>
                    </div>
                    <div className="stock-level-col">
                      <span className="label">Reorder Level</span>
                      <span className="val min">
                        {item.reorderLevel} {item.unit}
                      </span>
                    </div>
                    <div className="stock-level-col">
                      <span className="label">Cost / Unit</span>
                      <span className="val cost">₹{item.costPerUnit}</span>
                    </div>
                  </div>

                  <div className="reorder-card-actions">
                    <button
                      className="purchase-btn primary full-width"
                      onClick={() => handleQuickReorderItem(item)}
                    >
                      <Plus size={16} />
                      <span>Create Restocking PO</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: CREATE PURCHASE ORDER */}
      {showCreatePOModal && (
        <div className="modal-overlay">
          <div className="modal-dialog po-modal-size">
            <div className="modal-header">
              <div className="modal-title-box">
                <Truck size={20} className="text-primary" />
                <h3>Create New Purchase Order</h3>
              </div>
              <button className="close-btn" onClick={() => setShowCreatePOModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePOSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Vendor / Supplier *</label>
                  <select
                    className="form-control"
                    value={newPO.supplierId}
                    onChange={(e) => setNewPO({ ...newPO, supplierId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Approved Supplier --</option>
                    {suppliers
                      .filter((s) => s.isActive)
                      .map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} (Contact: {s.contactPerson || s.phone})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="po-items-section">
                  <div className="section-header-row">
                    <label>Order Line Items *</label>
                    <button
                      type="button"
                      className="add-item-row-btn"
                      onClick={() => handleAddPOItem()}
                    >
                      <Plus size={14} /> Add Raw Material
                    </button>
                  </div>

                  <div className="po-items-table-wrap">
                    <table className="po-line-items-table">
                      <thead>
                        <tr>
                          <th style={{ width: '45%' }}>Inventory SKU</th>
                          <th style={{ width: '20%' }}>Quantity</th>
                          <th style={{ width: '20%' }}>Unit Cost (₹)</th>
                          <th style={{ width: '15%', textAlign: 'right' }}>Total</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {newPO.items.map((item, idx) => {
                          const selectedInv = inventoryItems.find((i) => i._id === item.inventoryItemId);
                          return (
                            <tr key={idx}>
                              <td>
                                <select
                                  className="form-control small"
                                  value={item.inventoryItemId}
                                  onChange={(e) => handleUpdatePOItem(idx, 'inventoryItemId', e.target.value)}
                                  required
                                >
                                  <option value="">-- Select Material --</option>
                                  {inventoryItems.map((inv) => (
                                    <option key={inv._id} value={inv._id}>
                                      {inv.name} ({inv.sku}) — {inv.unit}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <div className="unit-input-group">
                                  <input
                                    type="number"
                                    min="0.1"
                                    step="any"
                                    className="form-control small"
                                    value={item.quantity}
                                    onChange={(e) => handleUpdatePOItem(idx, 'quantity', e.target.value)}
                                    required
                                  />
                                  <span className="unit-affix">{selectedInv?.unit || ''}</span>
                                </div>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  className="form-control small"
                                  value={item.unitCost}
                                  onChange={(e) => handleUpdatePOItem(idx, 'unitCost', e.target.value)}
                                  required
                                />
                              </td>
                              <td className="line-item-total font-mono" style={{ textAlign: 'right' }}>
                                ₹{((item.quantity || 0) * (item.unitCost || 0)).toLocaleString('en-IN')}
                              </td>
                              <td>
                                {newPO.items.length > 1 && (
                                  <button
                                    type="button"
                                    className="remove-row-btn"
                                    onClick={() => handleRemovePOItem(idx)}
                                  >
                                    <X size={16} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="po-calc-summary">
                    <span>Total Purchase Value:</span>
                    <strong className="po-computed-amount">₹{poTotalComputed.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label>Order Notes / Delivery Instructions</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="e.g. Deliver before 8 AM, morning roasted beans batch, cold transport required"
                    value={newPO.notes}
                    onChange={(e) => setNewPO({ ...newPO, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="purchase-btn secondary"
                  onClick={() => setShowCreatePOModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="purchase-btn primary">
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GOODS RECEIVED NOTE (GRN) CONFIRMATION */}
      {receiveTargetPO && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title-box">
                <PackageCheck size={22} className="text-emerald" />
                <h3>Receive Goods into Stock (GRN)</h3>
              </div>
              <button className="close-btn" onClick={() => setReceiveTargetPO(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="grn-highlight-box">
                <div className="grn-meta-row">
                  <span>PO Number:</span>
                  <strong className="font-mono">{receiveTargetPO.poNumber}</strong>
                </div>
                <div className="grn-meta-row">
                  <span>Supplier:</span>
                  <strong>
                    {typeof receiveTargetPO.supplierId === 'object'
                      ? receiveTargetPO.supplierId?.name
                      : 'Vendor'}
                  </strong>
                </div>
                <div className="grn-meta-row">
                  <span>Total Value:</span>
                  <strong>₹{receiveTargetPO.totalAmount?.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div className="grn-items-list">
                <h4>Inward Stock Breakdown:</h4>
                <div className="grn-items-table-wrap">
                  <table className="grn-table">
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Inward Quantity</th>
                        <th>Unit Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receiveTargetPO.items?.map((it, idx) => {
                        const inv =
                          typeof it.inventoryItemId === 'object'
                            ? it.inventoryItemId
                            : inventoryItems.find((i) => i._id === it.inventoryItemId);
                        return (
                          <tr key={idx}>
                            <td>
                              <strong>{inv?.name || 'Raw Material'}</strong>
                              <span className="item-sku-sub font-mono">{inv?.sku}</span>
                            </td>
                            <td className="font-bold text-emerald">
                              +{it.quantity} {inv?.unit || ''}
                            </td>
                            <td>₹{it.unitCost}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grn-audit-notice">
                <ShieldCheck size={18} className="text-emerald" />
                <p>
                  Confirming reception will immediately increment live inventory stock levels and create an
                  immutable audit log entry in compliance with Café Operating Standards.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="purchase-btn secondary"
                onClick={() => setReceiveTargetPO(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="purchase-btn primary emerald-action"
                onClick={handleConfirmReceive}
              >
                Confirm Goods Receipt & Update Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CANCEL PO */}
      {cancelTargetPO && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title-box">
                <XCircle size={22} className="text-red" />
                <h3>Cancel Purchase Order</h3>
              </div>
              <button className="close-btn" onClick={() => setCancelTargetPO(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p>
                Are you sure you want to cancel purchase order{' '}
                <strong className="font-mono">{cancelTargetPO.poNumber}</strong>?
              </p>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Cancellation Reason *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g. Supplier out of stock, duplicate order, changed menu requirements"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="purchase-btn secondary"
                onClick={() => setCancelTargetPO(null)}
              >
                Back
              </button>
              <button
                type="button"
                className="purchase-btn primary red-action"
                onClick={handleConfirmCancel}
                disabled={!cancelReason.trim()}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUPPLIER */}
      {showAddSupplierModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title-box">
                <Building2 size={20} className="text-primary" />
                <h3>Add Approved Supplier</h3>
              </div>
              <button className="close-btn" onClick={() => setShowAddSupplierModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSupplierSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Company / Supplier Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Coorg Spice & Vanilla Planters"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Person</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Kavita Somanna"
                      value={newSupplier.contactPerson}
                      onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="e.g. +91 94801 12233"
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. orders@coorgspice.in"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>GSTIN (15 Characters)</label>
                    <input
                      type="text"
                      className="form-control font-mono"
                      placeholder="e.g. 29AAACG1234F1ZV"
                      maxLength={15}
                      value={newSupplier.gstin}
                      onChange={(e) => setNewSupplier({ ...newSupplier, gstin: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Office / Plantation Address</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Address, City, State, PIN"
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="purchase-btn secondary"
                  onClick={() => setShowAddSupplierModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="purchase-btn primary">
                  Save Vendor Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW PO DETAILS */}
      {viewOrderDetails && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title-box">
                <FileText size={20} className="text-primary" />
                <h3>Purchase Order Details</h3>
              </div>
              <button className="close-btn" onClick={() => setViewOrderDetails(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="po-details-summary">
                <div className="summary-col">
                  <span className="label">PO Number</span>
                  <strong className="font-mono">{viewOrderDetails.poNumber}</strong>
                </div>
                <div className="summary-col">
                  <span className="label">Status</span>
                  <span className={`po-status-pill ${viewOrderDetails.status}`}>
                    {viewOrderDetails.status.toUpperCase()}
                  </span>
                </div>
                <div className="summary-col">
                  <span className="label">Issued Date</span>
                  <span>{new Date(viewOrderDetails.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              <div className="details-vendor-card">
                <span className="label">Vendor Information:</span>
                <strong>
                  {typeof viewOrderDetails.supplierId === 'object'
                    ? viewOrderDetails.supplierId?.name
                    : 'Vendor'}
                </strong>
                {typeof viewOrderDetails.supplierId === 'object' && viewOrderDetails.supplierId?.gstin && (
                  <span className="gstin-sub font-mono">GSTIN: {viewOrderDetails.supplierId?.gstin}</span>
                )}
              </div>

              <div className="details-items-wrap">
                <table className="grn-table">
                  <thead>
                    <tr>
                      <th>Material Item</th>
                      <th>Quantity</th>
                      <th>Unit Rate</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewOrderDetails.items?.map((it, idx) => {
                      const inv =
                        typeof it.inventoryItemId === 'object'
                          ? it.inventoryItemId
                          : inventoryItems.find((i) => i._id === it.inventoryItemId);
                      return (
                        <tr key={idx}>
                          <td>{inv?.name || 'Item'}</td>
                          <td>
                            {it.quantity} {inv?.unit || ''}
                          </td>
                          <td>₹{it.unitCost}</td>
                          <td style={{ textAlign: 'right' }} className="font-mono">
                            ₹{(it.totalCost || it.quantity * it.unitCost).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                        Order Total:
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }} className="font-mono">
                        ₹{viewOrderDetails.totalAmount?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {viewOrderDetails.notes && (
                <div className="details-notes-box">
                  <span className="label">Order Notes:</span>
                  <p>{viewOrderDetails.notes}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="purchase-btn primary"
                onClick={() => setViewOrderDetails(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
