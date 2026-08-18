// src/pages/PolicyPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getContentPage } from '../api';
import { ChevronRight, FileText } from 'lucide-react';

export default function PolicyPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      setLoading(true);
      try {
        const data = await getContentPage(slug);
        setPage(data);
      } catch (err) {
        console.error('Fetch policy page error:', err);
        setPage(null);
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '80px auto', padding: '0 24px', textAlign: 'center', color: '#38bdf8' }}>
        Loading policy content...
      </div>
    );
  }

  if (!page) {
    return (
      <div style={{ maxWidth: '900px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <h2>Policy Page Not Found</h2>
        <p style={{ color: '#94a3b8', margin: '14px 0 24px' }}>The requested document could not be located.</p>
        <Link to="/" className="btn-primary-blue">Back to Home</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto 100px', padding: '0 24px' }}>
      <nav className="breadcrumbs">
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <span>Policies</span>
        <ChevronRight size={14} />
        <span className="active-crumb">{page.title}</span>
      </nav>

      <div style={{ background: '#0d0f14', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '40px 36px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          {page.title}
        </h1>

        <div
          dangerouslySetInnerHTML={{ __html: page.content_html }}
          style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '0.95rem' }}
        />

        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', color: '#64748b' }}>
          Last updated: {new Date(page.updated_at).toLocaleDateString()} • LIGHTINMOTION Legal & Compliance
        </div>
      </div>
    </div>
  );
}
