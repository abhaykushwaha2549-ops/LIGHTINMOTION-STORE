// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { customerLogin } from '../api';
import { Lock, Mail, ArrowRight, User } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await customerLogin(email, password);
      localStorage.setItem('lim_customer_token', res.token);
      localStorage.setItem('lim_customer_user', JSON.stringify(res.customer));
      navigate('/account');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '60px auto 100px', padding: '0 24px' }}>
      <div style={{ background: '#0d0f14', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '36px 30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: '#12141a',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            color: '#38bdf8'
          }}>
            <User size={22} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', textTransform: 'uppercase' }}>Customer Login</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Access your orders and saved addresses.</p>
        </div>

        {error && (
          <div style={{ background: '#450a0a', border: '1px solid #dc2626', color: '#fca5a5', padding: '10px 14px', borderRadius: '4px', marginBottom: '18px', fontSize: '0.8rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-field-wrap">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
              className="theme-input"
            />
          </div>

          <div className="input-field-wrap" style={{ marginBottom: '20px' }}>
            <label className="input-label">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="theme-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-buy-solid"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: '#94a3b8' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#38bdf8', fontWeight: '600' }}>
            Create one
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.78rem', color: '#64748b' }}>
          Store Manager?{' '}
          <Link to="/admin/login" style={{ color: '#94a3b8' }}>
            Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
