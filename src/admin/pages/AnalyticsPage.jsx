// src/admin/pages/AnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import { adminGetAnalytics } from '../../api';
import { BarChart3, TrendingUp, ShoppingBag, DollarSign, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await adminGetAnalytics(timeRange);
        setData(res);
      } catch (err) {
        console.error('Fetch analytics error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [timeRange]);

  if (loading) {
    return <div style={{ padding: '40px', color: '#64748b' }}>Calculating database analytics...</div>;
  }

  const { summary = {}, salesOverTime = [], topProducts = [] } = data || {};

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 className="admin-page-title">Analytics & Financial Reports</h1>
          <p className="admin-page-subtitle">Real-time aggregations calculated directly from database transaction logs.</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['7d', '30d', '90d'].map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              style={{
                background: timeRange === r ? '#008060' : '#ffffff',
                color: timeRange === r ? '#ffffff' : '#0f172a',
                border: '1px solid #cbd5e1',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="admin-card" style={{ margin: 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Gross Sales</div>
          <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>
            ₹{Number(summary.totalSales || 0).toLocaleString('en-IN')}.00
          </div>
          <div style={{ fontSize: '0.75rem', color: '#008060', fontWeight: '600' }}>Excludes cancelled/refunded</div>
        </div>

        <div className="admin-card" style={{ margin: 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Orders</div>
          <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>
            {summary.totalOrders || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{summary.completedOrders || 0} completed</div>
        </div>

        <div className="admin-card" style={{ margin: 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Average Order Value</div>
          <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>
            ₹{Number(summary.averageOrderValue || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Per successful checkout</div>
        </div>

        <div className="admin-card" style={{ margin: 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Customers</div>
          <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>
            {summary.totalCustomers || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Registered buyers</div>
        </div>
      </div>

      {/* Sales Table / Chart */}
      <div className="admin-card">
        <h3 className="admin-card-title">Daily Sales Trend</h3>
        {salesOverTime.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No transactions recorded in this date range.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Orders Count</th>
                <th style={{ textAlign: 'right' }}>Revenue Generated</th>
              </tr>
            </thead>
            <tbody>
              {salesOverTime.map((d, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: '600', color: '#0f172a' }}>{d.date}</td>
                  <td>{d.order_count} orders</td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: '#008060' }}>
                    ₹{Number(d.revenue).toLocaleString('en-IN')}.00
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
