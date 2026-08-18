// server/routes/settings.js
import { Router } from 'express';
import db from '../db/database.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = Router();

// Public: Get storefront settings
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value_json FROM store_settings').all();
    const settings = {};
    rows.forEach(r => {
      try {
        settings[r.key] = JSON.parse(r.value_json);
      } catch {
        settings[r.key] = r.value_json;
      }
    });

    res.json(settings);
  } catch (err) {
    console.error('Fetch settings error:', err);
    res.status(500).json({ error: 'Failed to retrieve settings.' });
  }
});

// Admin: Update store settings
router.put('/admin', verifyAdmin, (req, res) => {
  try {
    const updates = req.body; // e.g. { general: {...}, shipping: {...}, hero: {...} }

    const updateStmt = db.prepare(`
      INSERT INTO store_settings (key, value_json)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json
    `);

    const transaction = db.transaction(() => {
      for (const [key, value] of Object.entries(updates)) {
        updateStmt.run(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });

    transaction();

    const rows = db.prepare('SELECT key, value_json FROM store_settings').all();
    const result = {};
    rows.forEach(r => {
      try {
        result[r.key] = JSON.parse(r.value_json);
      } catch {
        result[r.key] = r.value_json;
      }
    });

    res.json(result);
  } catch (err) {
    console.error('Save settings error:', err);
    res.status(500).json({ error: 'Failed to save settings.' });
  }
});

export default router;
