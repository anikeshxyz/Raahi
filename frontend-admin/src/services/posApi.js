const API_BASE = '/api/v1/pos';

export const posApi = {
  async getTables() {
    const res = await fetch(`${API_BASE}/tables`);
    if (!res.ok) throw new Error('Failed to fetch tables');
    return res.json();
  },

  async getMenu() {
    const res = await fetch(`${API_BASE}/menu`);
    if (!res.ok) throw new Error('Failed to fetch POS menu');
    return res.json();
  },

  async getOrder(orderId) {
    const res = await fetch(`${API_BASE}/orders/${orderId}`);
    if (!res.ok) throw new Error('Failed to fetch order details');
    return res.json();
  },

  async createOrder(payload) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || (data.errors && data.errors[0]) || 'Failed to create order');
    return data;
  },

  async addItems(orderId, items) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/items`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update order items');
    return data;
  },

  async sendKot(orderId) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/kot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send KOT');
    return data;
  },

  async settleOrder(orderId, payload) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || (data.errors && data.errors[0]) || 'Failed to settle bill');
    return data;
  },

  async cancelOrder(orderId, reason) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to cancel order');
    return data;
  },

  async getReservations() {
    const res = await fetch(`${API_BASE}/reservations`);
    if (!res.ok) throw new Error('Failed to fetch table reservations');
    return res.json();
  },

  async assignReservation(reservationId, tableId) {
    const res = await fetch(`${API_BASE}/reservations/${reservationId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to assign table');
    return data;
  },

  async seatReservation(reservationId) {
    const res = await fetch(`${API_BASE}/reservations/${reservationId}/seat`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to mark reservation as seated');
    return data;
  },

  async cancelReservation(reservationId) {
    const res = await fetch(`${API_BASE}/reservations/${reservationId}/cancel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to cancel reservation');
    return data;
  },
};
