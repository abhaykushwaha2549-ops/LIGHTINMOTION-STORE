// server/app.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { initSchema } from './db/schema.js';
import { seedDatabase } from './db/seed.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import discountRoutes from './routes/discounts.js';
import orderRoutes from './routes/orders.js';
import customerRoutes from './routes/customers.js';
import analyticsRoutes from './routes/analytics.js';
import contentRoutes from './routes/content.js';
import settingsRoutes from './routes/settings.js';
import paymentRoutes from './routes/payments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize Database & Seed data
try {
  initSchema();
  await seedDatabase();
} catch (e) {
  console.warn('DB Init Note:', e.message);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payment', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'LIGHTINMOTION Backend API (Vercel Serverless & Node.js)',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

export default app;
