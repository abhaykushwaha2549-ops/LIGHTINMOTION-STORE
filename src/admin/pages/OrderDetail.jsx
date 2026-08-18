// src/admin/pages/OrderDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminGetOrder, adminUpdateOrderStatus, adminUpdateTracking } from '../../api';
import {
  ArrowLeft,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Mail,
  Phone,
  Package,
  AlertTriangle
} from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('BlueDart / Shiprocket');

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await adminGetOrder(id);
      setData(res);
      setNewStatus(res.order?.order_status || 'Confirmed');
      setTrackingNumber(res.order?.tracking_number || '');
    } catch (err) {
      console.error('Fetch order error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleStatusChange = async (e) => {
    e.preventDefault();
    setSavingStatus(true);
    try {
      await adminUpdateOrderStatus(id, {
        orderStatus: newStatus,
        paymentStatus: newStatus === 'Cancelled' ? 'Refunded' : data.order.payment_status,
        message: `Merchant manually updated status to ${newStatus}.`
      });
      alert(`Order status updated to ${newStatus}. ${newStatus === 'Cancelled' ? 'Product inventory has been automatically restored!' : ''}`);
      loadOrder();
    } catch (err) {
      alert(err.message || 'Failed to update order status.');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleTrackingSubmit = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    try {
      await adminUpdateTracking(id, { trackingNumber: trackingNumber.trim(), carrier });
      alert('Tracking information updated and order marked as Shipped.');
      loadOrder();
    } catch (err) {
      alert(err.message || 'Failed to update tracking number.');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', color: '#64748b' }}>Loading order details...</div>;
  }

  if (!data || !data.order) {
    return <div style={{ padding: '40px', color: '#dc2626' }}>Order not found.</div>;
  }

  const { order, items, timeline } = data;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/admin/orders" className="admin-btn-secondary" style={{ padding: '8px' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="admin-page-title" style={{ fontFamily: 'var(--font-mono)' }}>{order.order_number}</h1>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Placed on {new Date(order.created_at).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Left Column: Items, Pricing Breakdown, Timeline */}
        <div>
          {/* Order Items Card */}
          <div className="admin-card">
            <h3 className="admin-card-title">Order Items ({items.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {items.map((it) => (
                <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <img src={it.image_url || 'https://via.placeholder.com/50'} alt={it.product_title} style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>{it.product_title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SKU: {it.product_sku} • Variant: {it.variant_name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>₹{Number(it.price).toLocaleString('en-IN')}.00 × {it.quantity}</div>
                    <div style={{ fontSize: '0.85rem', color: '#008060', fontWeight: '800' }}>₹{Number(it.subtotal).toLocaleString('en-IN')}.00</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Subtotal</span>
                <span>₹{Number(order.subtotal).toLocaleString('en-IN')}.00</span>
              </div>

              {order.discount_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0369a1' }}>
                  <span>Discount Applied ({order.discount_code})</span>
                  <span>-₹{Number(order.discount_amount).toLocaleString('en-IN')}.00</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Shipping Charge</span>
                <span>{order.shipping_charge === 0 ? 'FREE' : `₹${order.shipping_charge}.00`}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '6px' }}>
                <span>Total Paid</span>
                <span>₹{Number(order.total_amount).toLocaleString('en-IN')}.00</span>
              </div>
            </div>
          </div>

          {/* Order Activity Timeline */}
          <div className="admin-card">
            <h3 className="admin-card-title">Order Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {timeline.map((evt) => (
                <div key={evt.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Clock size={13} color="#64748b" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#0f172a' }}>{evt.message}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{new Date(evt.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Status Management */}
        <div>
          {/* Status Updater Card */}
          <div className="admin-card">
            <h3 className="admin-card-title">Fulfillment Status</h3>
            <form onSubmit={handleStatusChange}>
              <div className="admin-form-group">
                <label className="admin-label">Order State</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="admin-select"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled (Auto-Restores Stock)</option>
                  <option value="Refunded">Refunded (Auto-Restores Stock)</option>
                </select>
              </div>

              {newStatus === 'Cancelled' && (
                <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: '4px', fontSize: '0.75rem', marginBottom: '14px' }}>
                  ⚠️ Marking this order as Cancelled will automatically restock {items.reduce((acc, i) => acc + i.quantity, 0)} units back to your product inventory.
                </div>
              )}

              <button
                type="submit"
                disabled={savingStatus}
                className="admin-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>{savingStatus ? 'Updating...' : 'Update Status'}</span>
              </button>
            </form>
          </div>

          {/* Shipping & Tracking Card */}
          <div className="admin-card">
            <h3 className="admin-card-title">Shipment Tracking</h3>
            <form onSubmit={handleTrackingSubmit}>
              <div className="admin-form-group">
                <label className="admin-label">Carrier</label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Tracking Number</label>
                <input
                  type="text"
                  placeholder="e.g. BD987654321IN"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="admin-input"
                />
              </div>

              <button
                type="submit"
                className="admin-btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>Save Tracking & Mark Shipped</span>
              </button>
            </form>
          </div>

          {/* Customer Details Card */}
          <div className="admin-card">
            <h3 className="admin-card-title">Customer Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: '700', color: '#0f172a' }}>{order.customer_name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                <Mail size={14} color="#64748b" />
                <span>{order.customer_email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                <Phone size={14} color="#64748b" />
                <span>{order.customer_phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <MapPin size={14} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{order.shipping_address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
