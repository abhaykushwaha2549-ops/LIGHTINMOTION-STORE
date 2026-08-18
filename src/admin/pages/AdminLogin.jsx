// src/admin/pages/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminLogin } from '../../api';
import { ShieldCheck, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@lightinmotion.store');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await adminLogin(email, password);
      localStorage.setItem('lim_admin_token', res.token);
      localStorage.setItem('lim_admin_user', JSON.stringify(res.user));
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090a0f', padding: '24px' }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        background: '#0f131a',
        border: '1px solid #1f293d',
        borderRadius: '8px',
        padding: '36px 30px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            background: '#008060',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            fontWeight: '800'
          }}>
            <ShieldCheck size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 6px', color: '#fff' }}>LIGHTINMOTION Admin</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>Merchant Operations & Catalog Controller</p>
        </div>

        {error && (
          <div style={{ background: '#450a0a', border: '1px solid #dc2626', color: '#fca5a5', padding: '10px 14px', borderRadius: '4px', marginBottom: '18px', fontSize: '0.8rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-field-wrap">
            <label className="input-label" style={{ color: '#cbd5e1' }}>Admin Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="theme-input"
              style={{ background: '#090b0e', borderColor: '#26334d' }}
            />
          </div>

          <div className="input-field-wrap" style={{ marginBottom: '20px' }}>
            <label className="input-label" style={{ color: '#cbd5e1' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="theme-input"
              style={{ background: '#090b0e', borderColor: '#26334d' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#008060',
              color: '#ffffff',
              border: 'none',
              padding: '12px',
              borderRadius: '4px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>{loading ? 'Verifying...' : 'Access Dashboard'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #1f293d', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
          Default seed credentials: <code>admin@lightinmotion.store</code> / <code>admin123</code>
        </div>
      </div>
    </div>
  );
}
