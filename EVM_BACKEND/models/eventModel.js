import mongoose from 'mongoose';
//final changes are done
const eventSchema = new mongoose.Schema({
    eventName:{
        type: String,
        required: true,
    },
    eventDate: {
        type: Date,
        required: true,
    },
    eventTime: {
        type: String,
        required: true,
    },
    eventDescription: {
        type: String,
        required: true,
    },
    eventOrganizer: {
        type: String,
        required: true,
    },
    eventLocation: {
        type: String,
        required: true,
    },
    eventPhonenumber:{
        type:Number,
        required:true
    },
    eventEmail:{
        type:String,
        required:true
    },
    eventCategory:{
        type:String,
        required:true
    },
    eventImage:{
        type:String,
        required:true
    },
    
    eventTicketPrice: {
        type: Number,
        required: true,
    },
    eventCapacity: {
        type: Number,
        required: true,
    },
    eventAvailableTickets:{
        type:Number,
        required:true,
    }
});

export const Event = mongoose.model('Event', eventSchema);