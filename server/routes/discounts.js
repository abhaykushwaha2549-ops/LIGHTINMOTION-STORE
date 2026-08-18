// server/routes/discounts.js
import { Router } from 'express';
import db from '../db/database.js';
import { verifyAdmin, optionalCustomer } from '../middleware/auth.js';

const router = Router();

// Server-side discount validator function
export function validateDiscountInternal({ code, subtotal, customerEmail, customerId }) {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Discount code is required.' };
  }

  const cleanCode = code.trim().toUpperCase();
  const discount = db.prepare('SELECT * FROM discounts WHERE UPPER(code) = ?').get(cleanCode);

  if (!discount) {
    return { valid: false, error: `Discount code "${cleanCode}" does not exist.` };
  }

  if (!discount.is_active) {
    return { valid: false, error: `Discount code "${cleanCode}" is currently disabled.` };
  }

  const now = new Date();
  if (discount.start_date && new Date(discount.start_date) > now) {
    return { valid: false, error: `Discount code "${cleanCode}" is not yet active.` };
  }

  if (discount.expiry_date && new Date(discount.expiry_date) < now) {
    return { valid: false, error: `Discount code "${cleanCode}" has expired.` };
  }

  if (discount.usage_limit && discount.usage_count >= discount.usage_limit) {
    return { valid: false, error: `Discount code "${cleanCode}" has reached its maximum global usage limit.` };
  }

  if (customerEmail && discount.usage_limit_per_customer) {
    const userUses = db.prepare(`
      SELECT count(*) as count FROM discount_usage
      WHERE discount_id = ? AND customer_email = ?
    `).get(discount.id, customerEmail.toLowerCase().trim()).count;

    if (userUses >= discount.usage_limit_per_customer) {
      return { valid: false, error: `You have already used discount code "${cleanCode}".` };
    }
  }

  if (discount.min_order_value && subtotal < discount.min_order_value) {
    const diff = (discount.min_order_value - subtotal).toFixed(2);
    return {
      valid: false,
      error: `Add ₹${diff} more to your cart to use discount code "${cleanCode}" (Min order ₹${discount.min_order_value}).`
    };
  }

  if (discount.first_order_only && customerEmail) {
    const priorOrders = db.prepare('SELECT count(*) as count FROM orders WHERE customer_email = ?').get(customerEmail.toLowerCase().trim()).count;
    if (priorOrders > 0) {
      return { valid: false, error: `Discount code "${cleanCode}" is valid only for first-time orders.` };
    }
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (discount.type === 'percentage') {
    discountAmount = (subtotal * discount.amount) / 100;
    if (discount.max_discount_amount) {
      discountAmount = Math.min(discountAmount, discount.max_discount_amount);
    }
  } else {
    // Fixed amount
    discountAmount = discount.amount;
  }

  discountAmount = Math.min(discountAmount, subtotal);
  discountAmount = Math.round(discountAmount * 100) / 100;

  return {
    valid: true,
    discountId: discount.id,
    code: discount.code,
    type: discount.type,
    rate: discount.amount,
    discountAmount,
    finalSubtotal: Math.max(0, subtotal - discountAmount)
  };
}

// ---------------- PUBLIC / CHECKOUT VALIDATION ENDPOINT ----------------
router.post('/validate', optionalCustomer, (req, res) => {
  try {
    const { code, subtotal, customerEmail } = req.body;
    const email = customerEmail || req.customer?.email || null;
    const sub = parseFloat(subtotal) || 0;

    const result = validateDiscountInternal({
      code,
      subtotal: sub,
      customerEmail: email,
      customerId: req.customer?.id || null
    });

    if (!result.valid) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error('Validate discount error:', err);
    res.status(500).json({ valid: false, error: 'Failed to validate discount.' });
  }
});

// ---------------- ADMIN PROTECTED DISCOUNT ENDPOINTS ----------------

