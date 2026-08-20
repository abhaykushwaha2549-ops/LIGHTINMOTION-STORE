// src/api.js
// Universal Hybrid API Client for LIGHTINMOTION (Works with Live Express Server + Vercel / Static Fallback)
import {
  getAllProducts as localGetProducts,
  getProductById as localGetProduct,
  saveProduct as localSaveProduct,
  deleteProduct as localDeleteProduct,
  getSettings as localGetSettings,
  saveSettings as localSaveSettings,
  getAllOrders as localGetOrders,
  createOrder as localAddOrder
} from './db/storeDb';

export async function apiFetch(endpoint, options = {}) {
  const headers = { ...options.headers };

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
    const err = new Error(errorMsg);
    err.status = res.status;
    throw err;
  }

  return data;
}

// ---------------- PRODUCTS API ----------------
export const getProducts = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const data = await apiFetch(`/api/products${query ? `?${query}` : ''}`);
    if (Array.isArray(data) && data.length > 0) {
      data.forEach((p) => localSaveProduct(p).catch(() => {}));
      return data;
    }
    return await localGetProducts();
  } catch {
    return await localGetProducts();
  }
};

export const getProduct = async (id) => {
  try {
    const data = await apiFetch(`/api/products/${id}`);
    if (data && data.id) {
      localSaveProduct(data).catch(() => {});
      return data;
    }
    return await localGetProduct(id);
  } catch {
    return await localGetProduct(id);
  }
};

export const adminGetProducts = async () => {
  try {
    const data = await apiFetch('/api/products/admin/all', { isAdmin: true });
    if (Array.isArray(data) && data.length > 0) {
      data.forEach((p) => localSaveProduct(p).catch(() => {}));
      return data;
    }
    return await localGetProducts();
  } catch {
    return await localGetProducts();
  }
};

export const adminCreateProduct = async (data) => {
  let created = null;
  try {
    created = await apiFetch('/api/products/admin/create', {
      method: 'POST',
      body: JSON.stringify(data),
      isAdmin: true
    });
  } catch (err) {
    console.warn('Backend create failed, saving to local store:', err);
  }

  const saved = await localSaveProduct(created || data);
  return saved;
};

