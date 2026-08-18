// src/pages/ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProduct } from '../api';
import { useCart } from '../context/CartContext';
import {
  ChevronRight,
  Search,
  Play,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Award,
  Lightbulb,
  Sliders,
  RefreshCw,
  Smartphone,
  Box,
  Layers,
  Music
} from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('Black');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('DESCRIPTION');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getProduct(id);
        setProduct(data);
        if (data?.options?.color && data.options.color.length > 0) {
          setSelectedColor(data.options.color[0]);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="product-page-container" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#38bdf8', fontSize: '1rem', fontWeight: '600' }}>Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-page-container" style={{ minHeight: '65vh', textAlign: 'center', padding: '80px 20px' }}>
        <h2 style={{ marginBottom: '12px' }}>Product Not Found</h2>
        <p style={{ color: '#94a3b8', marginBottom: '24px' }}>The requested product does not exist or has been unpublished.</p>
        <Link to="/shop" className="btn-buy-solid" style={{ display: 'inline-flex', width: 'auto', padding: '10px 24px' }}>Browse Store</Link>
      </div>
    );
  }

  const mediaList = product.media && product.media.length > 0
    ? product.media
    : [{ type: 'image', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80', alt_text: product.title }];

  const currentMedia = mediaList[activeMediaIndex] || mediaList[0];

  const comparePrice = product.compare_price || product.comparePrice;
  const discountPercent = comparePrice
    ? Math.round(((comparePrice - product.price) / comparePrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity, { color: selectedColor });
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, { color: selectedColor });
    navigate('/checkout');
  };

  return (
    <div className="product-page-container">
      {/* Breadcrumbs Navigation */}
      <nav className="breadcrumbs">
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <Link to="/shop">Shop</Link>
        <ChevronRight size={14} />
        <span className="active-crumb">{product.title}</span>
      </nav>

      {/* Main Two-Column Layout */}
      <div className="product-main-grid">
        {/* Left Column: Media Gallery */}
        <div className="gallery-column">
          <div className="main-image-viewport">
            {currentMedia.type === 'video' ? (
              <video
                src={currentMedia.url}
                controls
                autoPlay
                loop
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <img
                src={currentMedia.url}
                alt={currentMedia.alt_text || currentMedia.fileName || product.title}
              />
            )}
            
            <button className="image-zoom-icon" title="View Fullscreen">
              <Search size={16} />
            </button>
          </div>

          {/* Thumbnails Carousel Row */}
          <div className="thumbnails-row">
            {mediaList.map((m, idx) => (
              <button
                key={m.id || idx}
                className={`thumb-card ${activeMediaIndex === idx ? 'active' : ''}`}
                onClick={() => setActiveMediaIndex(idx)}
              >
                {m.type === 'video' ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }}>
                    <video src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div className="thumb-video-overlay">
                      <div className="thumb-video-circle">
                        <Play size={12} fill="#ffffff" color="#ffffff" style={{ marginLeft: '1px' }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img src={m.url} alt={`Thumbnail ${idx + 1}`} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Product Purchasing & Specs */}
        <div className="product-info-column">
          <div className="category-tag-pill">
            {product.category_id === 'cat_barlights' ? 'LIGHT ROPES & STRINGS IN LIGHTING' : (product.category_id || 'AMBIENT LIGHTING')}
          </div>

          <h1 className="product-heading-title">{product.title}</h1>

          <div className="vendor-sku-meta">
            VENDOR: <strong>{product.vendor || 'LIGHTINMOTION'}</strong> &nbsp;&nbsp; SKU: {product.sku || 'LIM-BAR-001'}
          </div>

          {/* Pricing Row */}
          <div className="pricing-row-box">
            <span className="price-current">
              ₹{Number(product.price).toLocaleString('en-IN')}.00
            </span>
            {comparePrice && (
              <span className="price-original">
                ₹{Number(comparePrice).toLocaleString('en-IN')}.00
              </span>
            )}
            {discountPercent > 0 && (
              <span className="save-percent-pill">
                SAVE {discountPercent}%
              </span>
            )}
          </div>

          {/* Stock Indicator */}
          <div className="stock-indicator-row">
            <span className="stock-dot" />
            <span className="stock-text">
              {product.inventory > 0
                ? `In Stock (${product.inventory} units available at warehouse)`
                : 'In Stock (Ready to dispatch)'}
            </span>
          </div>

          {/* Color Options */}
          {product.options?.color && product.options.color.length > 0 && (
            <div className="color-variant-section">
              <div className="color-variant-label">
                COLOR: <span>{selectedColor.toUpperCase()}</span>
              </div>
              <div className="color-pills-list">
                {product.options.color.map((col) => (
                  <button
                    key={col}
                    className={`color-pill-btn ${selectedColor === col ? 'active' : ''}`}
                    onClick={() => setSelectedColor(col)}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Features Icons Row */}
          <div className="features-section">
            <div className="features-section-title">FEATURES</div>
            <div className="features-grid-row">
              <div className="feature-pill-item">
                <Lightbulb size={15} />
                <span>LED lighting</span>
              </div>
              <div className="feature-pill-item">
                <Sliders size={15} />
                <span>Adjustable brightness</span>
              </div>
              <div className="feature-pill-item">
                <RefreshCw size={15} />
                <span>Color temp sync</span>
              </div>
              <div className="feature-pill-item">
                <Smartphone size={15} />
                <span>Remote App</span>
              </div>
            </div>
          </div>

          {/* Quantity Stepper */}
          <div className="quantity-action-row">
            <span className="quantity-label-text">QUANTITY</span>
            <div className="qty-stepper-box">
              <button
                className="qty-step-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                —
              </button>
              <span className="qty-display-value">{quantity}</span>
              <button
                className="qty-step-btn"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart & Buy Now */}
          <div className="action-buttons-row">
            <button
              className="btn-cart-outline"
              onClick={handleAddToCart}
            >
              <ShoppingBag size={17} />
              <span>ADD TO CART</span>
            </button>

            <button
              className="btn-buy-solid"
              onClick={handleBuyNow}
            >
              <ShoppingBag size={17} />
              <span>BUY NOW</span>
            </button>
          </div>

          {/* Trust Perks Row */}
          <div className="trust-perks-card">
            <div className="trust-perk-item">
              <Truck size={18} />
              <div>
                <div style={{ fontWeight: '700' }}>Free Delivery</div>
                <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Above ₹999</div>
              </div>
            </div>

            <div className="trust-perk-item">
              <RotateCcw size={18} />
              <div>
                <div style={{ fontWeight: '700' }}>7 Days</div>
                <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Return Policy</div>
              </div>
            </div>

            <div className="trust-perk-item">
              <ShieldCheck size={18} />
              <div>
                <div style={{ fontWeight: '700' }}>1 Year</div>
                <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Warranty</div>
              </div>
            </div>

            <div className="trust-perk-item">
              <Award size={18} />
              <div>
                <div style={{ fontWeight: '700' }}>100% Original</div>
                <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Brand Gear</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: DESCRIPTION, SPECIFICATIONS, HOW IT WORKS, SHIPPING & RETURNS */}
      <div className="tabs-header-bar">
        {['DESCRIPTION', 'SPECIFICATIONS', 'HOW IT WORKS', 'SHIPPING & RETURNS'].map((tab) => (
          <button
            key={tab}
            className={`tab-btn-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content Display */}
      {activeTab === 'DESCRIPTION' && (
        <div className="tab-content-grid">
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '14px', textTransform: 'uppercase' }}>
              {product.title}
            </h3>
            <div
              style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.9rem', marginBottom: '20px' }}
              dangerouslySetInnerHTML={{ __html: product.description || '<p>Upgrade your setup with minimal design and powerful lighting.</p>' }}
            />

            <div className="feature-cards-quad">
              <div className="feature-quad-card">
                <Box size={24} />
                <p>Minimal build that fits anywhere</p>
              </div>

              <div className="feature-quad-card">
                <Layers size={24} />
                <p>16M+ colors & smooth effects</p>
              </div>

              <div className="feature-quad-card">
                <Music size={24} />
                <p>Sync with music or screen</p>
              </div>

              <div className="feature-quad-card">
                <Smartphone size={24} />
                <p>Control everything from our app</p>
              </div>
            </div>
          </div>

          <div className="tab-setup-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80"
              alt="LIGHTINMOTION Desktop Setup Immersion"
            />
          </div>
        </div>
      )}

      {activeTab === 'SPECIFICATIONS' && (
        <div style={{ maxWidth: '800px', background: '#0d0f14', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '10px 0', color: '#94a3b8', width: '200px' }}>Material</td>
                <td style={{ color: '#fff' }}>Aviation-Grade Anodized Aluminum + Diffused Polycarbonate</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '10px 0', color: '#94a3b8' }}>Power Input</td>
                <td style={{ color: '#fff' }}>{product.options?.powerSource || 'USB 5V/2A DC'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '10px 0', color: '#94a3b8' }}>Color Temperature</td>
                <td style={{ color: '#fff' }}>2700K - 6500K + 16 Million RGB Colors</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '10px 0', color: '#94a3b8' }}>Connectivity</td>
                <td style={{ color: '#fff' }}>Bluetooth 5.0 + 2.4GHz Wi-Fi</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 0', color: '#94a3b8' }}>Suitable Space</td>
                <td style={{ color: '#fff' }}>{product.options?.suitableSpace || 'Indoors / Gaming Desk / Workspace'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'HOW IT WORKS' && (
        <div style={{ maxWidth: '800px', background: '#0d0f14', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.7 }}>
            <div>
              <strong style={{ color: '#38bdf8' }}>1. Unbox & Mount:</strong> Place the light bars on the weighted magnetic bases either vertically or horizontally behind your monitors.
            </div>
            <div>
              <strong style={{ color: '#38bdf8' }}>2. Plug in Power:</strong> Connect the USB power cable to your PC, monitor hub, or 5V power adapter.
            </div>
            <div>
              <strong style={{ color: '#38bdf8' }}>3. Pair with Phone App:</strong> Open the LIGHTINMOTION app, tap "Add Device" to pair via Bluetooth, and customize your scene colors, brightness, and audio rhythm modes instantly.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'SHIPPING & RETURNS' && (
        <div style={{ maxWidth: '800px', background: '#0d0f14', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '28px' }}>
          <h4 style={{ color: '#fff', marginBottom: '10px' }}>Fast Nationwide Delivery</h4>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '16px' }}>
            All orders placed before 3:00 PM IST are dispatched the same day from our fulfillment hub. Delivery takes 3–5 business days across India.
          </p>
          <h4 style={{ color: '#fff', marginBottom: '10px' }}>7-Day Replacement Guarantee</h4>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
            In the rare event of transit damage or functional defect, we provide a 100% free door-to-door replacement. Every product is covered by our 1-Year Comprehensive Hardware Warranty.
          </p>
        </div>
      )}
    </div>
  );
}
