// src/admin/pages/DiscountForm.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminCreateDiscount } from '../../api';
import { ArrowLeft, Save, Tag } from 'lucide-react';

export default function DiscountForm() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    amount: '',
    min_order_value: '0',
    max_discount_amount: '',
    expiry_date: '',
    usage_limit: '',
    usage_limit_per_customer: '1',
    is_active: true,
    first_order_only: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminCreateDiscount({
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        amount: parseFloat(formData.amount) || 0,
        min_order_value: parseFloat(formData.min_order_value) || 0,
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
        expiry_date: formData.expiry_date || null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        usage_limit_per_customer: parseInt(formData.usage_limit_per_customer) || 1,
        is_active: formData.is_active,
        first_order_only: formData.first_order_only
      });
      navigate('/admin/discounts');
    } catch (err) {
      alert(err.message || 'Failed to create discount.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/admin/discounts" className="admin-btn-secondary" style={{ padding: '8px' }}>
            <ArrowLeft size={16} />
          </Link>
          <h1 className="admin-page-title">Create Discount Code</h1>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="admin-btn-primary"
        >
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save discount'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div>
          <div className="admin-card">
            <div className="admin-form-group">
              <label className="admin-label">Discount Code *</label>
              <input
                type="text"
                required
                name="code"
                placeholder="e.g. FLASH20"
                value={formData.code}
                onChange={handleInputChange}
                className="admin-input"
                style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Customers will enter this code at checkout.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="admin-select"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Value *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  name="amount"
                  placeholder={formData.type === 'percentage' ? '15' : '300'}
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="admin-input"
                />
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="admin-card-title">Minimum Requirements</h3>
            <div className="admin-form-group">
              <label className="admin-label">Minimum Order Value (₹)</label>
              <input
                type="number"
                name="min_order_value"
                value={formData.min_order_value}
                onChange={handleInputChange}
                placeholder="0"
                className="admin-input"
              />
            </div>

            {formData.type === 'percentage' && (
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label className="admin-label">Maximum Discount Cap (₹, optional)</label>
                <input
                  type="number"
                  name="max_discount_amount"
                  value={formData.max_discount_amount}
                  onChange={handleInputChange}
                  placeholder="e.g. 500"
                  className="admin-input"
                />
              </div>
            )}
          </div>

          <div className="admin-card">
            <h3 className="admin-card-title">Usage Limits</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Total Global Usage Limit</label>
                <input
                  type="number"
                  name="usage_limit"
                  placeholder="Unlimited"
                  value={formData.usage_limit}
                  onChange={handleInputChange}
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Limit per Customer</label>
                <input
                  type="number"
                  name="usage_limit_per_customer"
                  value={formData.usage_limit_per_customer}
                  onChange={handleInputChange}
                  className="admin-input"
                />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="first_order_only"
                checked={formData.first_order_only}
                onChange={handleInputChange}
              />
              <span>Valid only for customer's first order</span>
            </label>
          </div>
        </div>

        <div>
          <div className="admin-card">
            <h3 className="admin-card-title">Active Status</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '14px' }}>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
              />
              <span>Discount is active</span>
            </label>

            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-label">Expiry Date</label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleInputChange}
                className="admin-input"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
