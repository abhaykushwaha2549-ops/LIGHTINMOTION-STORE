// src/pages/Account.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { customerGetMe } from '../api';
import { User, Package, LogOut, MapPin, ExternalLink, Clock, CheckCircle } from 'lucide-react';

export default function Account() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await customerGetMe();
        setData(res);
      } catch (err) {
        setError(err.message || 'Please log in to view your account.');
        localStorage.removeItem('lim_customer_token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('lim_customer_token');
    localStorage.removeItem('lim_customer_user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '80px auto', padding: '0 24px', textAlign: 'center', color: '#38bdf8' }}>
        Loading account profile...
      </div>
    );
  }

  const { customer, addresses, orders } = data || { customer: {}, addresses: [], orders: [] };

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto 100px', padding: '0 24px' }}>
      {/* Account Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#0d0f14',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '24px 28px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#2563eb',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '18px'
          }}>
            {customer.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>{customer.name}</h1>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{customer.email} {customer.phone && `• ${customer.phone}`}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-cart-outline"
          style={{ padding: '8px 16px', fontSize: '0.78rem', gap: '6px' }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Orders Section */}
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={18} color="#38bdf8" />
          <span>Your Orders ({orders.length})</span>
        </h2>

        {orders.length === 0 ? (
          <div style={{ background: '#0d0f14', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '48px 20px', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', marginBottom: '16px' }}>You haven't placed any orders yet.</p>
            <Link to="/shop" className="btn-primary-blue">Explore Store</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {orders.map((ord) => (
              <div
                key={ord.id}
                style={{
                  background: '#0d0f14',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{ord.order_number}</strong>
                    <span style={{
                      background: ord.order_status === 'Delivered' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(37, 99, 235, 0.15)',
                      color: ord.order_status === 'Delivered' ? '#22c55e' : '#38bdf8',
                      border: '1px solid ' + (ord.order_status === 'Delivered' ? '#22c55e' : '#2563eb'),
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      textTransform: 'uppercase'
                    }}>
                      {ord.order_status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Placed on {new Date(ord.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} • Payment: {ord.payment_method} ({ord.payment_status})
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>
                      ₹{Number(ord.total_amount).toLocaleString('en-IN')}.00
                    </div>
                  </div>

                  <Link
                    to={`/track-order?number=${ord.order_number}`}
                    className="btn-cart-outline"
                    style={{ padding: '8px 14px', fontSize: '0.75rem' }}
                  >
                    Track Status
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
