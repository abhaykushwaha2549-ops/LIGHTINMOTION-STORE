// server/routes/orders.js
import { Router } from 'express';
import db from '../db/database.js';
import { verifyAdmin, optionalCustomer } from '../middleware/auth.js';
import { validateDiscountInternal } from './discounts.js';

const router = Router();

// ---------------- PUBLIC / CUSTOMER ORDER CREATION ----------------

router.post('/create', optionalCustomer, (req, res) => {
  try {
    const { customer, items, discountCode, paymentMethod } = req.body;

    if (!customer || !customer.name || !customer.email || !customer.phone || !customer.address) {
      return res.status(400).json({ error: 'Complete shipping address and contact details are required.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty. Please add items to checkout.' });
    }

    // Step 1: Server-side validation of all products, prices, and stock
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product with ID "${item.productId}" no longer exists.` });
      }

      if (product.status !== 'Active') {
        return res.status(400).json({ error: `"${product.title}" is currently unavailable.` });
      }

      const requestedQty = parseInt(item.quantity) || 1;
      if (requestedQty <= 0) {
        return res.status(400).json({ error: `Invalid quantity for "${product.title}".` });
      }

      if (product.inventory < requestedQty) {
        return res.status(400).json({
          error: `Sorry, only ${product.inventory} units of "${product.title}" are available in stock.`
        });
      }

      // Fetch primary media
      const primaryMedia = db.prepare('SELECT url FROM product_media WHERE product_id = ? ORDER BY sort_order ASC LIMIT 1').get(product.id);

      const itemSubtotal = product.price * requestedQty;
      subtotal += itemSubtotal;

      validatedItems.push({
        productId: product.id,
        title: product.title,
        sku: product.sku || 'N/A',
        variantName: item.variantName || 'Standard',
        price: product.price,
        quantity: requestedQty,
        subtotal: itemSubtotal,
        imageUrl: primaryMedia ? primaryMedia.url : ''
      });
    }

    // Step 2: Validate discount code if provided
    let discountAmount = 0;
    let appliedDiscountId = null;

    if (discountCode && discountCode.trim()) {
      const discountResult = validateDiscountInternal({
        code: discountCode,
        subtotal,
        customerEmail: customer.email,
        customerId: req.customer?.id || null
      });

      if (!discountResult.valid) {
        return res.status(400).json({ error: discountResult.error });
      }

      discountAmount = discountResult.discountAmount;
      appliedDiscountId = discountResult.discountId;
    }

    // Step 3: Fetch shipping settings
    const shippingSetting = db.prepare('SELECT value_json FROM store_settings WHERE key = ?').get('shipping');
    let freeShippingThreshold = 999;
    let standardShippingCharge = 99;

    if (shippingSetting) {
      try {
        const s = JSON.parse(shippingSetting.value_json);
        if (s.freeShippingThreshold !== undefined) freeShippingThreshold = s.freeShippingThreshold;
        if (s.standardShippingCharge !== undefined) standardShippingCharge = s.standardShippingCharge;
      } catch {}
    }

    const shippingCharge = subtotal >= freeShippingThreshold ? 0 : standardShippingCharge;
    const finalTotal = Math.max(0, subtotal - discountAmount + shippingCharge);

    const orderId = 'ord_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const orderNumber = 'LIM-' + Math.floor(100000 + Math.random() * 900000);

    const fullShippingAddress = `${customer.address}, ${customer.city || ''}, ${customer.state || ''} - ${customer.pincode || ''}, ${customer.country || 'India'}`;

    // Step 4: Execute database transaction
    const executeTransaction = db.transaction(() => {
      // 1. Insert into orders table
      db.prepare(`
        INSERT INTO orders (
          id, order_number, customer_id, customer_name, customer_email, customer_phone,
          shipping_address, subtotal, discount_code, discount_amount, shipping_charge,
          tax_amount, total_amount, payment_method, payment_status, order_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        orderId,
        orderNumber,
        req.customer?.id || null,
        customer.name.trim(),
        customer.email.trim().toLowerCase(),
        customer.phone.trim(),
        fullShippingAddress,
        subtotal,
        discountCode ? discountCode.trim().toUpperCase() : null,
        discountAmount,
        shippingCharge,
        0.0,
        finalTotal,
        paymentMethod || 'UPI',
        'Paid', // Development test payment auto-authorizes
        'Confirmed'
      );

      // 2. Insert items and decrement real product inventory
      const insertItem = db.prepare(`
        INSERT INTO order_items (id, order_id, product_id, product_title, product_sku, variant_name, price, quantity, subtotal, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const decrementInventory = db.prepare(`
        UPDATE products SET inventory = MAX(0, inventory - ?) WHERE id = ?
      `);

      validatedItems.forEach((vItem, idx) => {
        const itemId = 'item_' + Date.now() + '_' + idx;
        insertItem.run(
          itemId,
          orderId,
          vItem.productId,
          vItem.title,
          vItem.sku,
          vItem.variantName,
          vItem.price,
          vItem.quantity,
          vItem.subtotal,
          vItem.imageUrl
        );
        decrementInventory.run(vItem.quantity, vItem.productId);
      });

      // 3. Record discount usage if applied
      if (appliedDiscountId) {
        db.prepare(`
          INSERT INTO discount_usage (id, discount_id, customer_id, customer_email, order_id)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          'du_' + Date.now(),
          appliedDiscountId,
          req.customer?.id || null,
          customer.email.trim().toLowerCase(),
          orderId
        );

        db.prepare(`
          UPDATE discounts SET usage_count = usage_count + 1 WHERE id = ?
        `).run(appliedDiscountId);
      }

      // 4. Update customer statistics if registered
      if (req.customer?.id) {
        db.prepare(`
          UPDATE customers SET
            total_spent = total_spent + ?,
            orders_count = orders_count + 1
          WHERE id = ?
        `).run(finalTotal, req.customer.id);
      }

      // 5. Create timeline log
      db.prepare(`
        INSERT INTO order_timeline (id, order_id, status, message)
        VALUES (?, ?, ?, ?)
      `).run(
        'tl_' + Date.now(),
        orderId,
        'Confirmed',
        `Order placed successfully via ${paymentMethod || 'UPI'}.`
      );
    });

    executeTransaction();

    const createdOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

    res.status(201).json({
      order: createdOrder,
      items: orderItems
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Order processing failed. Please try again.' });
  }
});

