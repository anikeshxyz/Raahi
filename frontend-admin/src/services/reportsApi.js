const API_BASE = '/api/v1/reports';

export const reportsApi = {
  async getSales(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/sales?${query}` : `${API_BASE}/sales`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch sales analytics');
    return res.json();
  },

  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/products?${query}` : `${API_BASE}/products`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch product performance');
    return res.json();
  },

  async getKitchen() {
    const res = await fetch(`${API_BASE}/kitchen`);
    if (!res.ok) throw new Error('Failed to fetch kitchen metrics');
    return res.json();
  },

  async getAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/audit-logs?${query}` : `${API_BASE}/audit-logs`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  getExportUrl(type = 'sales', format = 'csv') {
    return `${API_BASE}/export?type=${type}&format=${format}`;
  },
};
