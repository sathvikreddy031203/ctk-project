import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {notification} from "../controllers/notificationController.js";

const notificationRouter=express.Router();


notificationRouter.get('/get-notification',verifyToken,notification)

export default notificationRouter;