// src/db/storeDb.js
// Client-side IndexedDB persistence for products, media blobs, settings, and orders

const DB_NAME = 'LightinmotionDB';
const DB_VERSION = 2;

// Default Seed Products matching reference images exactly
const DEFAULT_PRODUCTS = [
  {
    id: 'prod-barlights',
    title: 'Barlights',
    handle: 'barlights',
    description: `<h3>LIGHTINMOTION RGB Bar Lights</h3>
<p>Transform your gaming setup, desk, and room atmosphere with the <strong>LIGHTINMOTION RGB Bar Lights</strong> — designed to deliver immersive ambient lighting with a sleek modern look. Perfect for gaming rooms, streaming setups, bedrooms, TVs, and workspaces.</p>
<p>These premium RGB light bars create vibrant lighting effects that sync beautifully with your environment, adding depth and style to your setup. Control colors, brightness, and dynamic lighting modes directly from your smartphone for a fully customizable experience.</p>
<h4>Features</h4>
<ul>
  <li>Premium RGB ambient bar lights with solid wooden base mounts</li>
  <li>Modern minimalist vertical lighting design</li>
  <li>Bright and immersive lighting effects</li>
  <li>Mobile app control support</li>
  <li>Multiple dynamic RGB modes and animations</li>
  <li>Adjustable brightness and colors</li>
  <li>Perfect for gaming setups, TVs, desks, and room décor</li>
  <li>Easy plug-and-play installation</li>
  <li>Smooth diffused lighting for premium aesthetics</li>
</ul>`,
    price: 1899.00,
    comparePrice: 2499.00,
    status: 'Active',
    vendor: 'LIGHTINMOTION',
    category: 'Light Ropes & Strings in Lighting',
    collections: ['Home page', 'Ambient Lighting', 'Best Sellers'],
    tags: ['RGB', 'Desk Setup', 'Ambient', 'Smart Light'],
    inventory: 8,
    location: 'Main Warehouse',
    sku: 'LIM-BAR-001',
    barcode: '890123456701',
    weight: 450,
    options: {
      color: ['Black', 'Clear', 'White'],
      lightingFeatures: ['LED lighting', 'Adjustable brightness', 'Color temp sync', 'Remote App'],
      powerSource: 'USB 5V/2A',
      suitableSpace: 'Indoors / Desk'
    },
    media: [
      {
        id: 'm1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
        alt: 'Barlights Gaming Setup Pair'
      },
      {
        id: 'm2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
        alt: 'Barlights on Minimal Desk'
      },
      {
        id: 'm3',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-glowing-led-strip-on-a-desk-42171-large.mp4',
        alt: 'RGB Barlights Dynamic Glow Video'
      }
    ]
  },
  {
    id: 'prod-rgb-flex-strip',
    title: 'LIGHTINMOTION Smart RGB Flex Strip',
    handle: 'smart-rgb-flex-strip',
    description: `<h3>Smart Addressable RGB Neon Flex Strip</h3>
<p>Bring fluid, diffused neon lighting to any space. Bendable silicone design with music sync technology and smart app automation.</p>
<ul>
  <li>Segmented color control (multiple colors simultaneously)</li>
  <li>Music rhythm microphone sensor sync</li>
  <li>Voice assistant compatible (Alexa & Google Assistant)</li>
  <li>IP67 Waterproof silicone tubing</li>
</ul>`,
    price: 1499.00,
    comparePrice: null,
    status: 'Active',
    vendor: 'LIGHTINMOTION',
    category: 'LED Strip Lights',
    collections: ['Home page', 'Flex Strips'],
    tags: ['Strip', 'Neon', 'Flex', 'Smart App'],
    inventory: 15,
    location: 'Main Warehouse',
    sku: 'LIM-STRP-002',
    barcode: '890123456702',
    weight: 300,
    options: {
      color: ['RGBIC Neon', 'Warm Glow'],
      lightingFeatures: ['Addressable IC', 'Music Sync', 'App Control'],
      powerSource: 'USB / 12V Adapter',
      suitableSpace: 'Indoors / Gaming Desk'
    },
    media: [
      {
        id: 'm4',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
        alt: 'Smart RGB Flex Strip Box and Coil'
      },
      {
        id: 'm5',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-lights-in-a-computer-room-33100-large.mp4',
        alt: 'RGB Flex Strip in action'
      }
    ]
  },
  {
    id: 'prod-monitor-backlight',
    title: 'Monitor Backlight',
    handle: 'monitor-backlight',
    description: `<h3>Immersive Screen-Mirror Monitor RGB Light</h3>
<p>Reduce eye strain and expand your gameplay across your wall with real-time screen color reproduction for monitors from 24" to 34".</p>
<ul>
  <li>Zero-latency PC screen sync software included</li>
  <li>Customizable zones and gradient presets</li>
  <li>Easy clip-on corner mounts</li>
</ul>`,
    price: 1599.00,
    comparePrice: 1899.00,
    status: 'Active',
    vendor: 'LIGHTINMOTION',
    category: 'Monitor Lighting',
    collections: ['Home page', 'PC Gaming'],
    tags: ['Monitor', 'Backlight', 'Screen Sync'],
    inventory: 12,
    location: 'Main Warehouse',
    sku: 'LIM-MON-003',
    barcode: '890123456703',
    weight: 350,
    options: {
      color: ['Stealth Black'],
      lightingFeatures: ['Screen Sync', 'Eye Comfort Mode'],
      powerSource: 'USB 3.0',
      suitableSpace: 'Monitor Back'
    },
    media: [
      {
        id: 'm6',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800&q=80',
        alt: 'Monitor Backlight Setup'
      }
    ]
  },
  {
    id: 'prod-tv-backlight',
    title: 'TV Backlight',
    handle: 'tv-backlight',
    description: `<h3>Camera-Immersion TV Backlight System (55-75")</h3>
<p>Turn your living room into an IMAX experience. The smart visual sensor tracks on-screen colors and projects matching dynamic hues onto the wall in real time.</p>
<ul>
  <li>Accurate color capture camera</li>
  <li>Fits TVs from 55" to 75"</li>
  <li>Movie, Gaming, and Music synchronization modes</li>
</ul>`,
    price: 1599.00,
    comparePrice: 3549.00,
    status: 'Active',
    vendor: 'LIGHTINMOTION',
    category: 'TV & Home Cinema',
    collections: ['Home page', 'Living Room'],
    tags: ['TV', 'Cinema', 'Camera Sync'],
    inventory: 20,
    location: 'Main Warehouse',
    sku: 'LIM-TV-004',
    barcode: '890123456704',
    weight: 600,
    options: {
      color: ['Black Frame'],
      lightingFeatures: ['Envisual Camera Tracking', 'Dual Bar Support'],
      powerSource: 'AC Wall Adapter',
      suitableSpace: 'Living Room TV'
    },
    media: [
      {
        id: 'm7',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80',
        alt: 'TV Backlight Living Room Setup'
      }
    ]
  },
  {
    id: 'prod-lamp-light',
    title: 'Lamp Light',
    handle: 'lamp-light',
    description: `<h3>Nordic Minimalist RGB Corner Atmosphere Floor Lamp</h3>
<p>Modern standing linear corner lamp with 16 million colors, 300+ dynamic effects, and sound responsiveness for modern living spaces.</p>
<ul>
  <li>Space-saving 90-degree corner base</li>
  <li>Premium aluminum alloy casing</li>
  <li>RF Remote control + Smartphone App</li>
</ul>`,
    price: 1899.00,
    comparePrice: 2599.00,
    status: 'Active',
    vendor: 'LIGHTINMOTION',
    category: 'Floor & Table Lamps',
    collections: ['Home page', 'Living Room', 'Ambient Lighting'],
    tags: ['Lamp', 'Corner Light', 'Floor Lamp'],
    inventory: 5,
    location: 'Main Warehouse',
    sku: 'LIM-LMP-005',
    barcode: '890123456705',
    weight: 1200,
    options: {
      color: ['Matte Black', 'Brushed Silver'],
      lightingFeatures: ['Music Sync', 'Corner Fit', 'Stepless Dimming'],
      powerSource: '12V Adapter',
      suitableSpace: 'Corner / Bedroom / Studio'
    },
    media: [
      {
        id: 'm8',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80',
        alt: 'Corner Lamp Light Ambience'
      }
    ]
  }
];