// Admin: Get all discounts
router.get('/admin/all', verifyAdmin, (req, res) => {
  try {
    const discounts = db.prepare('SELECT * FROM discounts ORDER BY created_at DESC').all();
    res.json(discounts);
  } catch (err) {
    console.error('Fetch discounts error:', err);
    res.status(500).json({ error: 'Failed to retrieve discounts.' });
  }
});

// Admin: Create Discount
router.post('/admin/create', verifyAdmin, (req, res) => {
  try {
    const {
      code,
      type,
      amount,
      min_order_value,
      max_discount_amount,
      start_date,
      expiry_date,
      usage_limit,
      usage_limit_per_customer,
      is_active,
      first_order_only
    } = req.body;

    if (!code || amount === undefined) {
      return res.status(400).json({ error: 'Discount code and amount are required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = db.prepare('SELECT id FROM discounts WHERE code = ?').get(cleanCode);
    if (existing) {
      return res.status(400).json({ error: `Discount code "${cleanCode}" already exists.` });
    }

    const id = 'disc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    db.prepare(`
      INSERT INTO discounts (
        id, code, type, amount, min_order_value, max_discount_amount,
        start_date, expiry_date, usage_limit, usage_limit_per_customer,
        is_active, first_order_only
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      cleanCode,
      type || 'percentage',
      parseFloat(amount) || 0,
      min_order_value ? parseFloat(min_order_value) : 0,
      max_discount_amount ? parseFloat(max_discount_amount) : null,
      start_date || null,
      expiry_date || null,
      usage_limit ? parseInt(usage_limit) : null,
      usage_limit_per_customer ? parseInt(usage_limit_per_customer) : 1,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      first_order_only ? 1 : 0
    );

    const created = db.prepare('SELECT * FROM discounts WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err) {
    console.error('Create discount error:', err);
    res.status(500).json({ error: 'Failed to create discount.' });
  }
});

// Admin: Update Discount
router.put('/admin/:id', verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM discounts WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Discount not found.' });
    }

    const {
      code,
      type,
      amount,
      min_order_value,
      max_discount_amount,
      start_date,
      expiry_date,
      usage_limit,
      usage_limit_per_customer,
      is_active,
      first_order_only
    } = req.body;

    const cleanCode = code ? code.trim().toUpperCase() : existing.code;

    db.prepare(`
      UPDATE discounts SET
        code = ?,
        type = ?,
        amount = ?,
        min_order_value = ?,
        max_discount_amount = ?,
        start_date = ?,
        expiry_date = ?,
        usage_limit = ?,
        usage_limit_per_customer = ?,
        is_active = ?,
        first_order_only = ?
      WHERE id = ?
    `).run(
      cleanCode,
      type || existing.type,
      amount !== undefined ? parseFloat(amount) : existing.amount,
      min_order_value !== undefined ? (min_order_value ? parseFloat(min_order_value) : 0) : existing.min_order_value,
      max_discount_amount !== undefined ? (max_discount_amount ? parseFloat(max_discount_amount) : null) : existing.max_discount_amount,
      start_date !== undefined ? start_date : existing.start_date,
      expiry_date !== undefined ? expiry_date : existing.expiry_date,
      usage_limit !== undefined ? (usage_limit ? parseInt(usage_limit) : null) : existing.usage_limit,
      usage_limit_per_customer !== undefined ? parseInt(usage_limit_per_customer) : existing.usage_limit_per_customer,
      is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
      first_order_only !== undefined ? (first_order_only ? 1 : 0) : existing.first_order_only,
      id
    );

    const updated = db.prepare('SELECT * FROM discounts WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    console.error('Update discount error:', err);
    res.status(500).json({ error: 'Failed to update discount.' });
  }
});

// Admin: Delete Discount
router.delete('/admin/:id', verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM discounts WHERE id = ?').run(id);
    res.json({ success: true, message: 'Discount deleted.' });
  } catch (err) {
    console.error('Delete discount error:', err);
    res.status(500).json({ error: 'Failed to delete discount.' });
  }
});

export default router;
