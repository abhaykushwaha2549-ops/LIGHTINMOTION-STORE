// src/pages/Contact.jsx
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Headphones } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto 100px', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
          LIGHTINMOTION CUSTOMER CARE
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px' }}>
          Contact Support
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          Questions about mounting, hardware compatibility, or existing orders? Our team is here to assist you.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '32px' }}>
        {/* Contact Info */}
        <div style={{ background: '#0d0f14', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '32px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '20px', textTransform: 'uppercase' }}>
            Get in Touch
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', gap: '14px' }}>
              <Mail size={20} color="#38bdf8" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>Email Us</div>
                <div style={{ color: '#ffffff', fontWeight: '600' }}>support@lightinmotion.store</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px' }}>
              <Phone size={20} color="#38bdf8" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>Phone Support</div>
                <div style={{ color: '#ffffff', fontWeight: '600' }}>+91 98765 43210 (Mon–Sat 10AM–7PM)</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px' }}>
              <MapPin size={20} color="#38bdf8" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>Fulfillment Hub</div>
                <div style={{ color: '#ffffff', fontWeight: '600' }}>Baddi Industrial Area, Solan, Himachal Pradesh 173205</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{ background: '#0d0f14', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '32px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 10px' }}>
              <CheckCircle size={44} color="#22c55e" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px' }}>Message Received</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Thank you for reaching out. A support engineer will reply within 4 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="input-field-wrap">
                  <label className="input-label">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    className="theme-input"
                  />
                </div>
              </div>

              <div className="input-field-wrap">
                <label className="input-label">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Order enquiry, setup question, warranty claim..."
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="theme-input"
                />
              </div>

              <div className="input-field-wrap" style={{ marginBottom: '20px' }}>
                <label className="input-label">Message</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="theme-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary-blue"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Send size={16} />
                <span>Submit Ticket</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
