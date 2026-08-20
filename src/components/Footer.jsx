// src/components/Footer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

export default function Footer({ settings }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="exact-site-footer">
      <div className="footer-main-container">
        <div className="footer-columns-five">
          {/* Column 1: Brand & Socials */}
          <div className="footer-brand-col">
            <div className="footer-logo-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/logo.jpg"
                alt="LIGHTINMOTION Logo"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  objectFit: 'cover',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              />
              <span className="footer-brand-title">LIGHTINMOTION</span>
            </div>

            <p className="footer-brand-tagline">
              Minimal RGB and ambient hardware engineered to elevate your setup.
            </p>

            <div className="footer-social-icons">
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Instagram">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>

              {/* YouTube */}
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="YouTube">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                  <polygon points="10 15 15 12 10 9 10 15"/>
                </svg>
              </a>

              {/* Facebook */}
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Facebook">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>

              {/* X / Twitter */}
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="X">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Hardware */}
          <div className="footer-links-col">
            <h4 className="footer-col-heading">HARDWARE</h4>
            <ul className="footer-list">
              <li><Link to="/shop">Barlights</Link></li>
              <li><Link to="/shop">LED Strip Lights</Link></li>
              <li><Link to="/shop">Monitor Lighting</Link></li>
              <li><Link to="/shop">TV & Home Cinema</Link></li>
              <li><Link to="/shop">Floor & Table Lamps</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="footer-links-col">
            <h4 className="footer-col-heading">COMPANY</h4>
            <ul className="footer-list">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/track-order">Track Order</Link></li>
              <li><Link to="/contact">Support</Link></li>
            </ul>
          </div>

          {/* Column 4: Policies */}
          <div className="footer-links-col">
            <h4 className="footer-col-heading">POLICIES</h4>
            <ul className="footer-list">
              <li><Link to="/page/shipping-policy">Shipping Policy</Link></li>
              <li><Link to="/page/return-policy">Return Policy</Link></li>
              <li><Link to="/page/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/page/terms-conditions">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Column 5: Newsletter */}
          <div className="footer-newsletter-col">
            <h4 className="footer-col-heading">NEWSLETTER</h4>
            <p className="footer-newsletter-text">
              Get updates on new products and exclusive deals.
            </p>

            {subscribed ? (
              <div className="newsletter-success-badge">
                <Check size={14} />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form-row">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-submit-btn" aria-label="Subscribe">
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="footer-bottom-row">
          <div className="footer-copyright-text">
            © 2025 LIGHTINMOTION. All rights reserved.
          </div>

          <div className="footer-payment-badges">
            <div className="payment-badge-pill">
              <span style={{ fontWeight: '900', fontStyle: 'italic', letterSpacing: '0.05em', color: '#fff', fontSize: '11px' }}>VISA</span>
            </div>
            <div className="payment-badge-pill">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eb001b', display: 'inline-block' }}></span>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f79e1b', display: 'inline-block', marginLeft: '-5px', opacity: 0.9 }}></span>
              </div>
            </div>
            <div className="payment-badge-pill">
              <span style={{ color: '#22c55e', fontWeight: '800', fontSize: '11px' }}>UPI</span>
            </div>
            <div className="payment-badge-pill">
              <span style={{ color: '#38bdf8', fontWeight: '800', fontSize: '11px' }}>Paytm</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