const DEFAULT_SETTINGS = {
  hero: {
    kicker: 'SYNC. AMBIENT. IMMERSIVE.',
    titleLine1: 'LIGHT UP',
    titleLine2: 'YOUR SPACE',
    description: 'Premium RGB lighting solutions to elevate your setup, sync with your world, and vibe your way.',
    imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1920&q=80',
    bannerText: 'FREE SHIPPING ON ORDERS ABOVE ₹999'
  },
  announcement: 'FREE SHIPPING ON ORDERS ABOVE ₹999',
  storeName: 'LIGHTINMOTION',
  currency: 'Rs.',
  currencySymbol: '₹',
  contactEmail: 'support@lightinmotion.store',
  phone: '+91 98765 43210'
};

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('orders')) {
        db.createObjectStore('orders', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('blobs')) {
        db.createObjectStore('blobs', { keyPath: 'id' });
      }
    };

    request.onsuccess = (e) => {
      resolve(e.target.result);
    };

    request.onerror = (e) => {
      console.error('IndexedDB open error:', e);
      reject(e);
    };
  });
}

export async function initializeDatabase() {
  const db = await openDatabase();
  
  const productsCount = await new Promise((resolve) => {
    const tx = db.transaction('products', 'readonly');
    const countReq = tx.objectStore('products').count();
    countReq.onsuccess = () => resolve(countReq.result);
    countReq.onerror = () => resolve(0);
  });

  if (productsCount === 0) {
    const tx = db.transaction('products', 'readwrite');
    const store = tx.objectStore('products');
    DEFAULT_PRODUCTS.forEach((prod) => store.put(prod));
    await new Promise((res) => { tx.oncomplete = res; });
  }

  const settingsCount = await new Promise((resolve) => {
    const tx = db.transaction('settings', 'readonly');
    const countReq = tx.objectStore('settings').count();
    countReq.onsuccess = () => resolve(countReq.result);
    countReq.onerror = () => resolve(0);
  });

  if (settingsCount === 0) {
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    store.put({ key: 'main_settings', value: DEFAULT_SETTINGS });
    await new Promise((res) => { tx.oncomplete = res; });
  }
}

