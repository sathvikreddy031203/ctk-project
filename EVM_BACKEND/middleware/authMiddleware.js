import jwt from 'jsonwebtoken';
import { tokenBlacklist } from './tokenBlacklist.js';

export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(403).json({ message: "Access denied. No token provided." });
    }

    // Check if token has been logged out
    if (tokenBlacklist.has(token)) {
        return res.status(401).json({ message: "Token has been logged out" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired" });
        }
        return res.status(401).json({ message: "Invalid token" });
    }
};

export const verifyAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: "Access denied. Admins only!" });
    }
    next();
};
