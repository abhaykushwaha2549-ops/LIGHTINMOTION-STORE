// src/admin/pages/DashboardHome.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminGetAnalytics } from '../../api';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Plus,
  AlertTriangle,
  Users,
  Percent,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function DashboardHome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await adminGetAnalytics('30d');
        setData(res);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', color: '#64748b' }}>Loading dashboard analytics...</div>;
  }

  const { summary = {}, lowStockProducts = [], topProducts = [], salesOverTime = [] } = data || {};

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: '#0f172a',
        color: '#ffffff',
        borderRadius: '10px',
        padding: '24px 28px',
        marginBottom: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ background: '#008060', color: '#fff', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>
              LIVE STORE
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>LIGHTINMOTION Operations</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 4px', color: '#fff' }}>
            Real-Time Merchant Dashboard
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: 0 }}>
            Every stat, stock level, and order is connected directly to your server database.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            to="/admin/products/new"
            style={{
              background: '#008060',
              color: '#ffffff',
              padding: '9px 16px',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} />
            <span>Add Product</span>
          </Link>

          <Link
            to="/admin/discounts/new"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '9px 16px',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Percent size={15} />
            <span>Create Discount</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className="admin-card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Total Revenue</span>
            <TrendingUp size={18} color="#008060" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a' }}>
            ₹{Number(summary.totalSales || 0).toLocaleString('en-IN')}.00
          </div>
          <div style={{ fontSize: '0.75rem', color: '#008060', marginTop: '4px', fontWeight: '600' }}>
            Today: ₹{Number(summary.todaySales || 0).toLocaleString('en-IN')}.00
          </div>
        </div>

        <div className="admin-card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Total Orders</span>
            <ShoppingBag size={18} color="#2563eb" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a' }}>
            {summary.totalOrders || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            {summary.ordersToday || 0} orders today • {summary.pendingOrders || 0} pending
          </div>
        </div>

        <div className="admin-card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Active Products</span>
            <Package size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a' }}>
            {summary.totalProducts || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            <Link to="/admin/products" style={{ color: '#8b5cf6', fontWeight: '600' }}>Manage catalog →</Link>
          </div>
        </div>

        <div className="admin-card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Active Discounts</span>
            <Percent size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a' }}>
            {summary.activeDiscounts || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            <Link to="/admin/discounts" style={{ color: '#f59e0b', fontWeight: '600' }}>View codes →</Link>
          </div>
        </div>
      </div>

      {/* Grid: Low Stock Warnings & Top Selling Products */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Low Stock Alerts */}
        <div className="admin-card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 className="admin-card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626' }}>
              <AlertTriangle size={16} />
              <span>Low-Stock Inventory Alerts</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Threshold: ≤3 units</span>
          </div>

          {lowStockProducts.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#16a34a', fontSize: '0.85rem' }}>
              ✓ All products have healthy inventory levels.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lowStockProducts.map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#991b1b' }}>{p.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>SKU: {p.sku || 'N/A'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: '#dc2626', color: '#fff', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px' }}>
                      {p.inventory} left
                    </span>
                    <Link to={`/admin/products/edit/${p.id}`} style={{ fontSize: '0.75rem', color: '#008060', fontWeight: '700' }}>
                      Restock
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="admin-card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 className="admin-card-title" style={{ margin: 0 }}>Top Selling Products</h3>
            <Link to="/admin/analytics" style={{ fontSize: '0.75rem', color: '#008060', fontWeight: '700' }}>Full report</Link>
          </div>

          {topProducts.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              No purchase data recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topProducts.map((tp, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: '#f8fafc', borderRadius: '6px' }}>
                  <img src={tp.image_url || 'https://via.placeholder.com/40'} alt={tp.product_title} style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{tp.product_title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{tp.units_sold} units sold</div>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>
                    ₹{Number(tp.total_revenue).toLocaleString('en-IN')}.00
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
