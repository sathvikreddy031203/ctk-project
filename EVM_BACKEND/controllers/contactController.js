import { ContactUs } from '../models/contactUsModel.js';
import { User } from '../models/userModel.js';
import { sendContactNotificationForAdmin,sendContactNotificationForUser } from '../services/notifications.js';
import {logger} from '../logs/logs.js'

export const contact_post=async(req,res)=>{
    try {
      logger.info(`User has requested to contact us`);
        const { contactName, contactEmail, contactMessage } = req.body;
        if (!contactName || !contactEmail || !contactMessage) {
          logger.warn(`All details are required to contact us`);
          return res.status(400).json({ error: 'All fields are required' });
        }
        const newContact = new ContactUs({
          contactName,
          contactEmail,
          contactMessage
        });
        const response = await newContact.save();
        if (!response) {
          logger.error(`Failed to save contact us request`);
          return res.status(500).json({ error: 'Failed to save contact message' });
        }
        await sendContactNotificationForAdmin(response._id, contactEmail, contactName, contactMessage);
        logger.info(`User has successfully contacted admin `)
        res.status(201).json({ message: "Contact message sent successfully" });
      } catch (error) {
        logger.error(`Error contacting admin: ${error} ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
      }
}

export const admin_get=async(req,res)=>{
    try {
      logger.info(`admin has requested to view all contact us requests`);
        const queries = await ContactUs.find({});
    
        const enhancedQueries = await Promise.all(
          queries.map(async (query) => {
            let replyStatus = 'unresolved';
    
            if (query.adminReply) {
              if (query.isResolved) {
                replyStatus = 'resolved';
              } else {
                const userExists = await User.exists({ email: query.contactEmail });
                replyStatus = userExists ? 'resolved' : 'user_not_found';
              }
            }
    
            return {
              ...query.toObject(),
              replyStatus,
            };
          })
        );
        logger.info(`admin has successfully viewed all contact us requests`)
        res.status(200).json(enhancedQueries.reverse());
      } catch (error) {
        logger.error(`Error fetching contact us requests: ${error} ${error.message}`);
        res.status(500).json({ message: 'Internal server error', error: error.message });
      }
}

export const admin_post=async(req,res)=>{
    try {
      logger.info(`admin has requested to reply to contact us request`);
        const { contactId, userEmail, adminReply } = req.body;
        console.log(req.body);
    
        if (!contactId || !adminReply || !userEmail) {
          logger.warn(` admin has failed to reply to contact us request due to missing fields`);
          return res.status(400).json({ error: 'Contact ID, User Email and reply are required' });
        }
    
        const user = await User.findOne({ userEmail: userEmail });
        const contact = await ContactUs.findById(contactId);
    
        if (!contact) {
          logger.warn(` admin has failed to reply to contact us request due to invalid contact id`);
          return res.status(404).json({ error: 'Contact message not found' });
        }
    
        contact.adminReply = adminReply;
    
        if (user) {
          contact.isResolved = true;
          await sendContactNotificationForUser(user._id, contact.contactMessage, adminReply);
        }
    
        const updatedContact = await contact.save();
    
        const message = user
          ? 'Reply sent successfully'
          : 'User not found, please mail them directly';
        logger.info(` admin has successfully replied to contact us request`);
        return res.status(200).json({ message, contact: updatedContact });
      } catch (error) {
        logger.error(` Error replying to contact us request: ${error} ${error.message}`);
        return res.status(500).json({ error: 'Internal server error' });
      }
}