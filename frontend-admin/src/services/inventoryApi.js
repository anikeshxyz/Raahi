const API_BASE = '/api/v1/inventory';

export const inventoryApi = {
  async getItems(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/items?${query}` : `${API_BASE}/items`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch inventory items');
    return res.json();
  },

  async getLowStock() {
    const res = await fetch(`${API_BASE}/low-stock`);
    if (!res.ok) throw new Error('Failed to fetch low stock items');
    return res.json();
  },

  async createItem(payload) {
    const res = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create inventory item');
    return data;
  },

  async updateItem(id, payload) {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update inventory item');
    return data;
  },

  async adjustStock(id, payload) {
    const res = await fetch(`${API_BASE}/items/${id}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to adjust stock');
    return data;
  },

  async getRecipes() {
    const res = await fetch(`${API_BASE}/recipes`);
    if (!res.ok) throw new Error('Failed to fetch recipes');
    return res.json();
  },

  async saveRecipe(payload) {
    const res = await fetch(`${API_BASE}/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to save recipe mapping');
    return data;
  },
};
