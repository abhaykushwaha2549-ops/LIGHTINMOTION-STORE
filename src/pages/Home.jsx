// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Play, CheckCircle2, Sliders, ShieldCheck, Sparkles } from 'lucide-react';
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
    heading: 'RGB LIGHTING FOR YOUR DESK, TV OR GAMING SETUP',
    subtitle: 'MINIMAL DESIGN. VIBRANT AMBIENCE.',
    description: 'Set the colour, brightness and dynamic effects directly from your phone.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-lights-in-a-computer-room-33100-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80'
  };

  return (
    <div>
      {/* Hero Video Banner */}
      <section className="hero-banner-wrap">
        {hero.videoUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            poster={hero.posterUrl}
            className="hero-video-bg"
            key={hero.videoUrl}
          >
            <source src={hero.videoUrl} type="video/mp4" />
          </video>
        ) : (
          <img src={hero.posterUrl} alt="LIGHTINMOTION" className="hero-video-bg" />
        )}

        <div className="hero-vignette-overlay" />

        <div className="hero-text-block">
          <div className="hero-supertitle">
            {hero.subtitle}
          </div>

          <h1 className="hero-main-title">
            {hero.heading}
          </h1>

          <p className="hero-body-text">
            {hero.description}
          </p>

          <div className="hero-btn-row">
            <Link to="/shop" className="btn-primary-blue">
              <span>SHOP HARDWARE</span>
              <ArrowRight size={16} />
            </Link>

            <a href="#products-showcase" className="btn-secondary-dark">
              <span>EXPLORE SETUPS</span>
            </a>
          </div>
        </div>
      </section>

      {/* Products Catalog Showcase */}
      <section id="products-showcase" style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.12em', color: '#38bdf8', textTransform: 'uppercase', marginBottom: '6px' }}>
              HARDWARE CATALOG
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', textTransform: 'uppercase', color: '#ffffff' }}>
              OUR PRODUCTS
            </h2>
          </div>

          <Link to="/shop" style={{ fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.08em', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>VIEW ALL</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading products...</div>
        ) : (
          <div className="products-catalog-grid">
            {products.map((p) => {
              const primaryMedia = p.media?.[0] || {};
              const hasVideo = p.media?.some((m) => m.type === 'video');

              return (
                <div
                  key={p.id}
                  className="product-item-card"
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  <div className="card-image-box">
                    <span className="card-sale-tag">SALE</span>
                    {hasVideo && (
                      <span className="card-video-tag">
                        <Play size={9} fill="#fff" />
                        <span>VIDEO</span>
                      </span>
                    )}

                    {primaryMedia.type === 'video' ? (
                      <video
                        src={primaryMedia.url}
                        muted
                        loop
                        playsInline
                        onMouseOver={(e) => e.target.play().catch(() => {})}
                        onMouseOut={(e) => e.target.pause()}
                      />
                    ) : (
                      <img
                        src={primaryMedia.url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80'}
                        alt={p.title}
                        loading="lazy"
                      />
                    )}
                  </div>

                  <div className="card-details-box">
                    <h3 className="card-item-title">{p.title}</h3>

                    <div className="card-prices-line">
                      <span className="card-price-now">
                        Rs. {Number(p.price).toLocaleString('en-IN')}.00
                      </span>
                      {p.compare_price && (
                        <span className="card-price-was">
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
      </section>

      {/* Setup Immersion Section */}
      <section style={{ background: '#050608', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '80px 32px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
              BUILT FOR REAL SETUPS
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '800', textTransform: 'uppercase', lineHeight: 1.15, marginBottom: '18px' }}>
              Precision lighting without the clutter
            </h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '24px' }}>
              Every LIGHTINMOTION fixture is designed with clean cable management, solid aluminum chassis, and smooth diffused illumination. Sync directly with your audio, screen, or custom color palettes from our mobile app.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                <CheckCircle2 size={18} color="#22c55e" />
                <span>Zero-lag audio and monitor sync software</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                <CheckCircle2 size={18} color="#22c55e" />
                <span>16M+ colors with smooth hardware dimming</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                <CheckCircle2 size={18} color="#22c55e" />
                <span>1-Year comprehensive replacement warranty</span>
              </div>
            </div>
          </div>

          <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <img
              src="https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1000&q=80"
              alt="LIGHTINMOTION Setup"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
