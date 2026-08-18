// src/api.js
// Client API Client for LIGHTINMOTION Backend

export async function apiFetch(endpoint, options = {}) {
  const headers = { ...options.headers };

  // Attach auth tokens if available
  const adminToken = localStorage.getItem('lim_admin_token');
  const customerToken = localStorage.getItem('lim_customer_token');

  if (options.isAdmin && adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  } else if (customerToken) {
    headers['Authorization'] = `Bearer ${customerToken}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

// ---------------- PRODUCTS API ----------------
export const getProducts = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/products${query ? `?${query}` : ''}`);
};

export const getProduct = (id) => apiFetch(`/api/products/${id}`);

export const adminGetProducts = () => apiFetch('/api/products/admin/all', { isAdmin: true });

export const adminCreateProduct = (data) =>
  apiFetch('/api/products/admin/create', {
    method: 'POST',
    body: JSON.stringify(data),
    isAdmin: true
  });

export const adminUpdateProduct = (id, data) =>
  apiFetch(`/api/products/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    isAdmin: true
  });

export const adminDeleteProduct = (id) =>
  apiFetch(`/api/products/admin/${id}`, {
    method: 'DELETE',
    isAdmin: true
  });

export const adminUploadFiles = (formData) =>
  apiFetch('/api/products/admin/upload', {
    method: 'POST',
    body: formData,
    isAdmin: true
  });

// ---------------- DISCOUNTS API ----------------
export const validateDiscount = (code, subtotal, customerEmail) =>
  apiFetch('/api/discounts/validate', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal, customerEmail })
  });

export const adminGetDiscounts = () => apiFetch('/api/discounts/admin/all', { isAdmin: true });

export const adminCreateDiscount = (data) =>
  apiFetch('/api/discounts/admin/create', {
    method: 'POST',
    body: JSON.stringify(data),
    isAdmin: true
  });

export const adminUpdateDiscount = (id, data) =>
  apiFetch(`/api/discounts/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    isAdmin: true
  });

export const adminDeleteDiscount = (id) =>
  apiFetch(`/api/discounts/admin/${id}`, {
    method: 'DELETE',
    isAdmin: true
  });

// ---------------- ORDERS API ----------------
export const createOrder = (orderPayload) =>
  apiFetch('/api/orders/create', {
    method: 'POST',
    body: JSON.stringify(orderPayload)
  });

export const trackOrder = (orderNumber) => apiFetch(`/api/orders/track/${encodeURIComponent(orderNumber)}`);

export const adminGetOrders = () => apiFetch('/api/orders/admin/all', { isAdmin: true });

export const adminGetOrder = (id) => apiFetch(`/api/orders/admin/${id}`, { isAdmin: true });

export const adminUpdateOrderStatus = (id, statusData) =>
  apiFetch(`/api/orders/admin/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData),
    isAdmin: true
  });

export const adminUpdateTracking = (id, trackingData) =>
  apiFetch(`/api/orders/admin/${id}/tracking`, {
    method: 'PUT',
    body: JSON.stringify(trackingData),
    isAdmin: true
  });

// ---------------- AUTH API ----------------
export const adminLogin = (email, password) =>
  apiFetch('/api/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

export const customerRegister = (userData) =>
  apiFetch('/api/auth/customer/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });

export const customerLogin = (email, password) =>
  apiFetch('/api/auth/customer/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

export const customerGetMe = () => apiFetch('/api/auth/customer/me');

// ---------------- CUSTOMERS API ----------------
export const adminGetCustomers = () => apiFetch('/api/customers/admin/all', { isAdmin: true });

export const adminGetCustomer = (id) => apiFetch(`/api/customers/admin/${id}`, { isAdmin: true });

// ---------------- ANALYTICS API ----------------
export const adminGetAnalytics = (range = '30d') =>
  apiFetch(`/api/analytics/admin?range=${range}`, { isAdmin: true });

// ---------------- CONTENT & SETTINGS API ----------------
export const getContentPages = () => apiFetch('/api/content/pages');

export const getContentPage = (slug) => apiFetch(`/api/content/pages/${slug}`);

export const adminUpdateContentPage = (slug, data) =>
  apiFetch(`/api/content/admin/pages/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    isAdmin: true
  });

export const getSettings = () => apiFetch('/api/settings');

export const adminUpdateSettings = (settingsData) =>
  apiFetch('/api/settings/admin', {
    method: 'PUT',
    body: JSON.stringify(settingsData),
    isAdmin: true
  });
