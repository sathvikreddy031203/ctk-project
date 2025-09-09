// ------------------ YOUR FIRST CODE ------------------
import express from "express";
import { logger } from './logs/logs.js';
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRouter from "./routes/UserRoute.js";
import eventRouter from "./routes/eventRoute.js";
import adminRouter from "./routes/adminRoute.js";
import bookingRouter from "./routes/bookingRoute.js";
import cors from 'cors';
import servicesRouter from "./routes/servicesRoute.js";
import notificationRouter from "./routes/notificationRoute.js";
import contactRouter from "./routes/contactRoute.js";
import jwt from 'jsonwebtoken';

// extra imports for Razorpay
import Razorpay from "razorpay";
import crypto from "crypto";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));

app.use('/upload', express.static('uploads'));

app.use("/api", userRouter);
app.use("/api", eventRouter);
app.use("/api", adminRouter);
app.use("/api", bookingRouter);
app.use("/api", servicesRouter);
app.use("/api", notificationRouter);
app.use("/api", contactRouter);

app.get('/api/check-auth', (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ isAuthenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ isAuthenticated: true, isAdmin: decoded.isAdmin });
  } catch (error) {
    res.status(401).json({ isAuthenticated: false });
  }
});

// ------------------ RAZORPAY PART (second code) ------------------

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// just a check route
app.get('/', (_, res) => res.send('Razorpay Backend OK'));

// Create an order
app.post('/api/create-order', async (req, res) => {
  try {
    let { amountInRupees = 1 } = req.body;
    amountInRupees = Math.max(Number(amountInRupees), 1); // minimum 1 INR
    const amount = Math.round(amountInRupees * 100); // paise

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: 'rcpt_' + Date.now(),
      notes: { purpose: 'Event Booking' }
    });
    res.json({ id: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});


// Verify payment signature
app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body).digest('hex');
    const ok = expected === razorpay_signature;
    if (ok) return res.json({ ok: true });
    return res.status(400).json({ ok: false, error: 'Invalid signature' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Verification error' });
  }
});

// ------------------ SERVER START ------------------
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    logger.info(`Connection is established for MONGO_DB`);
    app.listen(process.env.PORT, () => {
      logger.info(`Connection is established for PORT`);
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    console.error("Error connecting to MongoDB:", error);
  });