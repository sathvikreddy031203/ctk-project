import mongoose from "mongoose";
 
//final changes done
const bookingSchema = new mongoose.Schema({
    eventId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    eventName: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    userPhonenumber: {
        type: String,
        required: true,
    },
    numberOfTickets: {
        type: Number,
        required: true,
        min: 1,
    },
    eventDate: {
        type: Date,
        required: true,
    },
    bookingDate: {
        type: Date,
        default: Date.now,
    },
});
 
export const Booking = mongoose.model('Booking', bookingSchema);
