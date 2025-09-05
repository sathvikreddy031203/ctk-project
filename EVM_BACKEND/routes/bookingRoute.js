import express from "express";
import {createBooking,cancelBooking} from "../controllers/bookingController.js"
import { verifyToken} from '../middleware/authMiddleware.js'

 
 
const bookingRouter = express.Router();
 
//routes for functions created in bookingController
bookingRouter.post('/bookevents/:id',verifyToken,createBooking);
bookingRouter.delete('/cancelticket/:id',verifyToken,cancelBooking);
// bookingRouter.get('/getBookings', verifyToken, getUserBookings);

export default bookingRouter;