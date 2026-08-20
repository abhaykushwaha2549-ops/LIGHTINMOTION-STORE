// src/admin/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { getSettings, adminUpdateSettings } from '../../api';
import { Settings as SettingsIcon, Save, Truck, DollarSign, Mail, CreditCard, ShieldCheck } from 'lucide-react';

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

  const [payment, setPayment] = useState({
    razorpayKeyId: 'rzp_test_lightinmotion',
    razorpayKeySecret: '••••••••••••••••',
    merchantUpiVpa: 'lightinmotion@upi',
    enableUpi: true,
    enableQr: true,
    enableCards: true,
    enableCod: true
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      if (s.general) setGeneral(s.general);
      if (s.shipping) setShipping(s.shipping);
      if (s.payment) setPayment(s.payment);
    }).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUpdateSettings({
        general,
        shipping,
        payment
      });
      alert('Store settings & payment gateway configuration saved successfully!');
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
          <p className="admin-page-subtitle">Configure store contact details, Razorpay payment gateway, Merchant UPI VPA, shipping rules, and fulfillment policies.</p>
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

        {/* Razorpay & Merchant UPI Gateway Settings */}
        <div className="admin-card" style={{ gridColumn: 'span 2' }}>
          <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} color="#2563eb" />
            <span>Merchant Payment Gateway Configuration (UPI, GPay, Razorpay Keys)</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-label">Merchant Bank UPI VPA / ID</label>
              <input
                type="text"
                value={payment.merchantUpiVpa}
                onChange={(e) => setPayment({ ...payment, merchantUpiVpa: e.target.value })}
                placeholder="yourname@okaxis or bank@upi"
                className="admin-input"
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Your registered GPay/Paytm UPI ID to receive direct money in your bank.</span>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Razorpay Key ID</label>
              <input
                type="text"
                value={payment.razorpayKeyId}
                onChange={(e) => setPayment({ ...payment, razorpayKeyId: e.target.value })}
                placeholder="rzp_live_..."
                className="admin-input"
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Public Key ID for client-side Razorpay modal.</span>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Razorpay Key Secret</label>
              <input
                type="password"
                value={payment.razorpayKeySecret}
                onChange={(e) => setPayment({ ...payment, razorpayKeySecret: e.target.value })}
                placeholder="Key Secret"
                className="admin-input"
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Used for server-side HMAC SHA-256 bank verification.</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid #e5e7eb' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={payment.enableUpi}
                onChange={(e) => setPayment({ ...payment, enableUpi: e.target.checked })}
              />
              <span>UPI Apps (GPay, PhonePe, Paytm)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={payment.enableQr}
                onChange={(e) => setPayment({ ...payment, enableQr: e.target.checked })}
              />
              <span>Instant QR Code</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={payment.enableCards}
                onChange={(e) => setPayment({ ...payment, enableCards: e.target.checked })}
              />
              <span>Credit / Debit Cards</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={payment.enableCod}
                onChange={(e) => setPayment({ ...payment, enableCod: e.target.checked })}
              />
              <span>Cash on Delivery (COD)</span>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
