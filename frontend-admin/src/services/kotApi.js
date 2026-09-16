const API_BASE = '/api/v1/kot';

export const kotApi = {
  async getTickets(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/tickets?${query}` : `${API_BASE}/tickets`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch kitchen tickets');
    return res.json();
  },

  async getTicketById(id) {
    const res = await fetch(`${API_BASE}/tickets/${id}`);
    if (!res.ok) throw new Error('Failed to fetch ticket detail');
    return res.json();
  },

  async updateTicketStatus(id, kotStatus) {
    const res = await fetch(`${API_BASE}/tickets/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kotStatus }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update ticket status');
    return data;
  },

  async updateItemStatus(ticketId, itemId, status) {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}/items/${itemId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update item status');
    return data;
  },

  async getSummary() {
    const res = await fetch(`${API_BASE}/summary`);
    if (!res.ok) throw new Error('Failed to fetch kitchen summary');
    return res.json();
  },
};
