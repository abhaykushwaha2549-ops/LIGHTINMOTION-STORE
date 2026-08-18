// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { customerRegister } from '../api';
import { UserPlus, ArrowRight } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await customerRegister(formData);
      localStorage.setItem('lim_customer_token', res.token);
      localStorage.setItem('lim_customer_user', JSON.stringify(res.customer));
      navigate('/account');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '60px auto 100px', padding: '0 24px' }}>
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
            <UserPlus size={22} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', textTransform: 'uppercase' }}>Create Account</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Track orders and manage addresses.</p>
        </div>

        {error && (
          <div style={{ background: '#450a0a', border: '1px solid #dc2626', color: '#fca5a5', padding: '10px 14px', borderRadius: '4px', marginBottom: '18px', fontSize: '0.8rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-field-wrap">
            <label className="input-label">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Abhay Sharma"
              className="theme-input"
            />
          </div>

          <div className="input-field-wrap">
            <label className="input-label">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="abhay@example.com"
              className="theme-input"
            />
          </div>

          <div className="input-field-wrap">
            <label className="input-label">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="theme-input"
            />
          </div>

          <div className="input-field-wrap" style={{ marginBottom: '20px' }}>
            <label className="input-label">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className="theme-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-buy-solid"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: '#94a3b8' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#38bdf8', fontWeight: '600' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
