// server/routes/analytics.js
import { Router } from 'express';
import db from '../db/database.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/admin', verifyAdmin, (req, res) => {
  try {
    const { range = '30d' } = req.query;

    // 1. Total revenue
    const totalSalesRow = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM orders
      WHERE order_status NOT IN ('Cancelled', 'Refunded')
    `).get();

    // 2. Sales Today
    const todaySalesRow = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total, COUNT(*) as count
      FROM orders
      WHERE DATE(created_at) = DATE('now')
      AND order_status NOT IN ('Cancelled', 'Refunded')
    `).get();

    // 3. Orders counts by status
    const totalOrdersCount = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const pendingOrdersCount = db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status IN ('Pending', 'Confirmed', 'Processing')").get().count;
    const deliveredOrdersCount = db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'Delivered'").get().count;
    const cancelledOrdersCount = db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status IN ('Cancelled', 'Refunded')").get().count;

    // 4. Customers & Products count
    const customersCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
    const productsCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const activeDiscountsCount = db.prepare('SELECT COUNT(*) as count FROM discounts WHERE is_active = 1').get().count;

    // 5. Low stock products
    const lowStockProducts = db.prepare(`
      SELECT id, title, sku, inventory, low_stock_threshold, price
      FROM products
      WHERE inventory <= low_stock_threshold
      ORDER BY inventory ASC
    `).all();

    // 6. Top selling products
    const topProducts = db.prepare(`
      SELECT
        oi.product_id,
        oi.product_title,
        SUM(oi.quantity) as units_sold,
        SUM(oi.subtotal) as total_revenue,
        MAX(oi.image_url) as image_url
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.order_status NOT IN ('Cancelled', 'Refunded')
      GROUP BY oi.product_id, oi.product_title
      ORDER BY units_sold DESC
      LIMIT 5
    `).all();

    // 7. Sales over time (last 14 days)
    const salesOverTime = db.prepare(`
      SELECT
        DATE(created_at) as date,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as order_count
      FROM orders
      WHERE order_status NOT IN ('Cancelled', 'Refunded')
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) DESC
      LIMIT 14
    `).all().reverse();

    res.json({
      summary: {
        totalSales: totalSalesRow.total,
        todaySales: todaySalesRow.total,
        ordersToday: todaySalesRow.count,
        totalOrders: totalOrdersCount,
        pendingOrders: pendingOrdersCount,
        completedOrders: deliveredOrdersCount,
        cancelledOrders: cancelledOrdersCount,
        totalCustomers: customersCount,
        totalProducts: productsCount,
        activeDiscounts: activeDiscountsCount,
        averageOrderValue: totalOrdersCount > 0 ? (totalSalesRow.total / totalOrdersCount).toFixed(2) : 0
      },
      lowStockProducts,
      topProducts,
      salesOverTime
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to calculate analytics.' });
  }
});

export default router;
