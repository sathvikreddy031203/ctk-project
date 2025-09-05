import express from 'express';
import {createUser,loginUser,getProfileDetails,feedback,viewFeedback,viewTickets,authme} from '../controllers/userController.js';
import { verifyToken,verifyAdmin } from '../middleware/authMiddleware.js';



const userRouter = express.Router();
userRouter.post('/authme',verifyToken,authme);
userRouter.post('/signup', createUser);
userRouter.post('/login', loginUser);
userRouter.get("/profilepage",verifyToken,getProfileDetails);
userRouter.post("/feedback",verifyToken,feedback);
// userRouter.post("/contactus",verifyToken,contact);
// userRouter.delete('/deleteUser',deleteUser);
userRouter.get('/viewfeedback/:id',verifyToken,verifyAdmin,viewFeedback);
userRouter.get('/viewtickets/:id',verifyToken,verifyAdmin,viewTickets);

userRouter.get('/loggedin', verifyToken, (req, res) => {
    return res.status(201).json({ message: "User is logged in" , isadmin:req.user.isAdmin});
});

userRouter.get('/admin',verifyToken,verifyAdmin,(req, res) => {
    return res.status(201).json();
});

userRouter.get("/verifytoken",verifyToken,(req, res) => {
    return res.status(201).json();
});





export default userRouter;