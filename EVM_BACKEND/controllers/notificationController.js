import { logger } from '../logs/logs.js';
import {Notification} from '../models/notificationsModel.js'

export const notification=async(req,res)=>{
    try {
        const userId = req.user.id
        logger.info(`notification is requested for user ${userId}`);
        const notifications = await Notification.find({ userId }).sort({ timestamp: -1 });
        logger.info(`notification is sent successfully for user ${userId}`);
        res.status(200).json(notifications);
    } catch (error) {
        logger.error(`Error in notification controller: ${error} ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
    }
} 