// Track Order publicly by Order Number or ID
router.get('/track/:orderNumber', (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = db.prepare(`
      SELECT * FROM orders
      WHERE order_number = ? OR id = ?
    `).get(orderNumber.trim(), orderNumber.trim());

    if (!order) {
      return res.status(404).json({ error: 'Order not found. Please verify your order number.' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    const timeline = db.prepare('SELECT * FROM order_timeline WHERE order_id = ? ORDER BY created_at ASC').all(order.id);

    res.json({ order, items, timeline });
  } catch (err) {
    console.error('Track order error:', err);
    res.status(500).json({ error: 'Failed to retrieve order tracking info.' });
  }
});

// ---------------- ADMIN PROTECTED ORDERS ENDPOINTS ----------------

// Admin: Get all orders
router.get('/admin/all', verifyAdmin, (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    const ordersWithItems = orders.map((ord) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(ord.id);
      return { ...ord, items };
    });
    res.json(ordersWithItems);
  } catch (err) {
    console.error('Admin get orders error:', err);
    res.status(500).json({ error: 'Failed to retrieve orders list.' });
  }
});

// Admin: Get Order Details
router.get('/admin/:id', verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
    const timeline = db.prepare('SELECT * FROM order_timeline WHERE order_id = ? ORDER BY created_at ASC').all(id);

    res.json({ order, items, timeline });
  } catch (err) {
    console.error('Admin get order detail error:', err);
    res.status(500).json({ error: 'Failed to retrieve order detail.' });
  }
});

// Admin: Update Order Status (Restores inventory on Cancel/Refund!)
router.put('/admin/:id/status', verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus, message } = req.body;

    const currentOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!currentOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const prevStatus = currentOrder.order_status;
    const newStatus = orderStatus || prevStatus;
    const newPayStatus = paymentStatus || currentOrder.payment_status;

    const executeStatusUpdate = db.transaction(() => {
      // Update order
      db.prepare(`
        UPDATE orders SET
          order_status = ?,
          payment_status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(newStatus, newPayStatus, id);

      // Check if transitioning to Cancelled/Refunded (Restore inventory)
      const isNowCancelled = newStatus === 'Cancelled' || newStatus === 'Refunded';
      const wasCancelled = prevStatus === 'Cancelled' || prevStatus === 'Refunded';

      if (isNowCancelled && !wasCancelled) {
        const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(id);
        const restoreInventory = db.prepare('UPDATE products SET inventory = inventory + ? WHERE id = ?');
        items.forEach((item) => {
          restoreInventory.run(item.quantity, item.product_id);
        });
      } else if (!isNowCancelled && wasCancelled) {
        // Un-cancelling: re-decrement inventory
        const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(id);
        const deductInventory = db.prepare('UPDATE products SET inventory = MAX(0, inventory - ?) WHERE id = ?');
        items.forEach((item) => {
          deductInventory.run(item.quantity, item.product_id);
        });
      }

      // Add timeline log
      const logMessage = message || `Order status updated to ${newStatus} (${newPayStatus}).`;
      db.prepare(`
        INSERT INTO order_timeline (id, order_id, status, message)
        VALUES (?, ?, ?, ?)
      `).run('tl_' + Date.now(), id, newStatus, logMessage);
    });

    executeStatusUpdate();

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    const timeline = db.prepare('SELECT * FROM order_timeline WHERE order_id = ? ORDER BY created_at ASC').all(id);

    res.json({ order: updated, timeline });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// Admin: Update Tracking Number
router.put('/admin/:id/tracking', verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { trackingNumber, carrier } = req.body;

    db.prepare(`
      UPDATE orders SET
        tracking_number = ?,
        order_status = 'Shipped',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(trackingNumber, id);

    db.prepare(`
      INSERT INTO order_timeline (id, order_id, status, message)
      VALUES (?, ?, ?, ?)
    `).run(
      'tl_' + Date.now(),
      id,
      'Shipped',
      `Order dispatched via ${carrier || 'Shiprocket/BlueDart'}. Tracking ID: ${trackingNumber}`
    );

    res.json({ success: true, trackingNumber });
  } catch (err) {
    console.error('Update tracking error:', err);
    res.status(500).json({ error: 'Failed to update tracking.' });
  }
});

export default router;