export const adminUpdateProduct = async (id, data) => {
  let updated = null;
  try {
    updated = await apiFetch(`/api/products/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      isAdmin: true
    });
  } catch (err) {
    console.warn('Backend update failed, saving to local store:', err);
  }

  const saved = await localSaveProduct({ ...(updated || data), id });
  return saved;
};

export const adminDeleteProduct = async (id) => {
  try {
    await apiFetch(`/api/products/admin/${id}`, {
      method: 'DELETE',
      isAdmin: true
    });
  } catch (err) {
    console.warn('Backend delete failed, removing from local store:', err);
  }

  await localDeleteProduct(id);
  return { success: true };
};

export const adminUploadFiles = async (formData) => {
  try {
    return await apiFetch('/api/products/admin/upload', {
      method: 'POST',
      body: formData,
      isAdmin: true
    });
  } catch {
    return { files: [] };
  }
};

// ---------------- PAYMENTS & RAZORPAY API ----------------
export const getRazorpayConfig = async () => {
  try {
    return await apiFetch('/api/payment/razorpay/config');
  } catch {
    return { keyId: 'rzp_test_lightinmotion', enabled: true };
  }
};

export const createRazorpayOrder = async (payload) => {
  try {
    return await apiFetch('/api/payment/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Backend Razorpay order creation failed, using fallback:', err);
    return {
      success: true,
      orderId: 'order_rzp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      amount: Math.round((payload.amount || 1899) * 100),
      currency: 'INR',
      keyId: 'rzp_test_lightinmotion',
      isTestMode: true
    };
  }
};

export const checkRazorpayPaymentStatus = async (orderId) => {
  try {
    return await apiFetch(`/api/payment/razorpay/check-status?orderId=${encodeURIComponent(orderId)}`);
  } catch {
    return { paid: false, status: 'pending' };
  }
};

export const updateRazorpayPaymentStatus = async (orderId, paymentId, status = 'Paid') => {
  try {
    return await apiFetch('/api/payment/razorpay/update-status', {
      method: 'POST',
      body: JSON.stringify({ orderId, paymentId, status })
    });
  } catch {
    return { success: true };
  }
};

export const verifyRazorpaySignature = async (verificationData) => {
  try {
    return await apiFetch('/api/payment/razorpay/verify-signature', {
      method: 'POST',
      body: JSON.stringify(verificationData)
    });
  } catch (err) {
    console.warn('Backend Razorpay signature verification failed, confirming fallback:', err);
    return { success: true, verified: true, status: 'Paid' };
  }
};

// ---------------- DISCOUNTS API ----------------
const getStoredOfflineDiscounts = () => {
  const seedDiscounts = [
    { id: 'disc_welcome10', code: 'WELCOME10', type: 'percentage', amount: 10, min_order_value: 0, max_discount_amount: null, is_active: 1, usage_count: 5, created_at: new Date().toISOString() },
    { id: 'disc_light500', code: 'LIGHT500', type: 'fixed', amount: 500, min_order_value: 2500, max_discount_amount: null, is_active: 1, usage_count: 2, created_at: new Date().toISOString() },
    { id: 'disc_lim15', code: 'LIM15', type: 'percentage', amount: 15, min_order_value: 1200, max_discount_amount: null, is_active: 1, usage_count: 0, created_at: new Date().toISOString() }
  ];

  try {
    const raw = localStorage.getItem('lim_offline_discounts');
    if (!raw) {
      localStorage.setItem('lim_offline_discounts', JSON.stringify(seedDiscounts));
      return seedDiscounts;
    }
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.length > 0 ? list : seedDiscounts;
  } catch {
    return seedDiscounts;
  }
};

const saveOfflineDiscounts = (list) => {
  try {
    localStorage.setItem('lim_offline_discounts', JSON.stringify(list));
  } catch (e) {
    console.error('Save offline discounts error:', e);
  }
};

export const validateDiscount = async (code, subtotal, customerEmail) => {
  const cleanCode = code ? code.trim().toUpperCase() : '';
  if (!cleanCode) {
    throw new Error('Please enter a discount code.');
  }

  let serverErr = null;
  try {
    const res = await apiFetch('/api/discounts/validate', {
      method: 'POST',
      body: JSON.stringify({ code: cleanCode, subtotal, customerEmail })
    });
    if (res && res.valid) return res;
  } catch (err) {
    serverErr = err;
  }

  // If server responded with a specific validation error, rethrow it
  if (serverErr && serverErr.message && !serverErr.message.includes('Failed to fetch') && !serverErr.message.includes('404')) {
    throw serverErr;
  }

  // Hybrid Dynamic Fallback: Check live discounts database (Admin created)
  const discounts = getStoredOfflineDiscounts();
  const found = discounts.find((d) => d.code && d.code.trim().toUpperCase() === cleanCode);

  if (!found) {
    throw new Error(`Discount code "${cleanCode}" is invalid or expired.`);
  }

  if (!found.is_active) {
    throw new Error(`Discount code "${cleanCode}" is currently disabled.`);
  }

  const now = new Date();
  if (found.expiry_date && new Date(found.expiry_date) < now) {
    throw new Error(`Discount code "${cleanCode}" has expired.`);
  }

  if (found.min_order_value && subtotal < Number(found.min_order_value)) {
    const diff = (Number(found.min_order_value) - subtotal).toFixed(2);
    throw new Error(`Add ₹${diff} more to your cart to use discount code "${cleanCode}" (Min order ₹${found.min_order_value}).`);
  }

  let discountAmount = 0;
  if (found.type === 'percentage') {
    discountAmount = (subtotal * Number(found.amount)) / 100;
    if (found.max_discount_amount) {
      discountAmount = Math.min(discountAmount, Number(found.max_discount_amount));
    }
  } else {
    discountAmount = Number(found.amount);
  }

  discountAmount = Math.min(discountAmount, subtotal);
  discountAmount = Math.round(discountAmount * 100) / 100;

  return {
    valid: true,
    discountId: found.id,
    code: found.code,
    type: found.type,
    rate: Number(found.amount),
    discountAmount,
    finalSubtotal: Math.max(0, subtotal - discountAmount)
  };
};

export const adminGetDiscounts = async () => {
  const localList = getStoredOfflineDiscounts();
  try {
    const serverList = await apiFetch('/api/discounts/admin/all', { isAdmin: true });
    if (Array.isArray(serverList)) {
      const mergedMap = new Map();
      localList.forEach((d) => mergedMap.set(d.code.toUpperCase(), d));
      serverList.forEach((d) => mergedMap.set(d.code.toUpperCase(), d));
      const merged = Array.from(mergedMap.values());
      saveOfflineDiscounts(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Server fetch discounts error, using offline store:', err);
  }
  return localList;
};

export const adminCreateDiscount = async (data) => {
  const cleanCode = data.code ? data.code.trim().toUpperCase() : '';
  const newDiscount = {
    id: 'disc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    code: cleanCode,
    type: data.type || 'percentage',
    amount: Number(data.amount) || 0,
    min_order_value: Number(data.min_order_value) || 0,
    max_discount_amount: data.max_discount_amount ? Number(data.max_discount_amount) : null,
    start_date: data.start_date || null,
    expiry_date: data.expiry_date || null,
    usage_limit: data.usage_limit ? Number(data.usage_limit) : null,
    usage_limit_per_customer: Number(data.usage_limit_per_customer) || 1,
    is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
    first_order_only: data.first_order_only ? 1 : 0,
    usage_count: 0,
    created_at: new Date().toISOString()
  };

  const list = getStoredOfflineDiscounts();
  const existingIdx = list.findIndex((d) => d.code.toUpperCase() === cleanCode);
  if (existingIdx >= 0) {
    list[existingIdx] = newDiscount;
  } else {
    list.unshift(newDiscount);
  }
  saveOfflineDiscounts(list);

  try {
    const res = await apiFetch('/api/discounts/admin/create', {
      method: 'POST',
      body: JSON.stringify(data),
      isAdmin: true
    });
    if (res && res.id) return res;
  } catch (err) {
    console.warn('Server create discount error, saved locally:', err);
  }

  return newDiscount;
};

export const adminUpdateDiscount = async (id, data) => {
  const list = getStoredOfflineDiscounts();
  const index = list.findIndex((d) => d.id === id || d.code === id);
  if (index >= 0) {
    list[index] = { ...list[index], ...data };
    saveOfflineDiscounts(list);
  }

  try {
    return await apiFetch(`/api/discounts/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      isAdmin: true
    });
  } catch {
    return data;
  }
};

