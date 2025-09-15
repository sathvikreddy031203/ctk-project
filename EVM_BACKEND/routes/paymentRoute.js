import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables at the start

const router = express.Router();

// Create Razorpay instance after loading env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Just a check route
router.get('/', (_, res) => res.send('Razorpay Backend OK'));

// Create an order
router.post('/create-order', async (req, res) => {
  try {
    const amountInRupees = 2; // Always 2 INR
    const amount = amountInRupees * 100; // Convert to paise

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: 'rcpt_' + Date.now(),
      notes: { purpose: 'Event Booking' }
    });

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err) {
    console.error('Order creation failed:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment signature
router.post('/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected === razorpay_signature) {
      return res.json({ ok: true });
    } else {
      return res.status(400).json({ ok: false, error: 'Invalid signature' });
    }
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ ok: false, error: 'Verification error' });
  }
});

export default router;
