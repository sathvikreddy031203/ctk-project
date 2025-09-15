import express from "express";
import { forgotPassword, resetPassword, verifyOtp, sendBookingEmail } from '../controllers/servicesController.js';

const servicesRouter = express.Router();

servicesRouter.post('/forget-password', forgotPassword);
servicesRouter.post('/reset-password', resetPassword);
servicesRouter.post('/verifyOtp', verifyOtp);

// 🎟️ Booking email route
servicesRouter.post('/send-booking-email', sendBookingEmail);

export default servicesRouter;
