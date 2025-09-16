import express from 'express';
import { tokenBlacklist } from '../middleware/tokenBlacklist.js';
//import { verifyToken } from '../middleware/authMiddleware.js';


const router = express.Router();

router.post('/logout', (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
        tokenBlacklist.add(token);
    }
    return res.json({ message: 'Logged out successfully' });
});

export default router;
