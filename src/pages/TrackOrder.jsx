// src/pages/TrackOrder.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { trackOrder } from '../api';
import { Package, Search, CheckCircle, Clock, Truck, ShieldCheck, MapPin } from 'lucide-react';

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('number') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracking = async (numberToSearch) => {
    if (!numberToSearch.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await trackOrder(numberToSearch.trim());
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err.message || 'Order not found. Please verify your order number.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialNum = searchParams.get('number');
    if (initialNum) {
      fetchTracking(initialNum);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTracking(orderNumber);
  };

  const steps = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const currentStatus = result?.order?.order_status || 'Confirmed';
  const currentStepIdx = steps.indexOf(currentStatus) !== -1 ? steps.indexOf(currentStatus) : 0;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto 100px', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
          Track Your Order
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Enter your LIGHTINMOTION order number (e.g. LIM-123456) to view real-time shipment status.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '36px' }}>
        <input
          type="text"
          placeholder="Enter Order Number (e.g. LIM-104928)"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
          className="theme-input"
          style={{ flexGrow: 1, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
        />
        <button
          type="submit"
          disabled={loading || !orderNumber.trim()}
          className="btn-primary-blue"
          style={{ padding: '10px 24px' }}
        >
          <Search size={16} />
          <span>{loading ? 'Searching...' : 'Track'}</span>
        </button>
      </form>

      {error && (
        <div style={{ background: '#450a0a', border: '1px solid #dc2626', color: '#fca5a5', padding: '14px', borderRadius: '6px', textAlign: 'center', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ background: '#0d0f14', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '32px' }}>
          {/* Order Details Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '18px', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>ORDER STATUS</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {result.order.order_number}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Placed on {new Date(result.order.created_at).toLocaleDateString()}</div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>
                Total: ₹{Number(result.order.total_amount).toLocaleString('en-IN')}.00
              </div>
            </div>
          </div>

          {/* Progress Tracker Line */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '32px', position: 'relative' }}>
            {steps.map((step, idx) => {
              const isPastOrCurrent = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={step} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isCurrent ? '#2563eb' : isPastOrCurrent ? '#1e293b' : '#0a0a0d',
                    border: '2px solid ' + (isPastOrCurrent ? '#2563eb' : 'var(--border-color)'),
                    color: isPastOrCurrent ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    fontWeight: '700',
                    fontSize: '12px'
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: isCurrent ? '700' : '500', color: isPastOrCurrent ? '#ffffff' : '#64748b' }}>
                    {step}
                  </div>
                </div>
              );
            })}
          </div>

          {result.order.tracking_number && (
            <div style={{ background: '#12141a', border: '1px solid #0284c7', padding: '12px 16px', borderRadius: '6px', marginBottom: '24px', fontSize: '0.85rem', color: '#38bdf8' }}>
              📦 Tracking ID: <strong>{result.order.tracking_number}</strong>
            </div>
          )}

          {/* Items Summary */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '14px' }}>Items in this Order</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {result.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={item.image_url || 'https://via.placeholder.com/60'} alt={item.product_title} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{item.product_title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Qty: {item.quantity} • {item.variant_name}</div>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}.00
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
