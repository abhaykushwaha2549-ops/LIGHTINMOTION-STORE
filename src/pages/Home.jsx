// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Lock,
  Play,
  Film,
  Image as ImageIcon,
  X,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { getProducts, getSettings } from '../api';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Showcase Gallery State
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeMediaModal, setActiveMediaModal] = useState(null);

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
    imageUrl: '/hero_hanging_lamp.png'
  };

  const showcaseMedia = settings?.showcaseMedia || [
    {
      id: 'showcase_1',
      title: 'Immersive Desk Setup with Barlights',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
      caption: 'RGB Barlights synced with mechanical keyboard and ultrawide monitor setup.',
      category: 'Desk Setup'
    },
    {
      id: 'showcase_2',
      title: 'Dynamic RGB Flex Strip Glow',
      type: 'video',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-glowing-led-strip-on-a-desk-42171-large.mp4',
      caption: 'Smart Neon Flex Strip bendable backlighting behind desk edge.',
      category: 'Videos'
    },
    {
      id: 'showcase_3',
      title: 'TV Backlight Ambient Living Room',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1200&q=80',
      caption: 'Smart TV Ambient Backlight bar reacting to movie scenes.',
      category: 'Living Room'
    },
    {
      id: 'showcase_4',
      title: 'Minimalist Corner Atmosphere Floor Lamp',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80',
      caption: 'Warm Nordic standing linear lamp in studio corner.',
      category: 'Ambient Bar'
    }
  ];

  const filteredMedia = activeCategory === 'ALL'
    ? showcaseMedia
    : showcaseMedia.filter((m) => {
        if (activeCategory === 'VIDEOS') return m.type === 'video';
        return m.category?.toUpperCase() === activeCategory.toUpperCase();
      });

  return (
    <div className="home-page-root">
      {/* Hero Banner Section */}
      <section className="exact-hero-section">
        {/* Background Image / Overlay */}
        <div className="exact-hero-bg-wrap">
          <img
            src={hero.imageUrl || '/hero_hanging_lamp.png'}
            alt="LIGHTINMOTION Ambient Fixture"
            className="exact-hero-image"
          />

          {/* Dissolve Gradient Overlay (Soft bottom dissolve into dark background) */}
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

      {/* SETUP SHOWCASE & AMBIENT MEDIA GALLERY (PLACED BEFORE OUR PRODUCTS) */}
      <section className="exact-showcase-section" style={{ background: '#17171a', padding: '52px 0 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="exact-products-container">
          {/* Header Row */}
          <div className="exact-products-header-row" style={{ marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} />
                <span>CUSTOMER SHOWCASE & REELS</span>
              </div>
              <h2 className="exact-products-heading" style={{ fontSize: '1.45rem' }}>
                SETUP SHOWCASE & AMBIENT MEDIA
              </h2>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {['ALL', 'VIDEOS', 'DESK SETUP', 'LIVING ROOM', 'AMBIENT BAR'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    background: activeCategory === cat ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                    color: activeCategory === cat ? '#000000' : '#a1a1aa',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    letterSpacing: '0.06em',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Media Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginTop: '20px' }}>
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveMediaModal(item)}
                style={{
                  background: '#202024',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.25s ease, border-color 0.25s ease'
                }}
                className="exact-product-card"
              >
                {/* Media Wrapper */}
                <div style={{ position: 'relative', width: '100%', height: '220px', background: '#0f1013' }}>
                  {item.type === 'video' ? (
                    <video
                      src={item.url}
                      muted
                      loop
                      autoPlay
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}

                  {/* Badge */}
                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: item.type === 'video' ? '#2563eb' : 'rgba(0, 0, 0, 0.85)',
                    color: '#ffffff',
                    fontSize: '9px',
                    fontWeight: '800',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {item.type === 'video' ? <Film size={10} /> : <ImageIcon size={10} />}
                    <span>{item.type === 'video' ? 'VIDEO REEL' : 'SETUP PHOTO'}</span>
                  </span>

                  {/* Expand Overlay Icon */}
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Maximize2 size={13} />
                  </div>
                </div>

                {/* Title & Caption */}
                <div style={{ padding: '14px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                    {item.title}
                  </div>
                  {item.caption && (
                    <div style={{ fontSize: '0.78rem', color: '#a1a1aa', lineHeight: 1.4 }}>
                      {item.caption}
                    </div>
                  )}
                </div>
              </div>
            ))}
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

          {/* Products Grid */}
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading products...</div>
          ) : (
            <div className="exact-five-col-grid">
              {products.map((p) => {
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

                        {(p.compare_price || p.comparePrice) && (
                          <span className="exact-price-original" style={{ textDecoration: 'line-through', color: '#71717a', fontSize: '0.8rem' }}>
                            Rs. {Number(p.compare_price || p.comparePrice).toLocaleString('en-IN')}.00
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

      {/* Lightbox / Fullscreen Media Modal */}
      {activeMediaModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            maxWidth: '900px',
            width: '100%',
            backgroundColor: '#17171a',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.95)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveMediaModal(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                zIndex: 10,
                background: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            {/* Media Content */}
            <div style={{ width: '100%', maxHeight: '540px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeMediaModal.type === 'video' ? (
                <video
                  src={activeMediaModal.url}
                  controls
                  autoPlay
                  style={{ width: '100%', maxHeight: '540px', objectFit: 'contain' }}
                />
              ) : (
                <img
                  src={activeMediaModal.url}
                  alt={activeMediaModal.title}
                  style={{ width: '100%', maxHeight: '540px', objectFit: 'contain' }}
                />
              )}
            </div>

            {/* Title & Description */}
            <div style={{ padding: '24px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
                {activeMediaModal.title}
              </div>
              <div style={{ fontSize: '0.88rem', color: '#a1a1aa' }}>
                {activeMediaModal.caption}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