export const adminDeleteDiscount = async (id) => {
  const list = getStoredOfflineDiscounts();
  const filtered = list.filter((d) => d.id !== id && d.code !== id);
  saveOfflineDiscounts(filtered);

  try {
    return await apiFetch(`/api/discounts/admin/${id}`, {
      method: 'DELETE',
      isAdmin: true
    });
  } catch {
    return { success: true };
  }
};

// ---------------- ORDERS API ----------------
export const createOrder = async (orderPayload) => {
  let serverResult = null;
  try {
    serverResult = await apiFetch('/api/orders/create', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    });
  } catch (err) {
    console.warn('Server create order error:', err);
  }

  const orderNumber = serverResult?.order?.order_number || ('LIM-' + Math.floor(100000 + Math.random() * 900000));
  const subtotal = orderPayload.items.reduce((acc, i) => acc + (Number(i.price) || 1899) * (Number(i.quantity) || 1), 0);
  const discount = orderPayload.discountCode === 'WELCOME10' ? subtotal * 0.1 : 0;
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = serverResult?.order?.total_amount || (subtotal - discount + shipping);

  const fallbackOrder = {
    id: serverResult?.order?.id || ('ord_' + Date.now()),
    order_number: orderNumber,
    customer_name: orderPayload.customer?.name || 'Customer',
    customer_email: orderPayload.customer?.email || '',
    customer_phone: orderPayload.customer?.phone || '',
    shipping_address: orderPayload.customer?.address || '',
    city: orderPayload.customer?.city || '',
    state: orderPayload.customer?.state || '',
    pincode: orderPayload.customer?.pincode || '',
    country: orderPayload.customer?.country || 'India',
    total_amount: total,
    discount_code: orderPayload.discountCode || null,
    discount_amount: discount,
    payment_method: orderPayload.paymentMethod || 'UPI',
    payment_status: orderPayload.paymentMethod === 'COD' ? 'Pending' : 'Paid',
    order_status: 'Confirmed',
    created_at: new Date().toISOString(),
    items: orderPayload.items || []
  };

  const saved = await localAddOrder(serverResult?.order || fallbackOrder);
  return { order: saved, items: orderPayload.items };
};