export async function getAllProducts() {
  await initializeDatabase();
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('products', 'readonly');
    const store = tx.objectStore('products');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || DEFAULT_PRODUCTS);
    req.onerror = () => resolve(DEFAULT_PRODUCTS);
  });
}

export async function getProductById(id) {
  await initializeDatabase();
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('products', 'readonly');
    const store = tx.objectStore('products');
    const req = store.get(id);
    req.onsuccess = () => {
      if (req.result) return resolve(req.result);
      const fallback = DEFAULT_PRODUCTS.find((p) => p.id === id || p.handle === id);
      resolve(fallback || null);
    };
    req.onerror = () => resolve(null);
  });
}

export async function saveProduct(product) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('products', 'readwrite');
    const store = tx.objectStore('products');
    const req = store.put(product);
    req.onsuccess = () => resolve(product);
    req.onerror = (err) => reject(err);
  });
}

export async function deleteProduct(id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('products', 'readwrite');
    const store = tx.objectStore('products');
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = (err) => reject(err);
  });
}

export async function getSettings() {
  await initializeDatabase();
  const db = await openDatabase();
  return new Promise((resolve) => {
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const req = store.get('main_settings');
    req.onsuccess = () => {
      resolve(req.result ? req.result.value : DEFAULT_SETTINGS);
    };
    req.onerror = () => resolve(DEFAULT_SETTINGS);
  });
}

export async function saveSettings(settingsData) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    const req = store.put({ key: 'main_settings', value: settingsData });
    req.onsuccess = () => resolve(settingsData);
    req.onerror = (err) => reject(err);
  });
}

export async function storeMediaBlob(blobFile, type = 'image') {
  const db = await openDatabase();
  const id = 'blob_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction('blobs', 'readwrite');
    const store = tx.objectStore('blobs');
    const blobRecord = {
      id,
      type,
      fileName: blobFile.name,
      mimeType: blobFile.type,
      blob: blobFile,
      createdAt: Date.now()
    };
    const req = store.put(blobRecord);
    req.onsuccess = () => {
      const objectUrl = URL.createObjectURL(blobFile);
      resolve({
        id,
        type,
        url: objectUrl,
        blobId: id,
        fileName: blobFile.name
      });
    };
    req.onerror = (err) => reject(err);
  });
}

export async function getMediaBlobUrl(blobId) {
  const db = await openDatabase();
  return new Promise((resolve) => {
    const tx = db.transaction('blobs', 'readonly');
    const store = tx.objectStore('blobs');
    const req = store.get(blobId);
    req.onsuccess = () => {
      if (req.result && req.result.blob) {
        resolve(URL.createObjectURL(req.result.blob));
      } else {
        resolve(null);
      }
    };
    req.onerror = () => resolve(null);
  });
}

export async function createOrder(order) {
  const db = await openDatabase();
  const newOrder = {
    ...order,
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    createdAt: new Date().toISOString(),
    status: 'Paid / Processing'
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('orders', 'readwrite');
    const store = tx.objectStore('orders');
    const req = store.put(newOrder);
    req.onsuccess = () => resolve(newOrder);
    req.onerror = (err) => reject(err);
  });
}

export async function getAllOrders() {
  await initializeDatabase();
  const db = await openDatabase();
  return new Promise((resolve) => {
    const tx = db.transaction('orders', 'readonly');
    const store = tx.objectStore('orders');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
}

export async function exportDatabaseBackup() {
  const products = await getAllProducts();
  const settings = await getSettings();
  const orders = await getAllOrders();
  
  const backup = {
    appName: 'LIGHTINMOTION E-Commerce',
    version: '1.0',
    exportDate: new Date().toISOString(),
    products,
    settings,
    orders
  };
  
  return JSON.stringify(backup, null, 2);
}

export async function importDatabaseBackup(jsonString) {
  const data = JSON.parse(jsonString);
  const db = await openDatabase();

  if (Array.isArray(data.products)) {
    const tx = db.transaction('products', 'readwrite');
    const store = tx.objectStore('products');
    await new Promise((res) => {
      store.clear().onsuccess = res;
    });
    for (const p of data.products) {
      store.put(p);
    }
  }

  if (data.settings) {
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    store.put({ key: 'main_settings', value: data.settings });
  }

  return true;
}

export async function resetDatabaseToDefaults() {
  const db = await openDatabase();
  const tx = db.transaction(['products', 'settings', 'orders', 'blobs'], 'readwrite');
  tx.objectStore('products').clear();
  tx.objectStore('settings').clear();
  tx.objectStore('orders').clear();
  tx.objectStore('blobs').clear();
  await new Promise((res) => { tx.oncomplete = res; });
  await initializeDatabase();
  return true;
}
