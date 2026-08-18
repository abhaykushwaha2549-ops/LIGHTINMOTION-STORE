// src/pages/Shop.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getProducts } from '../api';
import { Play } from 'lucide-react';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Featured');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const data = await getProducts();
        setProducts(data || []);
      } catch (err) {
        console.error('Fetch products error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const categories = [
    'All',
    'Light Ropes & Strings in Lighting',
    'LED Strip Lights',
    'Monitor Lighting',
    'TV & Home Cinema',
    'Floor & Table Lamps'
  ];

  const filtered = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category_id === selectedCategory || p.category_id?.includes(selectedCategory);
    const matchesSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    return 0;
  });

  return (
    <div className="shop-page-wrapper">
      <div className="shop-inner-container">
        {/* Page Title & Subtitle */}
        <div className="shop-header-box">
          <div className="shop-kicker-label">
            LIGHTINMOTION STORE
          </div>
          <h1 className="shop-main-heading">
            ALL AMBIENT HARDWARE
          </h1>
          <p className="shop-sub-description">
            Explore our range of addressable RGB bar lights, flex strips, and screen immersion backlights.
          </p>
        </div>

        {/* Filter and Sort Toolbar */}
        <div className="shop-toolbar-bar">
          <div className="category-pills-row">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-filter-pill ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="sort-dropdown-wrap">
            <span className="sort-label">SORT:</span>
            <div className="sort-select-box">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-native-select"
              >
                <option value="Featured">Featured</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products 4-Column Grid */}
        {loading ? (
          <div className="shop-loading-state">Loading hardware catalog...</div>
        ) : filtered.length === 0 ? (
          <div className="shop-loading-state">No products found matching your filter.</div>
        ) : (
          <div className="shop-products-grid">
            {filtered.map((p) => {
              const primaryMedia = p.media?.[0]?.url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';
              const hasVideo = p.hasVideo || p.media?.some((m) => m.type === 'video') || p.id === 'prod_barlights' || p.id === 'prod_flex_strip';

              return (
                <div
                  key={p.id}
                  className="shop-product-card"
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  <div className="shop-card-media-wrap">
                    <span className="shop-sale-badge">SALE</span>
                    {hasVideo && (
                      <span className="shop-video-badge">
                        <Play size={10} fill="#ffffff" color="#ffffff" />
                        <span>VIDEO</span>
                      </span>
                    )}

                    <img
                      src={primaryMedia}
                      alt={p.title}
                      className="shop-card-image"
                      loading="lazy"
                    />
                  </div>

                  <div className="shop-card-info-wrap">
                    <h3 className="shop-card-title">{p.title}</h3>

                    <div className="shop-card-prices">
                      <span className="shop-card-current-price">
                        Rs. {Number(p.price).toLocaleString('en-IN')}.00
                      </span>
                      {p.compare_price && (
                        <span className="shop-card-compare-price">
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
    </div>
  );
}
