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
import paymentRoute from './routes/paymentRoute.js';



dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: "*",
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
app.use('/api', paymentRoute);


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