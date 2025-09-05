import express from 'express'
import { verifyToken,verifyAdmin } from '../middleware/authMiddleware.js';
import {admin_get, admin_post, contact_post} from "../controllers/contactController.js"

const contactRouter=express.Router();

contactRouter.post("/contact-post",verifyToken,contact_post);
contactRouter.get('/admin-get',verifyToken,verifyAdmin,admin_get);
contactRouter.post('/admin-post',verifyToken,verifyAdmin,admin_post);





export default contactRouter;