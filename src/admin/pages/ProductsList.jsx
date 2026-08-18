// src/admin/pages/ProductsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminGetProducts, adminDeleteProduct } from '../../api';
import { Plus, Search, Edit2, Trash2, ExternalLink, AlertTriangle } from 'lucide-react';

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminGetProducts();
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await adminDeleteProduct(id);
        loadData();
      } catch (err) {
        alert(err.message || 'Failed to delete product.');
      }
    }
  };

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 className="admin-page-title">Products ({products.length})</h1>
          <p className="admin-page-subtitle">Manage catalog items, pricing, inventory stock, and media assets.</p>
        </div>

        <Link
          to="/admin/products/new"
          style={{
            background: '#008060',
            color: '#ffffff',
            padding: '9px 16px',
            borderRadius: '6px',
            fontWeight: '700',
            fontSize: '0.85rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Plus size={16} />
          <span>Add product</span>
        </Link>
      </div>

      <div className="admin-card">
        {/* Search */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: '10px', left: '12px' }} />
            <input
              type="text"
              placeholder="Search by title, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input"
              style={{ paddingLeft: '36px' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading catalog items...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No products match your search.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Media</th>
                <th>Product</th>
                <th>Status</th>
                <th>Inventory</th>
                <th>Price</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img
                      src={p.media?.[0]?.url || 'https://via.placeholder.com/40'}
                      alt={p.title}
                      style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', background: '#000' }}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{p.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SKU: {p.sku || 'N/A'} • {p.vendor || 'LIGHTINMOTION'}</div>
                  </td>
                  <td>
                    <span style={{
                      background: p.status === 'Active' ? '#e6f4ea' : '#f1f3f4',
                      color: p.status === 'Active' ? '#137333' : '#5f6368',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontWeight: '700',
                        color: p.inventory <= p.low_stock_threshold ? '#dc2626' : '#0f172a'
                      }}>
                        {p.inventory} in stock
                      </span>
                      {p.inventory <= p.low_stock_threshold && (
                        <AlertTriangle size={14} color="#dc2626" title="Low stock alert" />
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '700' }}>₹{Number(p.price).toLocaleString('en-IN')}.00</div>
                    {p.compare_price && (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                        ₹{Number(p.compare_price).toLocaleString('en-IN')}.00
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <Link
                        to={`/product/${p.id}`}
                        target="_blank"
                        className="admin-btn-secondary"
                        style={{ padding: '6px 8px' }}
                        title="Preview on storefront"
                      >
                        <ExternalLink size={14} />
                      </Link>

                      <Link
                        to={`/admin/products/edit/${p.id}`}
                        className="admin-btn-secondary"
                        style={{ padding: '6px 8px' }}
                        title="Edit product"
                      >
                        <Edit2 size={14} />
                      </Link>

                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="admin-btn-secondary"
                        style={{ padding: '6px 8px', color: '#dc2626' }}
                        title="Delete product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
