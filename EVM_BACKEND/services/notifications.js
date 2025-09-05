import {Notification} from '../models/notificationsModel.js';
import { Event } from '../models/eventModel.js';
import {User} from '../models/userModel.js';
import {Booking} from '../models/bookingModel.js';
import nodeCron from 'node-cron';

const _sendNotificationtoUser = async (UserId, message, type, link) => {
  try {
    const notification = new Notification({
      userId: UserId,
      message: message,
      type: type,
      link: link
    });
    await notification.save();
  } catch (err) {
    console.error("Error sending notification:", err);
  }
};

export const sendBookingNotification = async (eventName, userId, noOfTickets) => {
  try {
    const message = `Booking confirmed for ${noOfTickets} tickets for event "${eventName}".`;
    const link = `/profile`;
    await _sendNotificationtoUser(userId, message, 'booking', link);
  } catch (err) {
    console.error("Error sending booking notification:", err);
  }
};

export const sendWelcomeNotification = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found");
      return;
    }
    const message = `Welcome ${user.userName}! Thank you for registering on our platform.`;
    const link = `/profile`;
    await _sendNotificationtoUser(userId, message, 'welcome', link);
  } catch (err) {
    console.error("Error sending welcome notification:", err);
  }
};

export const sendEventUpdateNotification = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      console.error("Event not found");
      return;
    }
    const message = `Event "${event.eventName}" has been updated. Check the latest details.`;
    const link = `/event/${eventId}`;
    const users = await Booking.find({ eventId: eventId }).distinct('userId');
    for (const userId of users) {
      await _sendNotificationtoUser(userId, message, 'info', link);
    }
  } catch (err) {
    console.error("Error sending event update notification:", err);
  }
};

export const sendEventCancelNotification = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      console.error("Event not found");
      return;
    }
    const message = `Event "${event.eventName}" has been cancelled. We apologize for the inconvenience.`;
    const link = `/events`;
    const users = await Booking.find({ eventId: eventId }).distinct('userId');
    for (const userId of users) {
      await _sendNotificationtoUser(userId, message, 'cancellation', link);
    }
  } catch (err) {
    console.error("Error sending event cancellation notification:", err);
  }
};

export const sendTicketCancellationNotification = async (bookingId) => {
  try {
    const ticket = await Booking.findById(bookingId);
    if (!ticket) {
      console.error("Ticket not found");
      return;
    }
    const user = await User.findById(ticket.userId);
    if (!user) {
      console.error("User not found");
      return;
    }
    const message = `Your ticket for the event "${ticket.eventName}" has been cancelled sucessfully.`;
    const link = `/profile`;
    await _sendNotificationtoUser(user._id, message, 'cancellation', link);
  } catch (err) {
    console.error("Error sending ticket cancellation notification:", err);
  }
};

export const sendContactNotificationForAdmin = async (contactId, contactEmail, contactName, contactMessage) => {
  try {
    const message = `New contact message from ${contactName} (${contactEmail}): ${contactMessage}`;
    const link = `inbox/${contactId}`;
    const admins = await User.find({ isAdmin: true });
    for (const adminId of admins) {
      await _sendNotificationtoUser(adminId, message, 'contact', link);
    }
  } catch (err) {
    console.error("Error sending contact Notification:", err);
  }
};

export const sendContactNotificationForUser = async (userId, contactMessage, adminReply) => {
  try {
    const message = "For your Query '" + contactMessage + "' Admin reply is: '" + adminReply + "' .";
    const link = '/';
    await _sendNotificationtoUser(userId, message, 'contact', link);
  } catch (err) {
    console.error("Error sending contact notification to user:", err);
  }
};

//min hrs
nodeCron.schedule('0 12 * * *', async () => {
  try {
    const now = new Date();

    const events = await Event.find({
      date: { $lt: now },
      feedbackRequested: { $ne: true }
    });

    for (const event of events) {
      const users = await Booking.find({ eventId: event._id }).distinct('userId');
      const message = `We hope you enjoyed "${event.eventName}". Please share your feedback!`;
      const link = `/event/${event._id}`;

      for (const userId of users) {
        await _sendNotificationtoUser(userId, message, 'feedback', link);
      }

      event.feedbackRequested = true;
      await event.save();
    }
  } catch (error) {
    console.error('Error sending feedback notifications:', error);
  }
});