// server/db/seed.js
import db from './database.js';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  // Check if admin user already exists
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@lightinmotion.store');
  if (!existingAdmin) {
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('usr_admin_01', 'LIGHTINMOTION Admin', 'admin@lightinmotion.store', adminPasswordHash, 'admin');
    console.log('👤 Admin user seeded: admin@lightinmotion.store / admin123');
  }

  // Check demo customer
  const existingCustomer = db.prepare('SELECT id FROM customers WHERE email = ?').get('customer@example.com');
  if (!existingCustomer) {
    const customerPassHash = await bcrypt.hash('pass123', 10);
    db.prepare(`
      INSERT INTO customers (id, name, email, phone, password_hash, total_spent, orders_count)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('cust_demo_01', 'Abhay Sharma', 'customer@example.com', '+91 98765 43210', customerPassHash, 3798.0, 2);
  }

  // Check categories
  const categoriesCount = db.prepare('SELECT count(*) as count FROM categories').get().count;
  if (categoriesCount === 0) {
    const categories = [
      { id: 'cat_barlights', name: 'Light Ropes & Strings in Lighting', slug: 'light-ropes-strings', description: 'Modular desktop & ambient bar fixtures' },
      { id: 'cat_strips', name: 'LED Strip Lights', slug: 'led-strip-lights', description: 'Flexible diffused silicone addressable strips' },
      { id: 'cat_monitor', name: 'Monitor Lighting', slug: 'monitor-lighting', description: 'Zero-lag screen-mirroring backlights' },
      { id: 'cat_tv', name: 'TV & Home Cinema', slug: 'tv-home-cinema', description: 'Camera-sync immersive home theater lighting' },
      { id: 'cat_lamp', name: 'Floor & Table Lamps', slug: 'floor-table-lamps', description: 'Modern corner linear ambient lamps' }
    ];

    const insertCat = db.prepare('INSERT INTO categories (id, name, slug, description) VALUES (?, ?, ?, ?)');
    categories.forEach(c => insertCat.run(c.id, c.name, c.slug, c.description));
  }

  // Check products
  const productsCount = db.prepare('SELECT count(*) as count FROM products').get().count;
  if (productsCount === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (
        id, title, slug, description, price, compare_price, cost_per_item, sku, barcode,
        inventory, low_stock_threshold, category_id, vendor, status, is_featured, is_new,
        seo_title, seo_description, options_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMedia = db.prepare(`
      INSERT INTO product_media (id, product_id, type, url, alt_text, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // 1. Barlights
    insertProduct.run(
      'prod_barlights',
      'Barlights',
      'barlights',
      `<p>Upgrade your setup with minimal design and powerful lighting. The LIGHTINMOTION RGB Bar Lights bring the perfect ambient glow to your gaming room, desk, or any space.</p>
<h4>Features</h4>
<ul>
  <li>Dual light bars with aluminum housing</li>
  <li>Customizable RGB lighting modes and animations</li>
  <li>Smartphone app control and physical base buttons</li>
  <li>Direct USB power with included heavy wooden base mounts</li>
  <li>Music rhythm synchronization and screen mirroring</li>
</ul>`,
      1899.00,
      2499.00,
      850.00,
      'LIM-BAR-001',
      '890123456701',
      8,
      3,
      'cat_barlights',
      'LIGHTINMOTION',
      'Active',
      1,
      0,
      'Barlights — Dual Ambient RGB Desk Fixtures',
      'Minimalist ambient bar lighting for desks, gaming setups, and monitors.',
      JSON.stringify({
        color: ['Black', 'Clear', 'White'],
        lightingFeatures: ['LED lighting', 'Adjustable brightness', 'Color temp sync', 'Remote App'],
        powerSource: 'USB 5V/2A',
        suitableSpace: 'Indoors / Desk'
      })
    );

    insertMedia.run('m_bar_1', 'prod_barlights', 'image', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80', 'Barlights pair with wooden bases', 0);
    insertMedia.run('m_bar_2', 'prod_barlights', 'image', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80', 'Barlights gaming setup behind monitor', 1);
    insertMedia.run('m_bar_3', 'prod_barlights', 'image', 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80', 'Single bar light on base', 2);
    insertMedia.run('m_bar_4', 'prod_barlights', 'video', 'https://assets.mixkit.co/videos/preview/mixkit-glowing-led-strip-on-a-desk-42171-large.mp4', 'Dynamic glow video reel', 3);

    // 2. Smart RGB Flex Strip
    insertProduct.run(
      'prod_flex_strip',
      'LIGHTINMOTION Smart RGB Flex Strip',
      'smart-rgb-flex-strip',
      `<p>Flexible, addressable neon LED strip light for under-desk, wall, or setup perimeter glow. Seamless diffused lighting with zero visible LED hot spots.</p>`,
      1499.00,
      1999.00,
      600.00,
      'LIM-STRP-002',
      '890123456702',
      15,
      3,
      'cat_strips',
      'LIGHTINMOTION',
      'Active',
      1,
      1,
      'LIGHTINMOTION Smart RGB Flex Strip',
      'Diffused neon smart light strip with mobile app and Wi-Fi sync.',
      JSON.stringify({
        color: ['RGBIC Neon', 'Warm White'],
        lightingFeatures: ['Addressable IC', 'Music Sync', 'App Control'],
        powerSource: 'USB / 12V Adapter',
        suitableSpace: 'Desk / Wall / Ceiling'
      })
    );
    insertMedia.run('m_strp_1', 'prod_flex_strip', 'image', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80', 'Smart RGB Flex Strip Box and Coil', 0);
    insertMedia.run('m_strp_2', 'prod_flex_strip', 'video', 'https://assets.mixkit.co/videos/preview/mixkit-lights-in-a-computer-room-33100-large.mp4', 'Flex strip demo video', 1);

    // 3. Monitor Backlight
    insertProduct.run(
      'prod_monitor_backlight',
      'Monitor Backlight',
      'monitor-backlight',
      `<p>Immersion screen-mirroring RGB lighting kit for 24" to 34" monitors. Syncs on-screen colors to your wall in real-time with zero lag.</p>`,
      1599.00,
      1899.00,
      700.00,
      'LIM-MON-003',
      '890123456703',
      12,
      3,
      'cat_monitor',
      'LIGHTINMOTION',
      'Active',
      1,
      0,
      'Monitor Backlight — Screen Sync Immersion',
      'Real-time screen color reproduction for PC gaming monitors.',
      JSON.stringify({
        color: ['Stealth Black'],
        lightingFeatures: ['Screen Sync', 'Eye Comfort Mode'],
        powerSource: 'USB 3.0',
        suitableSpace: 'PC Monitor'
      })
    );
    insertMedia.run('m_mon_1', 'prod_monitor_backlight', 'image', 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1000&q=80', 'Monitor Backlight PC Setup', 0);

    // 4. TV Backlight
    insertProduct.run(
      'prod_tv_backlight',
      'TV Backlight',
      'tv-backlight',
      `<p>Dynamic visual camera-sync and HDMI-sync ambient TV backlight kit suitable for 55" to 75" TVs. Transform movies and games into room-filling theater visuals.</p>`,
      1599.00,
      3549.00,
      800.00,
      'LIM-TV-004',
      '890123456704',
      20,
      3,
      'cat_tv',
      'LIGHTINMOTION',
      'Active',
      1,
      0,
      'TV Backlight — Camera-Immersion Kit',
      'Ambient lighting system for 55-75 inch televisions.',
      JSON.stringify({
        color: ['Black Frame'],
        lightingFeatures: ['Camera Tracking', 'Dual Bar Support'],
        powerSource: 'AC Wall Adapter',
        suitableSpace: 'Living Room TV'
      })
    );
    insertMedia.run('m_tv_1', 'prod_tv_backlight', 'image', 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1000&q=80', 'TV Backlight Living Room Setup', 0);

    // 5. Lamp Light
    insertProduct.run(
      'prod_lamp_light',
      'Lamp Light',
      'lamp-light',
      `<p>Minimalist corner standing atmosphere LED floor lamp with 16 million colors, stepless dimming, and sound rhythm pulse responsiveness.</p>`,
      1899.00,
      2599.00,
      900.00,
      'LIM-LMP-005',
      '890123456705',
      5,
      2,
      'cat_lamp',
      'LIGHTINMOTION',
      'Active',
      1,
      0,
      'Lamp Light — Minimalist RGB Corner Lamp',
      'Corner standing atmospheric lamp with phone app and remote control.',
      JSON.stringify({
        color: ['Matte Black', 'Brushed Silver'],
        lightingFeatures: ['Music Sync', 'Corner Fit', 'Stepless Dimming'],
        powerSource: '12V Adapter',
        suitableSpace: 'Corner / Studio'
      })
    );
    insertMedia.run('m_lmp_1', 'prod_lamp_light', 'image', 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80', 'Lamp Light Studio Corner', 0);

    console.log('📦 5 Core LIGHTINMOTION products seeded.');
  }

  // Check discounts
  const discountsCount = db.prepare('SELECT count(*) as count FROM discounts').get().count;
  if (discountsCount === 0) {
    const insertDisc = db.prepare(`
      INSERT INTO discounts (
        id, code, type, amount, min_order_value, max_discount_amount,
        start_date, expiry_date, usage_limit, usage_count, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertDisc.run(
      'disc_welcome10',
      'WELCOME10',
      'percentage',
      10.0,
      999.0,
      500.0,
      '2026-01-01T00:00:00Z',
      '2026-12-31T23:59:59Z',
      1000,
      0,
      1
    );

    insertDisc.run(
      'disc_light500',
      'LIGHT500',
      'fixed',
      500.0,
      2500.0,
      500.0,
      '2026-01-01T00:00:00Z',
      '2026-12-31T23:59:59Z',
      500,
      0,
      1
    );
    console.log('🏷️ Discount codes seeded: WELCOME10 (10% off), LIGHT500 (₹500 off).');
  }

  // Check store settings
  const settingsCount = db.prepare('SELECT count(*) as count FROM store_settings').get().count;
  if (settingsCount === 0) {
    const insertSetting = db.prepare('INSERT INTO store_settings (key, value_json) VALUES (?, ?)');

    insertSetting.run('general', JSON.stringify({
      storeName: 'LIGHTINMOTION',
      storeEmail: 'contact@lightinmotion.store',
      supportEmail: 'support@lightinmotion.store',
      phone: '+91 98765 43210',
      currency: 'Rs.',
      currencySymbol: '₹',
      country: 'India',
      timezone: 'Asia/Kolkata'
    }));

    insertSetting.run('shipping', JSON.stringify({
      freeShippingThreshold: 999,
      standardShippingCharge: 99,
      estimatedDeliveryDays: '3-5 business days'
    }));

    insertSetting.run('hero', JSON.stringify({
      heading: 'RGB LIGHTING FOR YOUR DESK, TV OR GAMING SETUP',
      subtitle: 'MINIMAL DESIGN. VIBRANT AMBIENCE.',
      description: 'Set the colour, brightness and effects directly from your phone.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-lights-in-a-computer-room-33100-large.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80',
      bannerText: 'FREE SHIPPING ON ORDERS ABOVE ₹999'
    }));

    insertSetting.run('taxes', JSON.stringify({
      enabled: true,
      ratePercentage: 18,
      includedInPrice: true
    }));

    insertSetting.run('payment', JSON.stringify({
      upiEnabled: true,
      cardsEnabled: true,
      codEnabled: true,
      testMode: true
    }));

    console.log('⚙️ Store settings seeded.');
  }

  // Check content pages
  const pagesCount = db.prepare('SELECT count(*) as count FROM content_pages').get().count;
  if (pagesCount === 0) {
    const insertPage = db.prepare('INSERT INTO content_pages (id, slug, title, content_html) VALUES (?, ?, ?, ?)');

    insertPage.run('page_about', 'about-us', 'About Us', `
      <h2>Engineered for Minimal Desk & Entertainment Spaces</h2>
      <p>LIGHTINMOTION designs high-performance ambient and addressable RGB lighting systems. We focus on clean industrial aesthetics, seamless software control, and durable aluminum construction.</p>
      <p>Headquartered in Baddi, India, our team develops lighting solutions that integrate directly into everyday workstations, streaming battle stations, and home theaters.</p>
    `);

    insertPage.run('page_faq', 'faq', 'Frequently Asked Questions', `
      <h3>How do I control the lights?</h3>
      <p>All LIGHTINMOTION fixtures connect via Bluetooth and 2.4GHz Wi-Fi through our companion iOS and Android app. Select hardware models also include physical base buttons and RF remotes.</p>
      <h3>Does screen mirroring require software?</h3>
      <p>Our Monitor Backlight kit includes our lightweight Windows/macOS desktop client with zero input lag. Our TV Backlight system uses an optical sensor camera, requiring no software installation on your TV.</p>
      <h3>What is the warranty period?</h3>
      <p>Every product is backed by a 1-Year Comprehensive Replacement Warranty against any manufacturing defects.</p>
    `);

    insertPage.run('page_shipping', 'shipping-policy', 'Shipping Policy', `
      <p>We provide nationwide delivery across India. Orders are processed within 24-48 business hours.</p>
      <ul>
        <li><strong>Orders above ₹999:</strong> FREE standard shipping (3-5 business days)</li>
        <li><strong>Orders below ₹999:</strong> Flat ₹99 standard shipping</li>
        <li>Tracking details are emailed and accessible under Track Order once dispatched.</li>
      </ul>
    `);

    insertPage.run('page_returns', 'return-policy', 'Return & Replacement Policy', `
      <p>We offer a hassle-free <strong>7-Day Replacement Policy</strong> for any items received with transit damage, defects, or missing accessories. Simply contact our support team with an unboxing video to initiate a return pickup.</p>
    `);

    insertPage.run('page_privacy', 'privacy-policy', 'Privacy Policy', `
      <p>We respect your privacy. Customer names, shipping addresses, and contact numbers are used strictly for order fulfillment and customer support communication. We never sell your personal information.</p>
    `);

    insertPage.run('page_terms', 'terms-conditions', 'Terms & Conditions', `
      <p>By placing an order on LIGHTINMOTION, you agree to our standard terms of service, payment processing policies, and product warranty guidelines.</p>
    `);
  }
}
