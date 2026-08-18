// src/admin/pages/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getProduct,
  adminCreateProduct,
  adminUpdateProduct,
  adminUploadFiles
} from '../../api';
import {
  ArrowLeft,
  Upload,
  X,
  Play,
  Save,
  Trash2,
  Plus
} from 'lucide-react';

export default function ProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    compare_price: '',
    cost_per_item: '',
    sku: '',
    barcode: '',
    inventory: '10',
    low_stock_threshold: '3',
    status: 'Active',
    category_id: 'Light Ropes & Strings in Lighting',
    vendor: 'LIGHTINMOTION',
    options: {
      color: ['Black', 'Clear', 'White'],
      lightingFeatures: ['LED lighting', 'Adjustable brightness', 'Color temp sync', 'Remote App'],
      powerSource: 'USB 5V/2A DC',
      suitableSpace: 'Indoors / Gaming Desk / Workspace'
    },
    media: []
  });

  const [newColorInput, setNewColorInput] = useState('');

  useEffect(() => {
    if (isEditing) {
      async function load() {
        try {
          const data = await getProduct(id);
          setFormData({
            title: data.title || '',
            slug: data.slug || '',
            description: data.description || '',
            price: data.price !== undefined ? String(data.price) : '',
            compare_price: data.compare_price !== undefined ? String(data.compare_price) : '',
            cost_per_item: data.cost_per_item !== undefined ? String(data.cost_per_item) : '',
            sku: data.sku || '',
            barcode: data.barcode || '',
            inventory: data.inventory !== undefined ? String(data.inventory) : '0',
            low_stock_threshold: data.low_stock_threshold !== undefined ? String(data.low_stock_threshold) : '3',
            status: data.status || 'Active',
            category_id: data.category_id || 'Light Ropes & Strings in Lighting',
            vendor: data.vendor || 'LIGHTINMOTION',
            options: data.options || { color: ['Black'] },
            media: data.media || []
          });
        } catch (err) {
          console.error('Error fetching product for edit:', err);
          alert('Failed to load product.');
        } finally {
          setLoading(false);
        }
      }
      load();
    }
  }, [id, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const data = new FormData();
      for (let i = 0; i < files.length; i++) {
        data.append('files', files[i]);
      }

      const res = await adminUploadFiles(data);
      if (res.files && res.files.length > 0) {
        setFormData((prev) => ({
          ...prev,
          media: [...prev.media, ...res.files]
        }));
      }
    } catch (err) {
      alert(err.message || 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMedia = (index) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, idx) => idx !== index)
    }));
  };

  const handleAddColor = () => {
    if (newColorInput.trim() && !formData.options.color?.includes(newColorInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        options: {
          ...prev.options,
          color: [...(prev.options.color || []), newColorInput.trim()]
        }
      }));
      setNewColorInput('');
    }
  };

  const handleRemoveColor = (col) => {
    setFormData((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        color: prev.options.color.filter((c) => c !== col)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        cost_per_item: formData.cost_per_item ? parseFloat(formData.cost_per_item) : null,
        sku: formData.sku,
        barcode: formData.barcode,
        inventory: parseInt(formData.inventory) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 3,
        status: formData.status,
        category_id: formData.category_id,
        vendor: formData.vendor,
        options: formData.options,
        media: formData.media
      };

      if (isEditing) {
        await adminUpdateProduct(id, payload);
      } else {
        await adminCreateProduct(payload);
      }

      navigate('/admin/products');
    } catch (err) {
      alert(err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', color: '#64748b' }}>Loading product details...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/admin/products" className="admin-btn-secondary" style={{ padding: '8px' }}>
            <ArrowLeft size={16} />
          </Link>
          <h1 className="admin-page-title">{isEditing ? `Edit ${formData.title}` : 'Add Product'}</h1>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="admin-btn-primary"
        >
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save product'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Left Column: Title, Description, Media, Variants */}
        <div>
          {/* Title & Description Card */}
          <div className="admin-card">
            <div className="admin-form-group">
              <label className="admin-label">Title *</label>
              <input
                type="text"
                required
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Barlights"
                className="admin-input"
              />
            </div>

            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-label">Description</label>
              <textarea
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe this hardware fixture..."
                className="admin-input"
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Media Card (Images and Videos via Multer) */}
          <div className="admin-card">
            <h3 className="admin-card-title">Media Assets</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '14px' }}>
              Upload product photos and demonstration videos.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              {formData.media.map((m, idx) => (
                <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', background: '#000' }}>
                  {m.type === 'video' ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
                      <Play size={24} color="#fff" />
                    </div>
                  ) : (
                    <img src={m.url} alt={`Media ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(idx)}
                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(220, 38, 38, 0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              <label style={{
                aspectRatio: '1',
                borderRadius: '6px',
                border: '2px dashed #cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: '#f8fafc',
                color: '#64748b',
                fontSize: '0.75rem',
                gap: '4px'
              }}>
                <Upload size={20} />
                <span>{uploading ? 'Uploading...' : 'Add media'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="admin-card">
            <h3 className="admin-card-title">Pricing</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="1899.00"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Compare-at Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="compare_price"
                  value={formData.compare_price}
                  onChange={handleInputChange}
                  placeholder="2499.00"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Cost per Item (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="cost_per_item"
                  value={formData.cost_per_item}
                  onChange={handleInputChange}
                  placeholder="950.00"
                  className="admin-input"
                />
              </div>
            </div>
          </div>

          {/* Inventory Card */}
          <div className="admin-card">
            <h3 className="admin-card-title">Inventory Tracking</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px' }}>
              <div className="admin-form-group">
                <label className="admin-label">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="LIM-BAR-001"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Barcode (ISBN/UPC)</label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  placeholder="890123456789"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Available Stock *</label>
                <input
                  type="number"
                  required
                  name="inventory"
                  value={formData.inventory}
                  onChange={handleInputChange}
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Low Stock Threshold</label>
                <input
                  type="number"
                  name="low_stock_threshold"
                  value={formData.low_stock_threshold}
                  onChange={handleInputChange}
                  className="admin-input"
                />
              </div>
            </div>
          </div>

          {/* Color Variants Card */}
          <div className="admin-card">
            <h3 className="admin-card-title">Color Variants</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {formData.options?.color?.map((col) => (
                <span
                  key={col}
                  style={{
                    background: '#0f172a',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{col}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(col)}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="New color (e.g. Matte Gray)"
                value={newColorInput}
                onChange={(e) => setNewColorInput(e.target.value)}
                className="admin-input"
                style={{ flexGrow: 1 }}
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="admin-btn-secondary"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Category Organization */}
        <div>
          <div className="admin-card">
            <h3 className="admin-card-title">Status</h3>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="admin-select"
            >
              <option value="Active">Active (Visible in Store)</option>
              <option value="Draft">Draft (Hidden)</option>
            </select>
          </div>

          <div className="admin-card">
            <h3 className="admin-card-title">Product Organization</h3>
            <div className="admin-form-group">
              <label className="admin-label">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="admin-select"
              >
                <option value="Light Ropes & Strings in Lighting">Light Ropes & Strings in Lighting</option>
                <option value="LED Strip Lights">LED Strip Lights</option>
                <option value="Monitor Lighting">Monitor Lighting</option>
                <option value="TV & Home Cinema">TV & Home Cinema</option>
                <option value="Floor & Table Lamps">Floor & Table Lamps</option>
              </select>
            </div>

            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-label">Vendor</label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleInputChange}
                className="admin-input"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
