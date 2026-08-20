// server/routes/payments.js
import { Router } from 'express';
import crypto from 'crypto';
import db from '../db/database.js';

const router = Router();

// Store active payment session statuses for real-time polling
const activePaymentSessions = new Map();

// Get public Razorpay Key ID
router.get('/razorpay/config', (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_lightinmotion';
    res.json({ keyId, enabled: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment config.' });
  }
});

// Create Razorpay Order Endpoint
router.post('/razorpay/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', customerEmail, customerPhone, orderNotes } = req.body;
    const numAmount = parseFloat(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required.' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const amountInPaise = Math.round(numAmount * 100);
    const receipt = 'rcpt_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    // If real Razorpay keys exist, call Razorpay REST API
    if (keyId && keySecret && !keyId.includes('test_lightinmotion')) {
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt,
          notes: orderNotes || { store: 'LIGHTINMOTION' }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.description || 'Razorpay order creation failed.');
      }

      return res.json({
        success: true,
        orderId: data.id,
        amount: data.amount,
        currency: data.currency,
        keyId,
        receipt: data.receipt
      });
    }

    // Dev / Test Mode fallback payload
    const dummyOrderId = 'order_rzp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    activePaymentSessions.set(dummyOrderId, { paid: false, updatedAt: Date.now() });

    res.json({
      success: true,
      orderId: dummyOrderId,
      amount: amountInPaise,
      currency,
      keyId: keyId || 'rzp_test_lightinmotion',
      receipt,
      isTestMode: true
    });
  } catch (err) {
    console.error('Razorpay Create Order Error:', err);
    res.status(500).json({ error: err.message || 'Payment initialization failed.' });
  }
});

// Update payment session status endpoint (Simulate or Webhook)
router.post('/razorpay/update-status', (req, res) => {
  try {
    const { orderId, paymentId, status = 'Paid' } = req.body;
    if (orderId) {
      activePaymentSessions.set(orderId, {
        paid: status === 'Paid' || status === 'captured',
        paymentId: paymentId || 'pay_' + Date.now(),
        updatedAt: Date.now()
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// Automated Server Polling Endpoint (Checks Razorpay API or session state)
router.get('/razorpay/check-status', async (req, res) => {
  try {
    const { orderId } = req.query;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    // 1. Check in-memory session map
    if (activePaymentSessions.has(orderId)) {
      const session = activePaymentSessions.get(orderId);
      if (session.paid) {
        return res.json({
          paid: true,
          status: 'Paid',
          paymentId: session.paymentId
        });
      }
    }

    // 2. Check Razorpay REST API directly if real keys exist
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret && !keyId.includes('test_lightinmotion') && orderId.startsWith('order_')) {
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch(`https://api.razorpay.com/v1/orders/${orderId}/payments`, {
        headers: { 'Authorization': authHeader }
      });
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const capturedPayment = data.items.find((p) => p.status === 'captured');
        if (capturedPayment) {
          activePaymentSessions.set(orderId, {
            paid: true,
            paymentId: capturedPayment.id,
            updatedAt: Date.now()
          });
          return res.json({
            paid: true,
            status: 'Paid',
            paymentId: capturedPayment.id
          });
        }
      }
    }

    res.json({
      paid: false,
      status: 'pending',
      message: 'Awaiting payment authorization from Google Pay / UPI Bank...'
    });
  } catch (err) {
    console.error('Check payment status error:', err);
    res.status(500).json({ error: 'Failed to verify payment status' });
  }
});

// Verify Razorpay Payment Signature
router.post('/razorpay/verify-signature', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keySecret) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, error: 'Invalid payment signature.' });
      }
    }

    // Mark order as Paid in database if orderId is provided
    if (orderId) {
      db.prepare(`
        UPDATE orders SET
          payment_status = 'Paid',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? OR order_number = ?
      `).run(orderId, orderId);

      activePaymentSessions.set(orderId, {
        paid: true,
        paymentId: razorpay_payment_id,
        updatedAt: Date.now()
      });
    }

    res.json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: 'Paid'
    });
  } catch (err) {
    console.error('Razorpay Signature Verification Error:', err);
    res.status(500).json({ error: 'Signature verification failed.' });
  }
});

export default router;
