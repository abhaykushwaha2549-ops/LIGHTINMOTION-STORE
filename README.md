# LIGHTINMOTION — Standalone E-Commerce Platform

Official standalone e-commerce website and merchant administration panel for **LIGHTINMOTION**, engineered for high-performance ambient RGB and PC setup hardware.

---

## ⚡ Features

* **Hardware Brand Design**: Sleek dark interface, responsive 4-column product catalog, media gallery with video preview badges, and interactive color variant selector.
* **Real Server-Side Discount Engine**: 10-step server validation (`POST /api/discounts/validate`) with minimum order value checks, expiry validation, and usage limits.
* **Real Inventory Tracking**: Relational database inventory that atomically decrements upon order placement and automatically restocks on cancellation/refund.
* **Customer Authentication & Order Tracking**: Customer registration, secure login, saved addresses, order history, and instant order tracking by order number (`LIM-XXXXXX`).
* **Shopify-Style Merchant Admin Panel**:
  - Live analytics dashboard (revenue, daily trend, low stock inventory warnings).
  - Product catalog manager with image and MP4 video uploads.
  - Order manager with live status updates, courier tracking ID assignment, and timeline event logging.
  - Coupon discount manager.
  - Content CMS (announcement banner, homepage hero video, legal policy pages).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Full-Stack Local Server
```bash
npm run dev
```

* **Storefront**: [http://localhost:5173](http://localhost:5173)
* **Shop**: [http://localhost:5173/shop](http://localhost:5173/shop)
* **Admin Dashboard**: [http://localhost:5173/admin](http://localhost:5173/admin)
* **Default Admin Login**: `admin@lightinmotion.store` / `admin123`

---

## 📦 Deployment to Vercel

1. Push this repository to your GitHub account.
2. Connect your GitHub repository to [Vercel](https://vercel.com).
3. Set build command to `npm run build` and output directory to `dist`.
4. Deploy!