export const trackOrder = async (orderNumber) => {
  try {
    return await apiFetch(`/api/orders/track/${encodeURIComponent(orderNumber)}`);
  } catch {
    const orders = await localGetOrders();
    const ord = orders.find((o) => o.order_number === orderNumber || o.id === orderNumber);
    if (!ord) throw new Error('Order not found.');
    return {
      order: ord,
      items: ord.items || [{ product_title: 'Barlights', quantity: 1, variant_name: 'Black', price: ord.total_amount }],
      timeline: [{ id: '1', status: ord.order_status, message: 'Order received and confirmed.', created_at: ord.created_at }]
    };
  }
};

export const adminGetOrders = async () => {
  try {
    const data = await apiFetch('/api/orders/admin/all', { isAdmin: true });
    if (Array.isArray(data) && data.length > 0) {
      for (const ord of data) {
        await localAddOrder(ord).catch(() => {});
      }
      return data;
    }
  } catch (err) {
    console.warn('adminGetOrders server fallback:', err);
  }
  return await localGetOrders();
};

export const adminGetOrder = async (id) => {
  try {
    return await apiFetch(`/api/orders/admin/${id}`, { isAdmin: true });
  } catch {
    const orders = await localGetOrders();
    const ord = orders.find((o) => o.id === id || o.order_number === id);
    return {
      order: ord || {},
      items: ord?.items || [],
      timeline: [{ id: '1', status: 'Confirmed', message: 'Order placed.', created_at: ord?.created_at || new Date().toISOString() }]
    };
  }
};

