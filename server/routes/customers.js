// server/routes/customers.js
import { Router } from 'express';
import db from '../db/database.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = Router();

// Admin: Get all customers
router.get('/admin/all', verifyAdmin, (req, res) => {
  try {
    const customers = db.prepare(`
      SELECT id, name, email, phone, total_spent, orders_count, created_at
      FROM customers
      ORDER BY created_at DESC
    `).all();
    res.json(customers);
  } catch (err) {
    console.error('Fetch customers error:', err);
    res.status(500).json({ error: 'Failed to retrieve customers.' });
  }
});

// Admin: Get Customer detail with orders & address
router.get('/admin/:id', verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const customer = db.prepare('SELECT id, name, email, phone, total_spent, orders_count, created_at FROM customers WHERE id = ?').get(id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    const addresses = db.prepare('SELECT * FROM addresses WHERE customer_id = ?').all(id);
    const orders = db.prepare('SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC').all(customer.email);

    res.json({ customer, addresses, orders });
  } catch (err) {
    console.error('Customer detail error:', err);
    res.status(500).json({ error: 'Failed to retrieve customer details.' });
  }
});

export default router;
