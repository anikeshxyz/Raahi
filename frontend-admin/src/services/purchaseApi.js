const API_BASE = '/api/v1/purchase';

export const purchaseApi = {
  async getSummary() {
    const res = await fetch(`${API_BASE}/summary`);
    if (!res.ok) throw new Error('Failed to fetch purchase summary');
    return res.json();
  },

  async getSuppliers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/suppliers?${query}` : `${API_BASE}/suppliers`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch suppliers');
    return res.json();
  },

  async createSupplier(payload) {
    const res = await fetch(`${API_BASE}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || (data.errors ? data.errors.join(', ') : 'Failed to create supplier'));
    return data;
  },

  async updateSupplier(id, payload) {
    const res = await fetch(`${API_BASE}/suppliers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update supplier');
    return data;
  },

  async deleteSupplier(id) {
    const res = await fetch(`${API_BASE}/suppliers/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to deactivate supplier');
    return data;
  },

  async getOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/orders?${query}` : `${API_BASE}/orders`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch purchase orders');
    return res.json();
  },

  async getOrderById(id) {
    const res = await fetch(`${API_BASE}/orders/${id}`);
    if (!res.ok) throw new Error('Failed to fetch purchase order');
    return res.json();
  },

  async createOrder(payload) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || (data.errors ? data.errors.join(', ') : 'Failed to create purchase order'));
    return data;
  },

  async updateOrderStatus(id, payload) {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update order status');
    return data;
  },

  async receiveOrder(id) {
    const res = await fetch(`${API_BASE}/orders/${id}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to receive purchase order');
    return data;
  },

  async cancelOrder(id, reason = '') {
    const res = await fetch(`${API_BASE}/orders/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to cancel purchase order');
    return data;
  },
};
