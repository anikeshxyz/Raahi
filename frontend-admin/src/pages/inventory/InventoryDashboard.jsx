import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  PackageCheck,
  RotateCcw,
  Search,
  Plus,
  Edit3,
  Sliders,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  DollarSign,
  Boxes,
  BookOpen,
  X,
  TrendingDown,
  AlertCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { inventoryApi } from '../../services/inventoryApi';

export const InventoryDashboard = () => {
  const [items, setItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [summary, setSummary] = useState({ totalSKUs: 0, lowStockCount: 0, totalValuation: 0 });
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'lowStock', 'recipes'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modals
  const [adjustItem, setAdjustItem] = useState(null);
  const [adjustType, setAdjustType] = useState('subtract'); // 'add', 'subtract', 'set'
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    category: 'raw-material',
    currentStock: '',
    reorderLevel: '',
    unit: 'kg',
    costPerUnit: '',
  });
  const [viewRecipe, setViewRecipe] = useState(null);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [itemsRes, recipesRes] = await Promise.all([
        inventoryApi.getItems(),
        inventoryApi.getRecipes(),
      ]);

      if (itemsRes.success) {
        setItems(itemsRes.data || []);
        if (itemsRes.summary) setSummary(itemsRes.summary);
      }
      if (recipesRes.success) {
        setRecipes(recipesRes.data || []);
      }
    } catch (err) {
      console.error('[Inventory Load Error]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchLowStock = activeTab !== 'lowStock' || item.currentStock <= item.reorderLevel;
      return matchCat && matchSearch && matchLowStock;
    });
  }, [items, categoryFilter, searchQuery, activeTab]);

  // Action: Submit Manual Stock Adjustment
  const handleConfirmAdjust = async (e) => {
    e.preventDefault();
    if (!adjustItem) return;

    if (!adjustReason.trim()) {
      showToast('Adjustment reason is mandatory per AGENTS.md audit requirements', 'error');
      return;
    }

    if (Number(adjustQty) <= 0) {
      showToast('Quantity must be greater than 0', 'error');
      return;
    }

    try {
      const res = await inventoryApi.adjustStock(adjustItem._id, {
        adjustmentType: adjustType,
        quantity: Number(adjustQty),
        reason: adjustReason,
      });

      if (res.success) {
        showToast(`Stock adjusted for ${adjustItem.name} & audit log recorded!`);
        setAdjustItem(null);
        setAdjustQty('');
        setAdjustReason('');
        await loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to adjust stock', 'error');
    }
  };

  // Action: Add New Inventory Item
  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      const res = await inventoryApi.createItem({
        ...newItem,
        currentStock: Number(newItem.currentStock) || 0,
        reorderLevel: Number(newItem.reorderLevel) || 5,
        costPerUnit: Number(newItem.costPerUnit) || 0,
      });

      if (res.success) {
        showToast(`Item ${newItem.name} created successfully!`);
        setShowAddModal(false);
        setNewItem({
          name: '',
          sku: '',
          category: 'raw-material',
          currentStock: '',
          reorderLevel: '',
          unit: 'kg',
          costPerUnit: '',
        });
        await loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create item', 'error');
    }
  };

  return (
    <div className="inventory-container">
      {/* Toast Notification */}
      {notification && (
        <div className={`pos-toast pos-toast-${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <span className="stat-label">Total SKUs</span>
          <span className="stat-value">{summary.totalSKUs}</span>
          <span className="stat-badge">Active Catalog</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Low Stock Alerts</span>
          <span
            className="stat-value"
            style={{ color: summary.lowStockCount > 0 ? 'var(--danger)' : 'var(--success)' }}
          >
            {summary.lowStockCount} Items
          </span>
          <span
            className="stat-badge"
            style={{ color: summary.lowStockCount > 0 ? 'var(--danger)' : 'var(--success)' }}
          >
            {summary.lowStockCount > 0 ? 'Below Reorder Point' : 'Stock Healthy'}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Stock Valuation</span>
          <span className="stat-value">₹{(summary.totalValuation || 0).toLocaleString('en-IN')}</span>
          <span className="stat-badge">Cost Basis (FIFO)</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Mapped Recipes</span>
          <span className="stat-value">{recipes.length}</span>
          <span className="stat-badge">Auto-Deduct on POS</span>
        </div>
      </div>

      {/* Navigation Toolbar */}
      <div className="inventory-toolbar">
        <div className="pos-filter-group">
          <button
            className={`filter-btn ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <Boxes size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Stock Catalog ({items.length})
          </button>
          <button
            className={`filter-btn ${activeTab === 'lowStock' ? 'active' : ''}`}
            onClick={() => setActiveTab('lowStock')}
          >
            <AlertTriangle size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Low Stock Alerts ({summary.lowStockCount})
          </button>
          <button
            className={`filter-btn ${activeTab === 'recipes' ? 'active' : ''}`}
            onClick={() => setActiveTab('recipes')}
          >
            <BookOpen size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Recipe Mappings ({recipes.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {activeTab !== 'recipes' && (
            <div className="pos-search-bar" style={{ width: '220px' }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search raw materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          <button
            className="btn-secondary"
            onClick={loadData}
            disabled={refreshing}
            style={{ padding: '8px 12px' }}
            title="Refresh Inventory"
          >
            <RotateCcw size={16} className={refreshing ? 'spin' : ''} />
          </button>

          {activeTab !== 'recipes' && (
            <button
              className="btn-primary"
              onClick={() => setShowAddModal(true)}
              style={{ padding: '8px 14px' }}
            >
              <Plus size={16} />
              <span>Add SKU</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills (for Catalog view) */}
      {activeTab !== 'recipes' && (
        <div className="inv-category-pills">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'raw-material', label: '🌾 Raw Materials' },
            { id: 'beverage-supply', label: '☕ Beverage Supplies' },
            { id: 'dairy', label: '🥛 Dairy & Plant Milk' },
            { id: 'produce', label: '🥑 Fresh Produce' },
            { id: 'packaging', label: '📦 Packaging' },
            { id: 'condiments', label: '🍯 Condiments' },
          ].map((cat) => (
            <button
              key={cat.id}
              className={`cat-pill ${categoryFilter === cat.id ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* View: Inventory Catalog Table */}
      {activeTab !== 'recipes' && (
        <div className="inv-table-wrapper">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Item / Description</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th>Unit Cost</th>
                <th>Total Valuation</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No inventory items found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.currentStock <= item.reorderLevel;
                  const itemValuation = Math.round(item.currentStock * item.costPerUnit * 100) / 100;

                  return (
                    <tr key={item._id} className={isLow ? 'row-low-stock' : ''}>
                      <td>
                        <span className="inv-item-name">{item.name}</span>
                      </td>
                      <td>
                        <span className="inv-sku-chip">{item.sku}</span>
                      </td>
                      <td>
                        <span className="inv-cat-tag">{item.category}</span>
                      </td>
                      <td>
                        <div className="inv-stock-cell">
                          <span className="stock-num">
                            {item.currentStock} {item.unit}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {item.reorderLevel} {item.unit}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${isLow ? 'pill-low-stock' : 'pill-in-stock'}`}>
                          {isLow ? '⚠️ Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td>₹{item.costPerUnit}</td>
                      <td style={{ fontWeight: 600 }}>₹{itemValuation.toLocaleString('en-IN')}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn-secondary inv-adjust-btn"
                          onClick={() => {
                            setAdjustItem(item);
                            setAdjustType('subtract');
                            setAdjustQty('');
                            setAdjustReason('');
                          }}
                          title="Reconcile / Adjust Stock"
                        >
                          <Sliders size={14} />
                          <span>Adjust</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* View: Recipe Mappings Grid */}
      {activeTab === 'recipes' && (
        <div className="recipe-cards-grid">
          {recipes.map((rec) => (
            <div key={rec._id} className="recipe-card">
              <div className="recipe-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Coffee size={18} color="var(--primary)" />
                  <h4>{rec.menuItemId?.name || 'Artisanal Dish'}</h4>
                </div>
                <span className="recipe-servings-badge">{rec.yieldServings} Serving</span>
              </div>

              {rec.preparationNotes && (
                <p className="recipe-notes">{rec.preparationNotes}</p>
              )}

              <div className="recipe-ingredients-box">
                <span className="ing-title">Ingredient Deductions on Sale:</span>
                <ul className="ing-list">
                  {(rec.ingredients || []).map((ing, idx) => (
                    <li key={idx} className="ing-item">
                      <span className="ing-name">
                        {ing.inventoryItem?.name || ing.inventoryItemId?.name || 'Raw Material'}
                      </span>
                      <span className="ing-qty">
                        {ing.quantity} {ing.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="recipe-footer-hint">
                <CheckCircle2 size={14} color="var(--success)" />
                <span>Auto-deducts from stock on every POS order creation</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Manual Stock Adjustment (MANDATORY AUDIT LOG) */}
      {adjustItem && (
        <div className="pos-modal-overlay">
          <div className="pos-modal-card">
            <div className="modal-header">
              <h3>Stock Reconciliation & Adjustment</h3>
              <button className="modal-close-btn" onClick={() => setAdjustItem(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="adjust-item-banner">
              <div>
                <h4>{adjustItem.name}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  SKU: {adjustItem.sku} • Current: {adjustItem.currentStock} {adjustItem.unit}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmAdjust}>
              <div className="form-group">
                <label>Adjustment Type</label>
                <div className="payment-modes-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <button
                    type="button"
                    className={`pay-mode-card ${adjustType === 'subtract' ? 'active' : ''}`}
                    onClick={() => setAdjustType('subtract')}
                  >
                    <TrendingDown size={20} />
                    <span>Wastage / Loss</span>
                  </button>
                  <button
                    type="button"
                    className={`pay-mode-card ${adjustType === 'add' ? 'active' : ''}`}
                    onClick={() => setAdjustType('add')}
                  >
                    <Plus size={20} />
                    <span>Receive Inward</span>
                  </button>
                  <button
                    type="button"
                    className={`pay-mode-card ${adjustType === 'set' ? 'active' : ''}`}
                    onClick={() => setAdjustType('set')}
                  >
                    <Boxes size={20} />
                    <span>Count Audit</span>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Quantity to {adjustType.toUpperCase()} ({adjustItem.unit})</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder={`Enter quantity in ${adjustItem.unit}`}
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={14} color="var(--primary)" />
                  <span>Mandatory Adjustment Reason (Recorded to AuditLog)</span>
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g. Broken packaging / barista morning milk calibration / supplier delivery batch"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setAdjustItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm & Write Audit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Inventory Item */}
      {showAddModal && (
        <div className="pos-modal-overlay">
          <div className="pos-modal-card">
            <div className="modal-header">
              <h3>Add New Inventory SKU</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateItem}>
              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Grade-A Rwandan Arabica Beans"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>SKU Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="BEV-COF-002"
                    value={newItem.sku}
                    onChange={(e) => setNewItem({ ...newItem, sku: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-input"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  >
                    <option value="raw-material">Raw Material</option>
                    <option value="beverage-supply">Beverage Supply</option>
                    <option value="dairy">Dairy & Plant Milk</option>
                    <option value="produce">Produce</option>
                    <option value="packaging">Packaging</option>
                    <option value="condiments">Condiments</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div className="form-group">
                  <label>Opening Stock</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    placeholder="0"
                    value={newItem.currentStock}
                    onChange={(e) => setNewItem({ ...newItem, currentStock: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <select
                    className="form-input"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">l</option>
                    <option value="ml">ml</option>
                    <option value="pcs">pcs</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Reorder Level</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    placeholder="5"
                    value={newItem.reorderLevel}
                    onChange={(e) => setNewItem({ ...newItem, reorderLevel: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Cost per Unit (₹)</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="e.g. 650"
                  value={newItem.costPerUnit}
                  onChange={(e) => setNewItem({ ...newItem, costPerUnit: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Inventory SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
