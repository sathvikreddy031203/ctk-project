
//import { useParams } from "react-router-dom";
import { Booking } from "../models/bookingModel.js"
import { Event } from "../models/eventModel.js"
import { sendBookingNotification, sendTicketCancellationNotification } from "../services/notifications.js";
import { logger } from "../logs/logs.js";


export const createBooking = async (req, res) => {
  try {
    logger.info(`Creating booking for event`);
    const userId = req.user.id;
    const { eventId, eventName, userName, userPhonenumber, numberOfTickets, eventDate, bookingDate } = req.body;
    await sendBookingNotification(eventName, userId, numberOfTickets);
    const newBooking = await Booking.create({
      eventId: eventId,
      eventName: eventName,
      userId: userId,
      userName: userName,
      userPhonenumber: userPhonenumber,
      numberOfTickets: numberOfTickets,
      eventDate: new Date(eventDate),
      bookingDate
    });
    // Update the event's available tickets
    const event = await Event.findById(eventId);
    if (!event) {
      logger.warn(`Event with id ${eventId} not found`);
      return res.status(404).json({ message: 'Event not found.' });
    }
    if (event.eventAvailableTickets < numberOfTickets) {
      logger.warn(`Not enough tickets available for event ${eventName}`);
      return res.status(400).json({ message: 'Not enough tickets available for this event.' });
    }
    event.eventAvailableTickets -= numberOfTickets;
    await event.save();
    logger.info(` Booking created for event ${eventName}`);

    res.status(201).json({
      message: 'Booking created successfully.',
      newBooking,

    });

  } catch (error) {
    logger.error(`Error creating booking: ${error} ${error.message}`);
    res.status(500).json({ message: 'Internal server error while processing booking.' });
  }
}

export const cancelBooking = async (req, res) => {
  try {
    logger.info(`Canceling booking for event`);
    const {id} = req.params;
    await sendTicketCancellationNotification(id);
    const booking = await Booking.findById(id);
    if (!booking) {
      logger.warn(` Booking with id ${id} not found`);
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.userId.toString() !== req.user.id.toString()) {
      logger.warn(`User ${req.user.id} is not authorized to cancel booking ${id}`);
      return res.status(403).json({ message: 'Forbidden: You do not have permission to cancel this booking.' });
    }
    const updatedEvent = await Event.findByIdAndUpdate(
      booking.eventId,
      { $inc: { eventAvailableTickets: booking.numberOfTickets } },
      { new: true }
    );
    if (!updatedEvent) {
      logger.warn(`Event with id ${booking.eventId} not found`);
      console.warn(`Event (ID: ${booking.eventId}) not found for booking (ID: ${id}) during cancellation. Booking will still be deleted.`);
    }

    await Booking.deleteOne({ _id: id });
    logger.info(` Booking ${id} canceled`);

    res.status(200).json({
      message: 'Booking cancelled successfully and tickets returned.',
      updatedAvailableTickets: updatedEvent ? updatedEvent.eventAvailableTickets : null
    });

  } catch (error) {
    logger.error(` Error canceling booking: ${error} ${error.message}`);
    res.status(500).json({ message: 'Internal server error while cancelling booking.' });
  }
};

