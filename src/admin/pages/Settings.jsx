// src/admin/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { getSettings, adminUpdateSettings } from '../../api';
import { Settings as SettingsIcon, Save, Truck, DollarSign, Mail } from 'lucide-react';

export default function Settings() {
  const [general, setGeneral] = useState({
    storeName: 'LIGHTINMOTION',
    supportEmail: 'support@lightinmotion.store',
    phone: '+91 98765 43210',
    currency: 'INR',
    currencySymbol: '₹'
  });

  const [shipping, setShipping] = useState({
    freeShippingThreshold: 999,
    standardShippingCharge: 99,
    dispatchHub: 'Baddi Fulfillment Center, Himachal Pradesh'
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      if (s.general) setGeneral(s.general);
      if (s.shipping) setShipping(s.shipping);
    }).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUpdateSettings({
        general,
        shipping
      });
      alert('Store settings saved successfully!');
    } catch (err) {
      alert(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 className="admin-page-title">Store Settings</h1>
          <p className="admin-page-subtitle">Configure store contact details, shipping rules, and fulfillment policies.</p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="admin-btn-primary"
        >
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="admin-card">
          <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SettingsIcon size={18} color="#008060" />
            <span>Store Details</span>
          </h3>

          <div className="admin-form-group">
            <label className="admin-label">Store Name</label>
            <input
              type="text"
              value={general.storeName}
              onChange={(e) => setGeneral({ ...general, storeName: e.target.value })}
              className="admin-input"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Support Email</label>
            <input
              type="email"
              value={general.supportEmail}
              onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
              className="admin-input"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Support Phone</label>
            <input
              type="text"
              value={general.phone}
              onChange={(e) => setGeneral({ ...general, phone: e.target.value })}
              className="admin-input"
            />
          </div>
        </div>

        <div className="admin-card">
          <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={18} color="#008060" />
            <span>Shipping & Delivery Rules</span>
          </h3>

          <div className="admin-form-group">
            <label className="admin-label">Free Shipping Threshold (₹)</label>
            <input
              type="number"
              value={shipping.freeShippingThreshold}
              onChange={(e) => setShipping({ ...shipping, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
              className="admin-input"
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Orders equal to or exceeding this subtotal qualify for free shipping.</span>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Standard Shipping Charge (₹)</label>
            <input
              type="number"
              value={shipping.standardShippingCharge}
              onChange={(e) => setShipping({ ...shipping, standardShippingCharge: parseFloat(e.target.value) || 0 })}
              className="admin-input"
            />
          </div>

          <div className="admin-form-group" style={{ margin: 0 }}>
            <label className="admin-label">Fulfillment Center Location</label>
            <input
              type="text"
              value={shipping.dispatchHub}
              onChange={(e) => setShipping({ ...shipping, dispatchHub: e.target.value })}
              className="admin-input"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
