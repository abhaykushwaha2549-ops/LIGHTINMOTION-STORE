// src/admin/pages/OrdersList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminGetOrders } from '../../api';
import { Search, ShoppingBag, Eye, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await adminGetOrders();
        setOrders(data || []);
      } catch (err) {
        console.error('Fetch admin orders error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = orders.filter((ord) => {
    const matchesStatus = statusFilter === 'ALL' || ord.order_status?.toUpperCase() === statusFilter;
    const matchesSearch =
      ord.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      ord.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      ord.customer_email?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <span style={{ background: '#e6f4ea', color: '#137333', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>Delivered</span>;
      case 'Shipped':
        return <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>Shipped</span>;
      case 'Processing':
        return <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>Processing</span>;
      case 'Cancelled':
      case 'Refunded':
        return <span style={{ background: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>{status}</span>;
      default:
        return <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>{status || 'Confirmed'}</span>;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 className="admin-page-title">Orders ({orders.length})</h1>
        <p className="admin-page-subtitle">Track customer purchases, fulfillment workflows, and shipment dispatch.</p>
      </div>

      <div className="admin-card">
        {/* Filter and Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: '10px', left: '12px' }} />
            <input
              type="text"
              placeholder="Search by order #, customer name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input"
              style={{ paddingLeft: '36px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  background: statusFilter === st ? '#008060' : '#f1f5f9',
                  color: statusFilter === st ? '#ffffff' : '#475569',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No orders found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Total</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ord) => (
                <tr key={ord.id}>
                  <td>
                    <Link to={`/admin/orders/${ord.id}`} style={{ fontWeight: '700', color: '#008060', fontFamily: 'var(--font-mono)' }}>
                      {ord.order_number}
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ord.items?.length || 1} items</div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                    {new Date(ord.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{ord.customer_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ord.customer_email}</div>
                  </td>
                  <td>
                    <span style={{
                      background: ord.payment_status === 'Paid' ? '#e6f4ea' : '#fef3c7',
                      color: ord.payment_status === 'Paid' ? '#137333' : '#92400e',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '800'
                    }}>
                      {ord.payment_method} • {ord.payment_status}
                    </span>
                  </td>
                  <td>{getStatusBadge(ord.order_status)}</td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>₹{Number(ord.total_amount).toLocaleString('en-IN')}.00</strong>
                    {ord.discount_amount > 0 && (
                      <div style={{ fontSize: '0.7rem', color: '#0369a1' }}>Code: {ord.discount_code}</div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link
                      to={`/admin/orders/${ord.id}`}
                      className="admin-btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.75rem', gap: '4px' }}
                    >
                      <Eye size={13} />
                      <span>Manage</span>
                    </Link>
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
