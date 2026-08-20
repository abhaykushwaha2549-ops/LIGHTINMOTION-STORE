// src/admin/pages/ContentManager.jsx
import React, { useState, useEffect } from 'react';
import {
  getContentPages,
  getContentPage,
  adminUpdateContentPage,
  getSettings,
  adminUpdateSettings,
  adminUploadFiles
} from '../../api';
import {
  FileText,
  Save,
  Sparkles,
  Video,
  Globe,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  Film,
  Eye,
  Check
} from 'lucide-react';

export default function ContentManager() {
  const [settings, setSettings] = useState(null);
  const [showcaseMedia, setShowcaseMedia] = useState([]);

  // New Media Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newCategory, setNewCategory] = useState('Desk Setup');
  const [newMediaType, setNewMediaType] = useState('image');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [savingMedia, setSavingMedia] = useState(false);

  // Policy Pages State
  const [pages, setPages] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('shipping-policy');
  const [pageTitle, setPageTitle] = useState('');
  const [pageHtml, setPageHtml] = useState('');
  const [loadingPage, setLoadingPage] = useState(false);
  const [savingPage, setSavingPage] = useState(false);

  useEffect(() => {
    getContentPages().then(setPages).catch(() => {});
    getSettings().then((s) => {
      setSettings(s);
      if (Array.isArray(s.showcaseMedia)) {
        setShowcaseMedia(s.showcaseMedia);
      } else {
        setShowcaseMedia([
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
          }
        ]);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedSlug) {
      setLoadingPage(true);
      getContentPage(selectedSlug)
        .then((p) => {
          setPageTitle(p.title || '');
          setPageHtml(p.content_html || '');
        })
        .catch(() => {})
        .finally(() => setLoadingPage(false));
    }
  }, [selectedSlug]);

  // Upload Local File (Image / Video)
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const file = files[0];
      const isVideo = file.type.startsWith('video/');

      // Local preview data URL fallback
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result;

        // Upload to server endpoint if online
        let finalUrl = dataUrl;
        try {
          const form = new FormData();
          form.append('media', file);
          const res = await adminUploadFiles(form);
          if (res?.files?.[0]?.url) {
            finalUrl = res.files[0].url;
          }
        } catch (err) {
          console.warn('File upload server note:', err);
        }

        setNewMediaUrl(finalUrl);
        setNewMediaType(isVideo ? 'video' : 'image');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('Upload failed: ' + err.message);
      setUploading(false);
    }
  };

  // Add Item to Showcase Media List
  const handleAddMediaItem = (e) => {
    e.preventDefault();
    if (!newMediaUrl) {
      alert('Please upload a file or enter a media URL.');
      return;
    }

    const newItem = {
      id: 'showcase_' + Date.now(),
      title: newTitle || (newMediaType === 'video' ? 'Ambient Lighting Video' : 'Customer Setup Image'),
      caption: newCaption,
      category: newCategory,
      type: newMediaType,
      url: newMediaUrl,
      created_at: new Date().toISOString()
    };

    const updatedList = [newItem, ...showcaseMedia];
    setShowcaseMedia(updatedList);

    // Reset Form
    setNewTitle('');
    setNewCaption('');
    setNewMediaUrl('');
  };

  // Delete Media Item
  const handleDeleteMedia = (id) => {
    if (!window.confirm('Delete this showcase media item?')) return;
    const updated = showcaseMedia.filter((m) => m.id !== id);
    setShowcaseMedia(updated);
  };

  // Save Showcase Media Settings
  const handleSaveShowcaseSettings = async () => {
    setSavingMedia(true);
    try {
      await adminUpdateSettings({ showcaseMedia });
      alert('Showcase Media Gallery updated successfully! Customers can now view your uploaded images & videos on the homepage.');
    } catch (err) {
      alert(err.message || 'Failed to save showcase settings.');
    } finally {
      setSavingMedia(false);
    }
  };

  // Save Policy Page
  const handleSavePage = async (e) => {
    e.preventDefault();
    setSavingPage(true);
    try {
      await adminUpdateContentPage(selectedSlug, {
        title: pageTitle,
        content_html: pageHtml
      });
      alert('Policy page updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update page.');
    } finally {
      setSavingPage(false);
    }
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="admin-page-title">Content & Media CMS</h1>
        <p className="admin-page-subtitle">Upload setup videos & photos for customer showcase gallery, and edit policy pages.</p>
      </div>

      {/* Section 1: Customer Ambient Setup Showcase Manager (Images & Videos) */}
      <div className="admin-card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--adm-border)', paddingBottom: '14px' }}>
          <div>
            <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Film size={20} color="#2563eb" />
              <span>Customer Setup Showcase Gallery (Images & Videos)</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              Media uploaded here will display in an interactive gallery right before the "OUR PRODUCTS" section on your store homepage.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveShowcaseSettings}
            disabled={savingMedia}
            className="btn-adm-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={16} />
            <span>{savingMedia ? 'Publishing...' : 'Publish Showcase Gallery'}</span>
          </button>
        </div>

        {/* Upload & Add Media Form */}
        <form onSubmit={handleAddMediaItem} style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: '700', marginBottom: '14px', color: '#1e293b' }}>
            + Upload New Setup Image or Video
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="admin-label">Title / Caption *</label>
              <input
                type="text"
                placeholder="e.g. RGB Barlights Gaming Desk Setup"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="admin-input"
              >
                <option value="Desk Setup">Desk Setup</option>
                <option value="Videos">Videos</option>
                <option value="Living Room">Living Room</option>
                <option value="Ambient Bar">Ambient Bar</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Media Type</label>
              <select
                value={newMediaType}
                onChange={(e) => setNewMediaType(e.target.value)}
                className="admin-input"
              >
                <option value="image">Image (Photo)</option>
                <option value="video">Video (MP4 / WebM / Embed)</option>
              </select>
            </div>
          </div>

          {/* File Upload Box or URL */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <label className="admin-label">Choose File (Upload Image / Video) *</label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                style={{ fontSize: '0.82rem' }}
              />
              {uploading && <span style={{ fontSize: '0.78rem', color: '#2563eb', marginLeft: '8px' }}>Uploading file...</span>}
            </div>

            <div>
              <label className="admin-label">Or Paste Media URL (Image / Video URL)</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/... or .mp4"
                value={newMediaUrl}
                onChange={(e) => setNewMediaUrl(e.target.value)}
                className="admin-input"
              />
            </div>
          </div>

          {/* Media Preview Box */}
          {newMediaUrl && (
            <div style={{ marginBottom: '16px', padding: '12px', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', maxWidth: '320px' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', marginBottom: '6px' }}>Preview:</div>
              {newMediaType === 'video' ? (
                <video src={newMediaUrl} controls style={{ width: '100%', maxHeight: '180px', borderRadius: '6px' }} />
              ) : (
                <img src={newMediaUrl} alt="Preview" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '6px' }} />
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn-adm-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Add Item to Gallery</span>
          </button>
        </form>

        {/* Existing Showcase Gallery Grid */}
        <div>
          <h4 style={{ fontSize: '0.92rem', fontWeight: '700', marginBottom: '14px', color: '#1e293b' }}>
            Currently Uploaded Showcase Items ({showcaseMedia.length})
          </h4>

          {showcaseMedia.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
              No showcase media items uploaded yet. Upload images & videos above.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              {showcaseMedia.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '160px', background: '#000' }}>
                    {item.type === 'video' ? (
                      <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src={item.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}

                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: 'rgba(0, 0, 0, 0.75)',
                      color: '#fff',
                      fontSize: '0.68rem',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>
                      {item.type === 'video' ? '🎬 VIDEO' : '📸 PHOTO'}
                    </span>
                  </div>

                  <div style={{ padding: '12px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Category: <strong>{item.category || 'General'}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteMedia(item.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #fca5a5',
                        color: '#ef4444',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        marginTop: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Policy Pages CMS */}
      <div className="admin-card">
        <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FileText size={20} color="#008060" />
          <span>Legal Policy Pages (Shipping, Refund, Privacy)</span>
        </h3>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {pages.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => setSelectedSlug(p.slug)}
              className={`btn-adm-secondary ${selectedSlug === p.slug ? 'active' : ''}`}
              style={{
                background: selectedSlug === p.slug ? '#008060' : undefined,
                color: selectedSlug === p.slug ? '#fff' : undefined
              }}
            >
              {p.title}
            </button>
          ))}
        </div>

        {loadingPage ? (
          <div>Loading page content...</div>
        ) : (
          <form onSubmit={handleSavePage}>
            <div className="admin-form-group">
              <label className="admin-label">Page Title</label>
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Page Content (HTML / Text)</label>
              <textarea
                rows={10}
                value={pageHtml}
                onChange={(e) => setPageHtml(e.target.value)}
                className="admin-textarea"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
              />
            </div>

            <button type="submit" disabled={savingPage} className="btn-adm-primary">
              <Save size={16} />
              <span>{savingPage ? 'Saving Policy...' : 'Save Policy Page'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
