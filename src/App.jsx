// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { getSettings } from './api';
import { CartProvider } from './context/CartContext';

// Storefront Components & Pages
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import TrackOrder from './pages/TrackOrder';
import PolicyPage from './pages/PolicyPage';

// Shopify-style Admin Components & Pages
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/pages/AdminLogin';
import DashboardHome from './admin/pages/DashboardHome';
import ProductsList from './admin/pages/ProductsList';
import ProductForm from './admin/pages/ProductForm';
import OrdersList from './admin/pages/OrdersList';
import OrderDetail from './admin/pages/OrderDetail';
import DiscountsList from './admin/pages/DiscountsList';
import DiscountForm from './admin/pages/DiscountForm';
import CustomersList from './admin/pages/CustomersList';
import ContentManager from './admin/pages/ContentManager';
import AnalyticsPage from './admin/pages/AnalyticsPage';
import Settings from './admin/pages/Settings';

export default function App() {
  const [settings, setSettings] = useState(null);
  const location = useLocation();

  useEffect(() => {
    getSettings().then((s) => setSettings(s)).catch(() => {});
  }, [location.pathname]);

  // Check if current route is part of the Admin dashboard
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <CartProvider>
      {/* If visiting Storefront */}
      {!isAdmin ? (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header settings={settings} />
          <CartDrawer />
          
          <main style={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/account" element={<Account />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/page/:slug" element={<PolicyPage />} />
            </Routes>
          </main>

          <Footer settings={settings} />
        </div>
      ) : (
        /* If visiting Shopify Admin Panel */
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="products" element={<ProductsList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/edit/:id" element={<ProductForm />} />
            <Route path="orders" element={<OrdersList />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="discounts" element={<DiscountsList />} />
            <Route path="discounts/new" element={<DiscountForm />} />
            <Route path="customers" element={<CustomersList />} />
            <Route path="content" element={<ContentManager />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      )}
    </CartProvider>
  );
}
