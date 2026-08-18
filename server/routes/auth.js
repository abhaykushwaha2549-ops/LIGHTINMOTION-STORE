// server/routes/auth.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/database.js';
import { JWT_SECRET, verifyCustomer } from '../middleware/auth.js';

const router = Router();

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(email.trim().toLowerCase(), 'admin');
    if (!user) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Customer Registration
router.post('/customer/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = db.prepare('SELECT id FROM customers WHERE email = ?').get(email.trim().toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const customerId = 'cust_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    db.prepare(`
      INSERT INTO customers (id, name, email, phone, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `).run(customerId, name.trim(), email.trim().toLowerCase(), phone?.trim() || null, password_hash);

    const token = jwt.sign(
      { id: customerId, name, email: email.trim().toLowerCase(), role: 'customer' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      customer: { id: customerId, name, email: email.trim().toLowerCase(), phone }
    });
  } catch (err) {
    console.error('Customer register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Customer Login
router.post('/customer/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(email.trim().toLowerCase());
    if (!customer || !customer.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(password, customer.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: customer.id, name: customer.name, email: customer.email, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone }
    });
  } catch (err) {
    console.error('Customer login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Get Current Customer Profile & Orders
router.get('/customer/me', verifyCustomer, (req, res) => {
  try {
    const customer = db.prepare(`
      SELECT id, name, email, phone, total_spent, orders_count, created_at
      FROM customers WHERE id = ?
    `).get(req.customer.id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    const addresses = db.prepare('SELECT * FROM addresses WHERE customer_id = ?').all(customer.id);
    const orders = db.prepare(`
      SELECT id, order_number, subtotal, discount_amount, shipping_charge, total_amount, payment_method, payment_status, order_status, created_at
      FROM orders WHERE customer_email = ?
      ORDER BY created_at DESC
    `).all(customer.email);

    res.json({ customer, addresses, orders });
  } catch (err) {
    console.error('Customer me error:', err);
    res.status(500).json({ error: 'Failed to fetch customer profile.' });
  }
});

export default router;
