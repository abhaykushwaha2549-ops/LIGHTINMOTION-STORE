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
  Video,
  Film,
  Upload,
  Check,
  Play
} from 'lucide-react';

export default function ContentManager() {
  const [settings, setSettings] = useState(null);

  // Ad Video State
  const [adVideoUrl, setAdVideoUrl] = useState('https://assets.mixkit.co/videos/preview/mixkit-glowing-led-strip-on-a-desk-42171-large.mp4');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [savingVideo, setSavingVideo] = useState(false);

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
      if (s?.adVideoUrl) {
        setAdVideoUrl(s.adVideoUrl);
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

  // Upload Local Ad Video File
  const handleAdVideoFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingVideo(true);
    try {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = async () => {
        const dataUrl = reader.result;
        let finalUrl = dataUrl;

        try {
          const form = new FormData();
          form.append('media', file);
          const res = await adminUploadFiles(form);
          if (res?.files?.[0]?.url) {
            finalUrl = res.files[0].url;
          }
        } catch (err) {
          console.warn('Video upload note:', err);
        }

        setAdVideoUrl(finalUrl);
        setUploadingVideo(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      alert('Video upload failed: ' + err.message);
      setUploadingVideo(false);
    }
  };

  // Save Ad Video Settings
  const handleSaveAdVideo = async (e) => {
    e.preventDefault();
    if (!adVideoUrl) {
      alert('Please select a video file or enter a video URL.');
      return;
    }

    setSavingVideo(true);
    try {
      await adminUpdateSettings({ adVideoUrl });
      alert('Running Ad Video updated successfully! It is now live and running on the homepage right before "OUR PRODUCTS".');
    } catch (err) {
      alert(err.message || 'Failed to update ad video.');
    } finally {
      setSavingVideo(false);
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
        <h1 className="admin-page-title">Content & Video Ad Manager</h1>
        <p className="admin-page-subtitle">Upload running ad video for homepage, and edit legal policy documents.</p>
      </div>

      {/* Section 1: Homepage Running Video Ad Banner Manager */}
      <div className="admin-card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--adm-border)', paddingBottom: '14px' }}>
          <div>
            <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Film size={20} color="#2563eb" />
              <span>Homepage Seamless Running Video Ad (No Text, Edge Faded)</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              This video will loop continuously right before the "OUR PRODUCTS" section on your store homepage, seamlessly faded into the dark background on all edges.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveAdVideo}
            disabled={savingVideo}
            className="btn-adm-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={16} />
            <span>{savingVideo ? 'Publishing Video...' : 'Publish Video Ad'}</span>
          </button>
        </div>

        <form onSubmit={handleSaveAdVideo} style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <label className="admin-label">Upload Video File (.mp4 / .webm) *</label>
              <input
                type="file"
                accept="video/*"
                onChange={handleAdVideoFileUpload}
                style={{ fontSize: '0.85rem' }}
              />
              {uploadingVideo && <span style={{ fontSize: '0.78rem', color: '#2563eb', display: 'block', marginTop: '6px' }}>Uploading video...</span>}
            </div>

            <div>
              <label className="admin-label">Or Paste Direct Video URL (.mp4 / video link)</label>
              <input
                type="text"
                placeholder="https://assets.mixkit.co/.../video.mp4"
                value={adVideoUrl}
                onChange={(e) => setAdVideoUrl(e.target.value)}
                className="admin-input"
              />
            </div>
          </div>

          {/* Live Video Preview Box */}
          {adVideoUrl && (
            <div>
              <label className="admin-label" style={{ marginBottom: '8px', display: 'block' }}>Live Video Preview (Edge-Faded):</label>
              <div style={{ position: 'relative', width: '100%', maxWidth: '720px', height: '280px', background: '#17171a', borderRadius: '12px', overflow: 'hidden' }}>
                <video
                  src={adVideoUrl}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  boxShadow: 'inset 0 0 60px 30px #17171a'
                }} />
              </div>
            </div>
          )}
        </form>
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
