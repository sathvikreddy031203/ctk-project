import { User } from '../models/userModel.js';
import { Event } from '../models/eventModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Booking } from '../models/bookingModel.js';
import { Feedback } from '../models/feedbackModel.js'
import { sendWelcomeNotification } from '../services/notifications.js';
import mongoose from 'mongoose';
import { logger } from '../logs/logs.js'; 

const createToken = (id, isAdmin) => {
    return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, {
        expiresIn: 259200
    });
};

export const createUser = async (req, res) => {
    try {
        const { userName, userEmail, password, userPhonenumber, isAdmin } = req.body;
        logger.info(`Signup attempted with the email: ${userEmail}`);
        const existingUserName = await User.findOne({ userName });
        const existingUserEmail = await User.findOne({ userEmail });

        if (existingUserName) {
            logger.warn(`Username already exists in the database : ${userName}`);
            return res.status(400).json({ message: "Username already exists" });
        } else if (existingUserEmail) {
            logger.warn(`Email already exists in the database : ${userEmail}`);
            return res.status(400).json({ message: "Email already registered" });
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const user = await User.create({
                userName,
                userEmail,
                userPhonenumber,
                password: hashedPassword,
                isAdmin
            });
            await sendWelcomeNotification(user._id);
            logger.info(`New User created with the email: ${userEmail} and username: ${userName}`);
            res.status(201).json({ message: "User created successfully", user });
        }

    } catch (error) {
        logger.error(`Error creating user: ${error} ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { userEmail, password } = req.body;
        logger.info(`Login attempted with the email: ${userEmail}`);

        if (!userEmail || !password) {
            logger.warn('Login attempt with missing email or password.');
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ userEmail });

        if (!user) {
            logger.warn(`User not found in the database : ${userEmail}`);
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.warn(`Incorrect password for user: ${userEmail}`);
            return res.status(401).json({ message: "Invalid password" });
        }
        const token = createToken(user._id, user.isAdmin);
        logger.info(`login successful for user: ${userEmail}`);
        res.status(200).json({ message: "Login successful", user, token });
    } catch (error) {
        logger.error(`Error creating user: ${error} ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const authme = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "user exists", user });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



export const getProfileDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        logger.info(`profile details requested for user: ${userId}`);
        const user = await User.findById(userId);
        const bookingsByEvent = await Booking.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(userId) }
            },
            {
                $group: {
                    _id: "$eventId",
                    bookings: { $push: "$$ROOT" }
                }
            },
            {
                $lookup: {
                    from: "events",
                    localField: "_id",
                    foreignField: "_id",
                    as: "eventDetails"
                }
            },
            {
                $unwind: "$eventDetails"
            },
            {
                $project: {
                    _id: 0,
                    eventId: "$_id",
                    bookings: 1,
                }
            }
        ]);

        const feedbacks = await Feedback.find({ userId: userId });
        if (!user || !bookingsByEvent || !feedbacks) {
            logger.warn(`user or bookings or feedbacks not found for user: ${userId}`);
            return res.status(404).json({ message: "User not found" });
        }

        logger.info(`profile details for user: ${userId} returned`);
        res.status(200).json({ user, bookings: bookingsByEvent, feedbacks });
    } catch (error) {
        logger.error(`Error creating user: ${error} ${error.message}`);
        res.status(500).json({ message: "Internal server error while fetching bookings." });
    }
};

export const feedback = async (req, res) => {
    try {
        const userId = req.user.id;
        const { eventId, eventName, rating, comments } = req.body;
        logger.info(`feedback requested for user: ${userId} for the event ${eventId}`);
        const feedback = await Feedback.create({
            eventId,
            eventName,
           userId: req.user._id,
            rating,
            comments
        });
        logger.info(`feedback created for user: ${userId} for the event ${eventId}`);
        res.status(200).json({ message: "Feedback submitted successfully", feedback })

    } catch (err) {
        logger.error(`Error creating user: ${err} ${err.message}`);
        res.status(500).json({ message: "Internal server error while fetching bookings." });
    }

};

export const viewFeedback = async (req, res) => {
    try {
        const eventId = req.params.id;   // extract event id from request URL
        logger.info(`view feedbacks requested for event: ${eventId}`);

        // query DB: find all feedbacks for that event, and populate only userName from User model
        const feedbacks = await Feedback.find({ eventId })
            .populate("userId", "userName");
        console.log(feedbacks);
        logger.info(`view feedbacks for event: ${eventId} returned`);
        res.status(200).json({ feedbacks });  // send JSON response
    } catch (error) {
        logger.error(`Error fetching feedback: ${error} ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const viewTickets = async (req, res) => {
    try {
        const eventId = req.params.id;
        logger.info(`view tickets requested for event: ${eventId}`);
        const event = await Event.findOne({ _id: eventId });
        const bookings = await Booking.find({ eventId: eventId })
            .populate('userId', 'userName userEmail userPhoneNumber')
            .sort({ bookingDate: -1 });

        if (!bookings || bookings.length === 0) {
            logger.warn(`No bookings found for event: ${eventId}`);
            return res.status(200).json({ message: "No bookings found for this event.", bookings: [] });
        }
        logger.info(`view tickets for event: ${eventId} returned`);
        res.status(200).json({ bookings: bookings, event: event });
    } catch (error) {
        logger.error(`Error creating user: ${error} ${error.message}`);
        res.status(500).json({ message: "Internal server error while fetching bookings." });
    }
};

