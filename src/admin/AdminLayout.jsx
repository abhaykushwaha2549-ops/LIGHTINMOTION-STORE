// src/admin/AdminLayout.jsx
import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  Package,
  Users,
  Percent,
  FileText,
  BarChart3,
  Settings as SettingsIcon,
  Globe,
  ExternalLink,
  Search,
  LogOut,
  Sparkles
} from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem('lim_admin_token');

  // Guard: Protect admin routes
  useEffect(() => {
    if (!token && location.pathname !== '/admin/login') {
      navigate('/admin/login');
    }
  }, [token, location.pathname, navigate]);

  if (!token) return null;

  const handleLogout = () => {
    localStorage.removeItem('lim_admin_token');
    localStorage.removeItem('lim_admin_user');
    navigate('/admin/login');
  };

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { label: 'Home', icon: Home, path: '/admin' },
    { label: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
    { label: 'Products', icon: Package, path: '/admin/products' },
    { label: 'Customers', icon: Users, path: '/admin/customers' },
    { label: 'Discounts', icon: Percent, path: '/admin/discounts' },
    { label: 'Content', icon: FileText, path: '/admin/content' },
    { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { label: 'Store Settings', icon: SettingsIcon, path: '/admin/settings' },
  ];

  return (
    <div className="admin-wrapper">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <Sparkles size={16} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: '800', letterSpacing: '0.04em' }}>shopify</span>
            <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>LIGHTINMOTION</span>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${active ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ padding: '0 12px 8px', fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
              Sales Channels
            </div>
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="admin-nav-item"
              style={{ color: '#38bdf8' }}
            >
              <Globe size={18} />
              <span>Online Store</span>
              <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
            </Link>

            <button
              onClick={handleLogout}
              className="admin-nav-item"
              style={{ width: '100%', background: 'transparent', border: 'none', color: '#ef4444', textAlign: 'left', cursor: 'pointer', marginTop: '4px' }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="admin-content-area">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-search-box">
            <Search size={16} color="#64748b" />
            <input type="text" placeholder="Search orders, products, customers..." />
            <kbd style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: '#64748b', fontWeight: '600' }}>
              CTRL K
            </kbd>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link
              to="/"
              target="_blank"
              style={{
                background: '#f1f5f9',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                padding: '6px 14px',
                fontSize: '0.8rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '600'
              }}
            >
              <Globe size={14} />
              <span>View Store</span>
            </Link>

            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#008060',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '13px'
            }}>
              LM
            </div>
          </div>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
