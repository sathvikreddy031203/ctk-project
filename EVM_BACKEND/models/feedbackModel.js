import mongoose from "mongoose";
//final changes done
const feedbackSchema = new mongoose.Schema({
    eventId: {
        type: String,
        required: true,
    },
    eventName:{
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    rating:{
        type: Number,
        required: true,
    },
    comments:{
        type: String,
        required:true
    }
});

export const Feedback = mongoose.model('feedback', feedbackSchema);