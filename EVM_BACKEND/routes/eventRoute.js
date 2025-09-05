import express from "express";
import { createEvent,deleteEvent,getEvents,updateEvent,getEvent} from "../controllers/eventController.js";
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const eventRouter = express.Router();
eventRouter.post("/create",verifyToken,verifyAdmin,createEvent);
eventRouter.get("/getevents", getEvents);
eventRouter.patch("/update/:id",verifyToken,verifyAdmin,updateEvent);
eventRouter.delete("/delete/:id",verifyToken,verifyAdmin,deleteEvent);
eventRouter.get('/getevent/:id',verifyToken,getEvent);
eventRouter.put('/updateevent/:id',verifyToken,verifyAdmin,updateEvent);
eventRouter.get('/updateevent/:eventId',verifyToken,verifyAdmin,getEvent);


export default eventRouter;