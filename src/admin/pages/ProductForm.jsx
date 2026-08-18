// src/admin/pages/ProductForm.jsx
import React, { useState, useEffect, useRef } from 'react';
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
  Plus,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';

export default function ProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

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

  // Convert File to Base64 Data URL (Universal Fallback)
  const readFileAsDataUrl = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          fileName: file.name,
          size: file.size
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // Dual-mode Upload: Try server upload, fallback instantly to Base64
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);

    try {
      // 1. Try Backend Upload
      const data = new FormData();
      files.forEach((f) => data.append('files', f));

      let uploadedMedia = [];
      try {
        const res = await adminUploadFiles(data);
        if (res?.files && res.files.length > 0) {
          uploadedMedia = res.files;
        }
      } catch (uploadErr) {
        console.warn('Backend upload skipped, generating data URLs:', uploadErr);
      }

      // 2. If backend didn't return files, convert to data URLs
      if (uploadedMedia.length === 0) {
        uploadedMedia = await Promise.all(files.map(readFileAsDataUrl));
      }

      setFormData((prev) => ({
        ...prev,
        media: [...prev.media, ...uploadedMedia]
      }));
    } catch (err) {
      console.error('File upload error:', err);
      alert('Failed to process image/video.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddMediaByUrl = () => {
    if (!urlInput.trim()) return;
    const isVideo = urlInput.endsWith('.mp4') || urlInput.includes('video');
    const newMediaItem = {
      url: urlInput.trim(),
      type: isVideo ? 'video' : 'image',
      fileName: urlInput.split('/').pop() || 'Media Item'
    };

    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, newMediaItem]
    }));
    setUrlInput('');
    setShowUrlInput(false);
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
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a product title.');
      return;
    }
    if (!formData.price) {
      alert('Please enter a valid product price.');
      return;
    }

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

          {/* Media Card (Images and Videos) */}
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 className="admin-card-title" style={{ margin: 0 }}>Media Assets (Images & Videos)</h3>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="admin-btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                <LinkIcon size={12} />
                <span>Add from URL</span>
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '14px' }}>
              Upload product photos (JPG, PNG, WebP) and demonstration videos (MP4, WebM).
            </p>

            {/* URL Input Bar */}
            {showUrlInput && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <input
                  type="url"
                  placeholder="Paste image or video URL (e.g. https://images.unsplash.com/... or .mp4)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="admin-input"
                  style={{ flexGrow: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddMediaByUrl}
                  className="admin-btn-primary"
                  style={{ padding: '6px 14px' }}
                >
                  Add URL
                </button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              {formData.media.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #cbd5e1',
                    background: '#0a0c10',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                  }}
                >
                  {m.type === 'video' ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#38bdf8' }}>
                      <Play size={28} />
                      <span style={{ fontSize: '10px', fontWeight: '700', marginTop: '4px', textTransform: 'uppercase' }}>Video Clip</span>
                    </div>
                  ) : (
                    <img
                      src={m.url}
                      alt={m.alt || `Media ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(idx)}
                    title="Remove media"
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      backgroundColor: 'rgba(239, 68, 68, 0.95)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* Upload Trigger Tile */}
              <label
                style={{
                  aspectRatio: '1',
                  borderRadius: '8px',
                  border: '2px dashed #94a3b8',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#f8fafc',
                  color: '#475569',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  gap: '6px',
                  transition: 'background-color 0.2s, border-color 0.2s'
                }}
              >
                <Upload size={22} color="#2563eb" />
                <span>{uploading ? 'Processing...' : 'Upload Media'}</span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Images & Videos</span>
                <input
                  ref={fileInputRef}
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
                <label className="admin-label">Low Stock Alert</label>
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
