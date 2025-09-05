import mongoose from 'mongoose';
//not needed
const eventBookingSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
        unique: true
    },
    eventName: {
        type: String,
        required: true,
        trim: true
    },
    totalBookings: {
        type: Number,
        default: 0
    },
    bookings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking'
        }
    ]

});

export const EventBooking = mongoose.model('EventBooking', eventBookingSchema);