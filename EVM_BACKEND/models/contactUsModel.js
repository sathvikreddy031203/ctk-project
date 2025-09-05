import mongoose from 'mongoose';
//final changes are done
const contactUsSchema = new mongoose.Schema({
    contactName: {
        type: String,
        required: true
    },
    contactEmail: {
        type: String,
        required: true
    },
    contactMessage: {
        type: String,
        required: true
    },
    // contactPhoneNumber: {
    //     type: String,
    //     required: true
    // },
    isResolved: {
        type: Boolean,
        default: false
    },
    adminReply: {
        type: String,
        default: '',
    },
 
}, { collection: 'contactus' });
 
export const ContactUs = mongoose.model('ContactUs', contactUsSchema);
