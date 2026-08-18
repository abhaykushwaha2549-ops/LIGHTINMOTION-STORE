// server/routes/content.js
import { Router } from 'express';
import db from '../db/database.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = Router();

// Public: Get all content pages list
router.get('/pages', (req, res) => {
  try {
    const pages = db.prepare('SELECT id, slug, title, updated_at FROM content_pages ORDER BY title ASC').all();
    res.json(pages);
  } catch (err) {
    console.error('Fetch pages error:', err);
    res.status(500).json({ error: 'Failed to retrieve pages list.' });
  }
});

// Public: Get single page content by slug
router.get('/pages/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const page = db.prepare('SELECT * FROM content_pages WHERE slug = ?').get(slug);
    if (!page) {
      return res.status(404).json({ error: 'Page not found.' });
    }
    res.json(page);
  } catch (err) {
    console.error('Fetch page detail error:', err);
    res.status(500).json({ error: 'Failed to retrieve page content.' });
  }
});

// Admin: Update content page
router.put('/admin/pages/:slug', verifyAdmin, (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content_html } = req.body;

    const existing = db.prepare('SELECT id FROM content_pages WHERE slug = ?').get(slug);
    if (!existing) {
      const id = 'page_' + Date.now();
      db.prepare(`
        INSERT INTO content_pages (id, slug, title, content_html)
        VALUES (?, ?, ?, ?)
      `).run(id, slug, title || slug, content_html || '');
    } else {
      db.prepare(`
        UPDATE content_pages SET
          title = ?,
          content_html = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE slug = ?
      `).run(title, content_html, slug);
    }

    const updated = db.prepare('SELECT * FROM content_pages WHERE slug = ?').get(slug);
    res.json(updated);
  } catch (err) {
    console.error('Update page error:', err);
    res.status(500).json({ error: 'Failed to update page content.' });
  }
});

export default router;
