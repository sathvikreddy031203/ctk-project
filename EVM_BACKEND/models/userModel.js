import mongoose from "mongoose";
//final changes done
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
    },
    userEmail: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    userPhonenumber:{
        type: String,
        required: true,
    },
    isAdmin:{
        type: Boolean,
        default:false,
    }
});

export const User = mongoose.model('User', userSchema);