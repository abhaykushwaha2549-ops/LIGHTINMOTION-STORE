// src/admin/pages/DiscountsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminGetDiscounts, adminDeleteDiscount } from '../../api';
import { Plus, Tag, Trash2, Edit2, Percent, CheckCircle, XCircle } from 'lucide-react';

export default function DiscountsList() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminGetDiscounts();
      setDiscounts(data || []);
    } catch (err) {
      console.error('Fetch discounts error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id, code) => {
    if (window.confirm(`Delete discount code "${code}"?`)) {
      try {
        await adminDeleteDiscount(id);
        loadData();
      } catch (err) {
        alert(err.message || 'Failed to delete discount.');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 className="admin-page-title">Discounts ({discounts.length})</h1>
          <p className="admin-page-subtitle">Configure coupon codes with server-side validation rules and usage limits.</p>
        </div>

        <Link
          to="/admin/discounts/new"
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
          <span>Create discount</span>
        </Link>
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading discount codes...</div>
        ) : discounts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No discounts found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Status</th>
                <th>Type & Value</th>
                <th>Min Order</th>
                <th>Usage Count</th>
                <th>Expiry</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div style={{ fontWeight: '800', color: '#008060', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
                      {d.code}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      background: d.is_active ? '#e6f4ea' : '#fee2e2',
                      color: d.is_active ? '#137333' : '#991b1b',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      {d.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>
                      {d.type === 'percentage' ? `${d.amount}% OFF` : `₹${d.amount}.00 OFF`}
                    </strong>
                    {d.max_discount_amount && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Cap: ₹{d.max_discount_amount}</div>
                    )}
                  </td>
                  <td>
                    {d.min_order_value > 0 ? `₹${d.min_order_value}` : 'No minimum'}
                  </td>
                  <td>
                    <span style={{ fontWeight: '700' }}>{d.usage_count}</span> {d.usage_limit ? `/ ${d.usage_limit}` : 'uses'}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {d.expiry_date ? new Date(d.expiry_date).toLocaleDateString() : 'No expiry'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(d.id, d.code)}
                      className="admin-btn-secondary"
                      style={{ padding: '6px 8px', color: '#dc2626' }}
                    >
                      <Trash2 size={14} />
                    </button>
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
