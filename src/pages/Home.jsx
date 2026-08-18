// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { getProducts, getSettings } from '../api';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [prods, storeSettings] = await Promise.all([
          getProducts(),
          getSettings()
        ]);
        setProducts(prods || []);
        setSettings(storeSettings);
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const hero = settings?.hero || {
    kicker: 'SYNC. AMBIENT. IMMERSIVE.',
    titleLine1: 'LIGHT UP',
    titleLine2: 'YOUR SPACE',
    description: 'Premium RGB lighting solutions to elevate your setup, sync with your world, and vibe your way.',
    imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1920&q=80'
  };

  return (
    <div className="home-page-root">
      {/* Hero Banner Section */}
      <section className="exact-hero-section">
        {/* Background Image / Overlay */}
        <div className="exact-hero-bg-wrap">
          <img
            src={hero.imageUrl || 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1920&q=80'}
            alt="LIGHTINMOTION Ambient Fixture"
            className="exact-hero-image"
          />
          <div className="exact-hero-gradient-overlay" />
        </div>

        {/* Hero Content Box */}
        <div className="exact-hero-content-container">
          <div className="exact-hero-text-box">
            <div className="exact-hero-kicker">
              {hero.kicker || 'SYNC. AMBIENT. IMMERSIVE.'}
            </div>

            <h1 className="exact-hero-title">
              <span>{hero.titleLine1 || 'LIGHT UP'}</span>
              <span>{hero.titleLine2 || 'YOUR SPACE'}</span>
            </h1>

            <p className="exact-hero-description">
              {hero.description || 'Premium RGB lighting solutions to elevate your setup, sync with your world, and vibe your way.'}
            </p>

            <div className="exact-hero-btn-row">
              <Link to="/shop" className="exact-hero-btn-white">
                <span>SHOP NOW</span>
                <ArrowRight size={15} />
              </Link>

              <Link to="/shop" className="exact-hero-btn-outline">
                <span>EXPLORE SETUPS</span>
              </Link>
            </div>
          </div>

          {/* Carousel Pagination Dots at Bottom Center */}
          <div className="exact-hero-dots-row">
            <span className="hero-dot active" />
            <span className="hero-dot" />
            <span className="hero-dot" />
          </div>
        </div>
      </section>

      {/* OUR PRODUCTS Section */}
      <section className="exact-products-section">
        <div className="exact-products-container">
          {/* Header Row */}
          <div className="exact-products-header-row">
            <h2 className="exact-products-heading">
              OUR PRODUCTS
            </h2>

            <Link to="/shop" className="exact-view-all-link">
              <span>VIEW ALL PRODUCTS</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* 5-Column Products Horizontal Grid */}
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading products...</div>
          ) : (
            <div className="exact-five-col-grid">
              {products.slice(0, 5).map((p) => {
                const primaryMedia = p.media?.[0] || {};
                return (
                  <div
                    key={p.id}
                    className="exact-product-card"
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    {/* Media Box */}
                    <div className="exact-card-media-box">
                      <span className="exact-sale-pill">SALE</span>

                      <img
                        src={primaryMedia.url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80'}
                        alt={p.title}
                        loading="lazy"
                        className="exact-card-img"
                      />
                    </div>

                    {/* Content Box */}
                    <div className="exact-card-info-box">
                      <h3 className="exact-card-product-title">{p.title}</h3>

                      <div className="exact-card-price-row">
                        <span className="exact-price-current">
                          Rs. {Number(p.price).toLocaleString('en-IN')}.00
                        </span>

                        {p.compare_price && (
                          <span className="exact-price-compare">
                            Rs. {Number(p.compare_price).toLocaleString('en-IN')}.00
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Trust & Guarantee Perks Bar */}
      <section className="exact-perks-section">
        <div className="exact-perks-container">
          <div className="exact-perk-item">
            <div className="perk-icon-wrap">
              <Truck size={22} strokeWidth={1.75} />
            </div>
            <div className="perk-text-wrap">
              <div className="perk-title">FREE SHIPPING</div>
              <div className="perk-subtitle">On orders above Rs. 999</div>
            </div>
          </div>

          <div className="exact-perk-item">
            <div className="perk-icon-wrap">
              <RotateCcw size={22} strokeWidth={1.75} />
            </div>
            <div className="perk-text-wrap">
              <div className="perk-title">7 DAYS RETURN</div>
              <div className="perk-subtitle">Hassle-free returns</div>
            </div>
          </div>

          <div className="exact-perk-item">
            <div className="perk-icon-wrap">
              <ShieldCheck size={22} strokeWidth={1.75} />
            </div>
            <div className="perk-text-wrap">
              <div className="perk-title">1 YEAR WARRANTY</div>
              <div className="perk-subtitle">Quality you can trust</div>
            </div>
          </div>

          <div className="exact-perk-item">
            <div className="perk-icon-wrap">
              <Lock size={22} strokeWidth={1.75} />
            </div>
            <div className="perk-text-wrap">
              <div className="perk-title">SECURE PAYMENT</div>
              <div className="perk-subtitle">100% safe & secure</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
