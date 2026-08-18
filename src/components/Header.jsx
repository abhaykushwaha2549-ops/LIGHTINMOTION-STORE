// src/components/Header.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  User,
  ShoppingBag,
  Mail,
  X
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Header({ settings }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, setIsCartOpen } = useCart();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const customerToken = localStorage.getItem('lim_customer_token');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      {/* Top Announcement Bar (Exact match to reference image) */}
      <div className="home-top-announcement-bar">
        <div className="announcement-spacer" />
        <div className="announcement-main-text">
          {settings?.hero?.bannerText || 'FREE SHIPPING ON ORDERS ABOVE ₹999'}
        </div>
        <div className="announcement-social-links">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="top-social-link" aria-label="Instagram">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
          </a>
          <Link to="/contact" className="top-social-link" aria-label="Email Contact">
            <Mail size={14} />
          </Link>
        </div>
      </div>

      {/* Main Header */}
      <header className="site-header">
        <div className="site-header-inner">
          {/* Brand Logo */}
          <Link to="/" className="brand-logo">
            <div className="brand-logo-icon">
              LM
            </div>
            <span className="brand-logo-text">LIGHTINMOTION</span>
          </Link>

          {/* Navigation Links */}
          <nav className="nav-links">
            <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
              HOME
            </Link>
            <Link to="/shop" className={`nav-item ${location.pathname.startsWith('/shop') || location.pathname.startsWith('/product') ? 'active' : ''}`}>
              SHOP
            </Link>
            <Link to="/about" className={`nav-item ${location.pathname === '/about' ? 'active' : ''}`}>
              ABOUT US
            </Link>
            <Link to="/contact" className={`nav-item ${location.pathname === '/contact' ? 'active' : ''}`}>
              CONTACT
            </Link>
          </nav>

          {/* Header Right Actions */}
          <div className="header-right-actions">
            <button
              className="header-action-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              title="Search products"
              aria-label="Search products"
            >
              <Search size={19} />
            </button>

            {/* Customer Account Button */}
            <Link
              to={customerToken ? '/account' : '/login'}
              className="header-action-btn"
              title={customerToken ? 'My Account' : 'Login'}
              aria-label="Account"
            >
              <User size={19} />
            </Link>

            {/* Cart Trigger */}
            <button
              className="header-action-btn cart-btn-wrap"
              onClick={() => setIsCartOpen(true)}
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={19} />
              <span className="cart-count-badge">{cartCount}</span>
            </button>
          </div>
        </div>

        {/* Expandable Search Modal Bar */}
        {searchOpen && (
          <div className="search-dropdown-bar">
            <form onSubmit={handleSearchSubmit} className="search-form-inner">
              <Search size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Search smart barlights, flex strips, ambient backlights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="search-input-field"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="header-action-btn"
              >
                <X size={18} />
              </button>
            </form>
          </div>
        )}
      </header>
    </>
  );
}
