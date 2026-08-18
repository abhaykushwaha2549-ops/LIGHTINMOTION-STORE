// src/admin/pages/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../api';
import { ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await adminLogin(email.trim(), password.trim());
      localStorage.setItem('lim_admin_token', res.token);
      localStorage.setItem('lim_admin_user', JSON.stringify(res.user));
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid admin credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#060709',
      padding: '24px',
      fontFamily: 'var(--font-body)'
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        backgroundColor: '#0d0f14',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        borderRadius: '10px',
        padding: '40px 32px',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.8)'
      }}>
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '8px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)'
          }}>
            <ShieldCheck size={26} />
          </div>
          <h1 style={{
            fontSize: '1.45rem',
            fontWeight: '900',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#ffffff',
            margin: '0 0 6px',
            fontFamily: 'var(--font-heading)'
          }}>
            LIGHTINMOTION Admin
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
            Merchant Operations & Catalog Controller
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '12px 14px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '0.82rem',
            lineHeight: 1.4
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Email Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#94a3b8'
            }}>
              Admin Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lightinmotion.store"
                style={{
                  width: '100%',
                  backgroundColor: '#111318',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  padding: '11px 14px',
                  fontSize: '0.9rem',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#94a3b8'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  width: '100%',
                  backgroundColor: '#111318',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  padding: '11px 14px',
                  fontSize: '0.9rem',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '13px',
              borderRadius: '6px',
              fontWeight: '800',
              fontSize: '0.85rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              transition: 'background-color 0.2s, transform 0.15s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            <span>{loading ? 'Verifying...' : 'Access Dashboard'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer Note */}
        <div style={{
          marginTop: '28px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          Protected Merchant Terminal • LIGHTINMOTION
        </div>
      </div>
    </div>
  );
}
