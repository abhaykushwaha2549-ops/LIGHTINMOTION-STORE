// server/routes/products.js
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db/database.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6) + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max for video files
});

// Helper to format product with media & parsed options
function formatProduct(productRow) {
  if (!productRow) return null;
  const media = db.prepare('SELECT * FROM product_media WHERE product_id = ? ORDER BY sort_order ASC').all(productRow.id);
  let options = {};
  try {
    options = productRow.options_json ? JSON.parse(productRow.options_json) : {};
  } catch {}

  return {
    ...productRow,
    options,
    media: media || []
  };
}

// ---------------- PUBLIC STOREFRONT PRODUCT ENDPOINTS ----------------

// Get all active products
router.get('/', (req, res) => {
  try {
    const { category, featured, search } = req.query;
    let query = "SELECT * FROM products WHERE status = 'Active'";
    const params = [];

    if (category && category !== 'All') {
      query += ' AND (category_id = ? OR category_id IN (SELECT id FROM categories WHERE name = ?))';
      params.push(category, category);
    }
    if (featured === 'true' || featured === '1') {
      query += ' AND is_featured = 1';
    }
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR sku LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY created_at DESC';

    const products = db.prepare(query).all(...params);
    const formatted = products.map(formatProduct);

    res.json(formatted);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

// Get single product by ID or Slug
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const product = db.prepare('SELECT * FROM products WHERE id = ? OR slug = ?').get(id, id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json(formatProduct(product));
  } catch (err) {
    console.error('Fetch product detail error:', err);
    res.status(500).json({ error: 'Failed to retrieve product details.' });
  }
});

// ---------------- ADMIN PROTECTED PRODUCT ENDPOINTS ----------------

// Admin: Get all products (including Drafts)
router.get('/admin/all', verifyAdmin, (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    const formatted = products.map(formatProduct);
    res.json(formatted);
  } catch (err) {
    console.error('Admin fetch products error:', err);
    res.status(500).json({ error: 'Failed to retrieve products catalog.' });
  }
});

// Admin: Upload Media Files (images & videos)
router.post('/admin/upload', verifyAdmin, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    const uploaded = req.files.map((file) => {
      const isVideo = file.mimetype.startsWith('video/');
      return {
        url: `/uploads/${file.filename}`,
        type: isVideo ? 'video' : 'image',
        fileName: file.originalname,
        size: file.size
      };
    });

    res.json({ files: uploaded });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'File upload failed.' });
  }
});

// Admin: Create Product
router.post('/admin/create', verifyAdmin, (req, res) => {
  try {
    const {
      title,
      description,
      price,
      compare_price,
      cost_per_item,
      sku,
      barcode,
      inventory,
      low_stock_threshold,
      category_id,
      vendor,
      status,
      is_featured,
      is_new,
      seo_title,
      seo_description,
      options,
      media
    } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({ error: 'Title and price are required.' });
    }

    const id = 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substr(2, 4);

    db.prepare(`
      INSERT INTO products (
        id, title, slug, description, price, compare_price, cost_per_item, sku, barcode,
        inventory, low_stock_threshold, category_id, vendor, status, is_featured, is_new,
        seo_title, seo_description, options_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title.trim(),
      slug,
      description || '',
      parseFloat(price) || 0,
      compare_price ? parseFloat(compare_price) : null,
      cost_per_item ? parseFloat(cost_per_item) : null,
      sku?.trim() || null,
      barcode?.trim() || null,
      parseInt(inventory) || 0,
      parseInt(low_stock_threshold) || 3,
      category_id || null,
      vendor || 'LIGHTINMOTION',
      status || 'Active',
      is_featured ? 1 : 0,
      is_new ? 1 : 0,
      seo_title || null,
      seo_description || null,
      options ? JSON.stringify(options) : null
    );

    if (Array.isArray(media)) {
      const insertMedia = db.prepare(`
        INSERT INTO product_media (id, product_id, type, url, alt_text, sort_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      media.forEach((m, idx) => {
        const mId = 'm_' + Date.now() + '_' + idx;
        insertMedia.run(mId, id, m.type || 'image', m.url, m.alt || title, idx);
      });
    }

    const created = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.status(201).json(formatProduct(created));
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

// Admin: Update Product
router.put('/admin/:id', verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const {
      title,
      description,
      price,
      compare_price,
      cost_per_item,
      sku,
      barcode,
      inventory,
      low_stock_threshold,
      category_id,
      vendor,
      status,
      is_featured,
      is_new,
      seo_title,
      seo_description,
      options,
      media
    } = req.body;

    db.prepare(`
      UPDATE products SET
        title = ?,
        description = ?,
        price = ?,
        compare_price = ?,
        cost_per_item = ?,
        sku = ?,
        barcode = ?,
        inventory = ?,
        low_stock_threshold = ?,
        category_id = ?,
        vendor = ?,
        status = ?,
        is_featured = ?,
        is_new = ?,
        seo_title = ?,
        seo_description = ?,
        options_json = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title !== undefined ? title.trim() : existing.title,
      description !== undefined ? description : existing.description,
      price !== undefined ? parseFloat(price) : existing.price,
      compare_price !== undefined ? (compare_price ? parseFloat(compare_price) : null) : existing.compare_price,
      cost_per_item !== undefined ? (cost_per_item ? parseFloat(cost_per_item) : null) : existing.cost_per_item,
      sku !== undefined ? sku : existing.sku,
      barcode !== undefined ? barcode : existing.barcode,
      inventory !== undefined ? parseInt(inventory) : existing.inventory,
      low_stock_threshold !== undefined ? parseInt(low_stock_threshold) : existing.low_stock_threshold,
      category_id !== undefined ? category_id : existing.category_id,
      vendor !== undefined ? vendor : existing.vendor,
      status !== undefined ? status : existing.status,
      is_featured !== undefined ? (is_featured ? 1 : 0) : existing.is_featured,
      is_new !== undefined ? (is_new ? 1 : 0) : existing.is_new,
      seo_title !== undefined ? seo_title : existing.seo_title,
      seo_description !== undefined ? seo_description : existing.seo_description,
      options !== undefined ? JSON.stringify(options) : existing.options_json,
      id
    );

    // Update media if provided
    if (Array.isArray(media)) {
      db.prepare('DELETE FROM product_media WHERE product_id = ?').run(id);
      const insertMedia = db.prepare(`
        INSERT INTO product_media (id, product_id, type, url, alt_text, sort_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      media.forEach((m, idx) => {
        const mId = 'm_' + Date.now() + '_' + idx;
        insertMedia.run(mId, id, m.type || 'image', m.url, m.alt || title || existing.title, idx);
      });
    }

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json(formatProduct(updated));
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

// Admin: Delete Product
router.delete('/admin/:id', verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

export default router;
