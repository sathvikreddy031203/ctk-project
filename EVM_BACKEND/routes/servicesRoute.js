import express from "express";
import {forgotPassword,resetPassword,verifyOtp} from '../controllers/servicesController.js';



const servicesRouter=express.Router();

servicesRouter.post('/forget-password',forgotPassword);
servicesRouter.post('/reset-password',resetPassword);
servicesRouter.post('/verifyOtp',verifyOtp);

export default servicesRouter;
