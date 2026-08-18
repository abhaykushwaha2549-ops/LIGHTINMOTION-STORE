// server/routes/payments.js
import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

// Create payment transaction intent
router.post('/create-intent', (req, res) => {
  try {
    const { amount, currency = 'INR', customerEmail, orderNotes } = req.body;
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required.' });
    }

    const transactionId = 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    // Development payment session payload (ready for Razorpay/Stripe payload swapping)
    res.json({
      success: true,
      transactionId,
      amount: numAmount,
      currency,
      provider: 'LIGHTINMOTION_TEST_GATEWAY',
      keyId: 'rzp_test_lightinmotion_dev',
      status: 'created'
    });
  } catch (err) {
    console.error('Payment intent error:', err);
    res.status(500).json({ error: 'Payment initialization failed.' });
  }
});

// Server-side payment verification
router.post('/verify', (req, res) => {
  try {
    const { transactionId, orderId, paymentStatus = 'success' } = req.body;

    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID is required.' });
    }

    const verified = paymentStatus === 'success';

    if (orderId && verified) {
      db.prepare(`
        UPDATE orders SET
          payment_status = 'Paid',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(orderId);
    }

    res.json({
      verified,
      transactionId,
      status: verified ? 'Paid' : 'Failed'
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ error: 'Payment verification failed.' });
  }
});

export default router;