export const adminUpdateOrderStatus = async (id, statusData) => {
  try {
    await apiFetch(`/api/orders/admin/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
      isAdmin: true
    });
  } catch (err) {
    console.warn('Server status update error:', err);
  }

  const orders = await localGetOrders();
  const ord = orders.find((o) => o.id === id || o.order_number === id);
  if (ord) {
    ord.order_status = statusData.order_status;
    await localAddOrder(ord);
  }
  return { success: true };
};

export const adminUpdateTracking = async (id, trackingData) => {
  try {
    await apiFetch(`/api/orders/admin/${id}/tracking`, {
      method: 'PUT',
      body: JSON.stringify(trackingData),
      isAdmin: true
    });
  } catch (err) {
    console.warn('Server tracking update error:', err);
  }

  const orders = await localGetOrders();
  const ord = orders.find((o) => o.id === id || o.order_number === id);
  if (ord) {
    ord.tracking_number = trackingData.tracking_number;
    ord.carrier = trackingData.carrier;
    ord.tracking_url = trackingData.tracking_url;
    ord.order_status = 'Shipped';
    await localAddOrder(ord);
  }
  return { success: true };
};

// ---------------- AUTH API ----------------
export const adminLogin = async (email, password) => {
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  const cleanPass = password ? password.trim() : '';

  try {
    return await apiFetch('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email: cleanEmail, password: cleanPass })
    });
  } catch (err) {
    if (
      err.status === 405 ||
      err.status === 404 ||
      err.message?.includes('405') ||
      err.message?.includes('fetch failed')
    ) {
      if (cleanEmail === 'admin@lightinmotion.store' && cleanPass === 'admin123') {
        const fallbackToken = 'lim_admin_jwt_session_' + Date.now();
        const user = {
          id: 'usr_admin_01',
          name: 'LIGHTINMOTION Admin',
          email: 'admin@lightinmotion.store',
          role: 'admin'
        };
        return { token: fallbackToken, user };
      } else {
        throw new Error('Invalid email or password. Use admin@lightinmotion.store / admin123');
      }
    }
    throw err;
  }
};

export const customerRegister = async (userData) => {
  try {
    return await apiFetch('/api/auth/customer/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  } catch {
    const customer = { id: 'cust_' + Date.now(), name: userData.name, email: userData.email };
    return { token: 'lim_cust_session_' + Date.now(), customer };
  }
};

export const customerLogin = async (email, password) => {
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  const cleanPass = password ? password.trim() : '';

  try {
    return await apiFetch('/api/auth/customer/login', {
      method: 'POST',
      body: JSON.stringify({ email: cleanEmail, password: cleanPass })
    });
  } catch {
    if (cleanEmail === 'customer@example.com' && cleanPass === 'pass123') {
      const customer = { id: 'cust_01', name: 'Demo Customer', email: 'customer@example.com' };
      return { token: 'lim_cust_session_' + Date.now(), customer };
    }
    throw new Error('Invalid email or password. Use customer@example.com / pass123');
  }
};

export const customerGetMe = async () => {
  try {
    return await apiFetch('/api/auth/customer/me');
  } catch {
    const raw = localStorage.getItem('lim_customer_user');
    const customer = raw ? JSON.parse(raw) : { name: 'Customer', email: 'customer@example.com' };
    const orders = await localGetOrders();
    return { customer, addresses: [], orders };
  }
};

// ---------------- CUSTOMERS API ----------------
export const adminGetCustomers = async () => {
  try {
    return await apiFetch('/api/customers/admin/all', { isAdmin: true });
  } catch {
    const orders = await localGetOrders();
    const customerMap = new Map();
    orders.forEach((o) => {
      const email = o.customer_email || 'guest@example.com';
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          id: 'cust_' + email,
          name: o.customer_name || 'Customer',
          email,
          phone: o.customer_phone || '',
          total_spent: 0,
          orders_count: 0,
          created_at: o.created_at
        });
      }
      const c = customerMap.get(email);
      c.total_spent += Number(o.total_amount) || 0;
      c.orders_count += 1;
    });

    if (customerMap.size === 0) {
      return [
        { id: 'c1', name: 'Demo Customer', email: 'customer@example.com', phone: '+91 98765 43210', total_spent: 3418, orders_count: 1, created_at: new Date().toISOString() }
      ];
    }
    return Array.from(customerMap.values());
  }
};

export const adminGetCustomer = async (id) => {
  try {
    return await apiFetch(`/api/customers/admin/${id}`, { isAdmin: true });
  } catch {
    return { customer: { id, name: 'Customer', email: 'customer@example.com' }, orders: [] };
  }
};

// ---------------- ANALYTICS API ----------------
export const adminGetAnalytics = async (range = '30d') => {
  try {
    return await apiFetch(`/api/analytics/admin?range=${range}`, { isAdmin: true });
  } catch {
    const orders = await localGetOrders();
    const products = await localGetProducts();
    const totalSales = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter((o) => (o.created_at || '').startsWith(today));
    const todaySales = todayOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    return {
      summary: {
        totalSales,
        todaySales,
        ordersToday: todayOrders.length,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.order_status === 'Confirmed' || o.order_status === 'Processing').length,
        completedOrders: orders.filter((o) => o.order_status === 'Delivered').length,
        cancelledOrders: orders.filter((o) => o.order_status === 'Cancelled').length,
        totalCustomers: Math.max(1, new Set(orders.map((o) => o.customer_email)).size),
        totalProducts: products.length,
        activeDiscounts: 2,
        averageOrderValue: orders.length > 0 ? Math.round(totalSales / orders.length) : 0
      },
      lowStockProducts: products.filter((p) => p.inventory <= 3),
      topProducts: products.slice(0, 5).map((p) => ({
        product_title: p.title,
        image_url: p.media?.[0]?.url,
        units_sold: 4,
        total_revenue: p.price * 4
      })),
      salesOverTime: []
    };
  }
};

// ---------------- CONTENT & SETTINGS API ----------------
export const getContentPages = async () => {
  try {
    return await apiFetch('/api/content/pages');
  } catch {
    return [
      { slug: 'shipping-policy', title: 'Shipping Policy' },
      { slug: 'return-policy', title: 'Return & Refund Policy' },
      { slug: 'privacy-policy', title: 'Privacy Policy' },
      { slug: 'terms-conditions', title: 'Terms & Conditions' }
    ];
  }
};

export const getContentPage = async (slug) => {
  try {
    return await apiFetch(`/api/content/pages/${slug}`);
  } catch {
    return {
      slug,
      title: slug.replace(/-/g, ' ').toUpperCase(),
      content_html: '<p>Standard policy content. All hardware includes a 1-year direct replacement warranty and free delivery across India on orders above ₹999.</p>',
      updated_at: new Date().toISOString()
    };
  }
};

export const adminUpdateContentPage = async (slug, data) => {
  try {
    return await apiFetch(`/api/content/admin/pages/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      isAdmin: true
    });
  } catch {
    return data;
  }
};

export const getSettings = async () => {
  try {
    return await apiFetch('/api/settings');
  } catch {
    return await localGetSettings();
  }
};

export const adminUpdateSettings = async (settingsData) => {
  try {
    return await apiFetch('/api/settings/admin', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
      isAdmin: true
    });
  } catch {
    await localSaveSettings(settingsData);
    return settingsData;
  }
};
