import { Booking } from '../models/bookingModel.js';
import { Event } from '../models/eventModel.js';
import {sendEventCancelNotification,sendEventUpdateNotification} from '../services/notifications.js';
import { logger } from '../logs/logs.js';
//Event is the cluster in database

export const createEvent = async (req, res) => {
    try {
        const { eventName,
            eventDate,
            eventTime,
            eventDescription,
            eventOrganizer,
            eventLocation,
            eventPhonenumber,
            eventEmail,
            eventCategory,
            eventImage,
            eventTicketPrice,
            eventCapacity } = req.body;

            logger.info(`event creation request received`);

        // if (!eventName || !eventDate || !eventTime || !eventLocation || !eventTicketPrice || !eventDescription || !eventImage || !eventOrganizer || !eventCapacity) {
        //     return res.status(400).json({ message: "All fields are required" });
        // }this checking notneeded as frontend will handle it
        const newEvent = new Event({
            eventName,
            eventDate,
            eventTime,
            eventDescription,
            eventOrganizer,
            eventLocation,
            eventPhonenumber,
            eventEmail,
            eventCategory,
            eventImage,
            eventTicketPrice,
            eventCapacity,
            eventAvailableTickets: eventCapacity
        });
        await newEvent.save();
        logger.info(`event created with id ${newEvent._id}`);
        res.status(201).json({ message: "Event created successfully", event: newEvent });
    } catch (error) {
        logger.error(`Error creating event: ${error} ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        logger.info(`Event Deletion is requested for event id ${id}`);
        await sendEventCancelNotification(id);
        const event = await Event.findByIdAndDelete(id);
        await Booking.deleteMany({ eventId: id });
        if (!event) {
            logger.warn(`event details not found for the event id:${id}`);
            return res.status(404).json({ message: "Event not found" });
        }
        logger.info(`event deleted with id ${id}`);
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        logger.error(`Error deleting event: ${error} ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getEvents = async (req, res) => {
    try {
        logger.info(`get events details is requested`);
        const currentDate = new Date();
        const upcomingEvents = await Event.find({ eventDate: { $gte: currentDate } });
        const expiredEvents = await Event.find({ eventDate: { $lt: currentDate } });
        logger.info(`get event details is successfully sent`);
        res.status(200).json({upcomingEvents:upcomingEvents, expiredEvents:expiredEvents});
    } catch (error) {
        logger.error(`Error getting events: ${error} ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const updateEvent = async (req, res) => {
    try {
        logger.info(`update event is requested`)
        const { id } = req.params;
        await sendEventUpdateNotification(id);
        const { eventName, eventDate, eventTime, eventLocation,eventOrganizer,eventEmail,eventPhonenumber, eventCategory, eventDescription, eventCapacity} = req.body;
        if (!eventName || !eventDate || !eventTime || !eventLocation || !eventOrganizer || !eventEmail || !eventPhonenumber || !eventCategory || !eventDescription || !eventCapacity) {
            logger.warn(`All events details are required to update the event`);
            return res.status(400).json({ message: "All fields are required" });
        }
 
        const updatedEvent = await Event.findByIdAndUpdate(id, { eventName, eventDate, eventTime, eventLocation,eventOrganizer,eventEmail,eventPhonenumber, eventCategory, eventDescription, eventCapacity }, { new: true });
 
        if (!updatedEvent) {
            logger.warn(`event details not found for the event id:${id}`);
            return res.status(404).json({ message: "Event not found" });
        }
        logger.info(`update event is successfully executed`);
        res.status(200).json({ message: "Event updated successfully", event: updatedEvent });
    } catch (error) {
        logger.error(`Error updating event: ${error} ${error.message}`);
        res.status(500).json({ message: "Error updating event", error: error.message });
    }
};
 

export const getEvent = async (req, res) => {
    try {
        logger.info(`get single event detail is requested`)
        const { id } = req.params;
        const event = await Event.findById(id);
        if (!event) {
            logger.warn(`event not found for the event id:${id}`);
            res.status(404).json({ message: "event not found" });
        }
        logger.info(`get single event detail is successfully sent`);
        res.status(200).json({event,isAdmin:req.user.isAdmin});
    }
    catch (error) {
        logger.error(`Error getting event: ${error} ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
}