const API_BASE = '/api';

function getCustomerAuthHeader() {
  const token = localStorage.getItem('freshcart_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getAdminAuthHeader() {
  const token = localStorage.getItem('freshcart_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth (Customer)
  register: async (data) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Registration failed');
    return result;
  },

  login: async (data) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Login failed');
    return result;
  },

  getProfile: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getCustomerAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  updateProfile: async (data) => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getCustomerAuthHeader() },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update profile');
    return result;
  },

  // Auth (Admin)
  adminLogin: async (data) => {
    const res = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Admin login failed');
    return result;
  },

  // Products & Categories
  getCategories: async () => {
    const res = await fetch(`${API_BASE}/products/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  getProducts: async ({ category = 'all', search = '', sort = 'popular', includeInactive = false } = {}) => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);
    if (includeInactive) params.append('includeInactive', 'true');

    const res = await fetch(`${API_BASE}/products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  getProductById: async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  // Coupons
  validateCoupon: async (code, subtotal) => {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Invalid coupon');
    return result;
  },

  getActiveCoupons: async () => {
    const res = await fetch(`${API_BASE}/coupons`);
    if (!res.ok) return { coupons: [] };
    return res.json();
  },

  // Orders (Customer)
  placeOrder: async (orderData) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getCustomerAuthHeader() },
      body: JSON.stringify(orderData)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to place order');
    return result;
  },

  getMyOrders: async () => {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: { ...getCustomerAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  getOrderById: async (id) => {
    const res = await fetch(`${API_BASE}/orders/${id}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  // Admin APIs
  getAdminOverview: async () => {
    const res = await fetch(`${API_BASE}/analytics/overview`, {
      headers: { ...getAdminAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load admin analytics');
    return res.json();
  },

  getAdminOrders: async ({ status = 'all', date = '', search = '' } = {}) => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (date) params.append('date', date);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/orders/admin/all?${params.toString()}`, {
      headers: { ...getAdminAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch admin orders');
    return res.json();
  },

  updateOrderStatus: async (id, status, payment_status) => {
    const res = await fetch(`${API_BASE}/orders/admin/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAdminAuthHeader() },
      body: JSON.stringify({ status, payment_status })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update order status');
    return result;
  },

  exportOrdersCSVUrl: (status = 'all', date = '') => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (date) params.append('date', date);
    return `${API_BASE}/orders/admin/export/csv?${params.toString()}`;
  },

  // Admin Product Management
  adminAddProduct: async (productData) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAdminAuthHeader() },
      body: JSON.stringify(productData)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to add product');
    return result;
  },

  adminUpdateProduct: async (id, productData) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAdminAuthHeader() },
      body: JSON.stringify(productData)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update product');
    return result;
  },

  adminToggleProductStatus: async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}/toggle-status`, {
      method: 'PATCH',
      headers: { ...getAdminAuthHeader() }
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to toggle product status');
    return result;
  },

  adminDeleteProduct: async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: { ...getAdminAuthHeader() }
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete product');
    return result;
  }
};
