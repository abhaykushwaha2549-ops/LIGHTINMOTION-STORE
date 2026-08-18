// server/db/schema.js
import db from './database.js';

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT,
      total_spent REAL DEFAULT 0.0,
      orders_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      street TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      country TEXT DEFAULT 'India',
      is_default INTEGER DEFAULT 0,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      compare_price REAL,
      cost_per_item REAL,
      sku TEXT,
      barcode TEXT,
      inventory INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER DEFAULT 3,
      category_id TEXT,
      vendor TEXT DEFAULT 'LIGHTINMOTION',
      status TEXT DEFAULT 'Active',
      is_featured INTEGER DEFAULT 0,
      is_new INTEGER DEFAULT 0,
      seo_title TEXT,
      seo_description TEXT,
      options_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_media (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'image',
      url TEXT NOT NULL,
      alt_text TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS discounts (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL DEFAULT 'percentage',
      amount REAL NOT NULL,
      min_order_value REAL DEFAULT 0,
      max_discount_amount REAL,
      start_date DATETIME,
      expiry_date DATETIME,
      usage_limit INTEGER,
      usage_count INTEGER DEFAULT 0,
      usage_limit_per_customer INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      applicable_products_json TEXT,
      first_order_only INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS discount_usage (
      id TEXT PRIMARY KEY,
      discount_id TEXT NOT NULL,
      customer_id TEXT,
      customer_email TEXT NOT NULL,
      order_id TEXT NOT NULL,
      used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_id TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount_code TEXT,
      discount_amount REAL DEFAULT 0.0,
      shipping_charge REAL DEFAULT 0.0,
      tax_amount REAL DEFAULT 0.0,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'UPI',
      payment_status TEXT NOT NULL DEFAULT 'Paid',
      order_status TEXT NOT NULL DEFAULT 'Confirmed',
      tracking_number TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_title TEXT NOT NULL,
      product_sku TEXT,
      variant_name TEXT,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal REAL NOT NULL,
      image_url TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_timeline (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      status TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS content_pages (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      content_html TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL
    );
  `);
  console.log('✅ SQLite Schema initialized successfully.');
}
