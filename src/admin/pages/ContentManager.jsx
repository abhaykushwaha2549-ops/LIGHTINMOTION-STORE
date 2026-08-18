// src/admin/pages/ContentManager.jsx
import React, { useState, useEffect } from 'react';
import { getContentPages, getContentPage, adminUpdateContentPage, getSettings, adminUpdateSettings } from '../../api';
import { FileText, Save, Sparkles, Video, Globe } from 'lucide-react';

export default function ContentManager() {
  const [pages, setPages] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('shipping-policy');
  const [pageTitle, setPageTitle] = useState('');
  const [pageHtml, setPageHtml] = useState('');
  const [loadingPage, setLoadingPage] = useState(false);
  const [savingPage, setSavingPage] = useState(false);

  const [heroHeading, setHeroHeading] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroDesc, setHeroDesc] = useState('');
  const [heroVideoUrl, setHeroVideoUrl] = useState('');
  const [bannerText, setBannerText] = useState('');
  const [savingHero, setSavingHero] = useState(false);

  useEffect(() => {
    getContentPages().then(setPages).catch(() => {});
    getSettings().then((s) => {
      if (s.hero) {
        setHeroHeading(s.hero.heading || '');
        setHeroSubtitle(s.hero.subtitle || '');
        setHeroDesc(s.hero.description || '');
        setHeroVideoUrl(s.hero.videoUrl || '');
        setBannerText(s.hero.bannerText || '');
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

  const handleSaveHero = async (e) => {
    e.preventDefault();
    setSavingHero(true);
    try {
      await adminUpdateSettings({
        hero: {
          heading: heroHeading,
          subtitle: heroSubtitle,
          description: heroDesc,
          videoUrl: heroVideoUrl,
          bannerText
        }
      });
      alert('Homepage hero content updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update settings.');
    } finally {
      setSavingHero(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 className="admin-page-title">Content & Media CMS</h1>
        <p className="admin-page-subtitle">Customize store banners, homepage video background, and legal policy documents.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Column: Homepage Hero & Banner CMS */}
        <div className="admin-card">
          <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Video size={18} color="#008060" />
            <span>Homepage Hero & Announcement Bar</span>
          </h3>

          <form onSubmit={handleSaveHero}>
            <div className="admin-form-group">
              <label className="admin-label">Top Bar Announcement Text</label>
              <input
                type="text"
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                placeholder="FREE SHIPPING ON ORDERS ABOVE ₹999"
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Hero Main Heading</label>
              <input
                type="text"
                value={heroHeading}
                onChange={(e) => setHeroHeading(e.target.value)}
                placeholder="RGB LIGHTING FOR YOUR DESK, TV OR GAMING SETUP"
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Hero Subtitle</label>
              <input
                type="text"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="MINIMAL DESIGN. VIBRANT AMBIENCE."
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Hero Description</label>
              <textarea
                rows={3}
                value={heroDesc}
                onChange={(e) => setHeroDesc(e.target.value)}
                placeholder="Set the colour, brightness and dynamic effects directly from your phone."
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Hero Background Video URL</label>
              <input
                type="url"
                value={heroVideoUrl}
                onChange={(e) => setHeroVideoUrl(e.target.value)}
                placeholder="https://assets.mixkit.co/videos/preview/..."
                className="admin-input"
              />
            </div>

            <button
              type="submit"
              disabled={savingHero}
              className="admin-btn-primary"
            >
              <Save size={16} />
              <span>{savingHero ? 'Saving Hero...' : 'Save Hero Settings'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Policy Document HTML Editor */}
        <div className="admin-card">
          <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="#008060" />
            <span>Policy Document Editor</span>
          </h3>

          <div className="admin-form-group">
            <label className="admin-label">Select Document</label>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="admin-select"
            >
              {pages.map((p) => (
                <option key={p.slug} value={p.slug}>{p.title}</option>
              ))}
            </select>
          </div>

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
              <label className="admin-label">HTML Content</label>
              <textarea
                rows={10}
                value={pageHtml}
                onChange={(e) => setPageHtml(e.target.value)}
                className="admin-input"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
              />
            </div>

            <button
              type="submit"
              disabled={savingPage}
              className="admin-btn-primary"
            >
              <Save size={16} />
              <span>{savingPage ? 'Saving Document...' : 'Save Policy HTML'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
