import { User } from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { sendMailForOtp } from '../services/nodemailer.js'
import bcrypt from 'bcryptjs';
import { logger } from '../logs/logs.js';



export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        logger.info(`forgot password request from ${email}`);

        const user = await User.findOne({ userEmail: email });

        if (!user) {
            logger.warn(`user not found for email ${email} in forgot password`);
            return res.status(400).json({ error: "User not found." })
        };
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const token = jwt.sign({ email, otp }, process.env.JWT_SECRET, { expiresIn: '5m' });

        console.log(`OTP for ${email}: ${otp}`);

        sendMailForOtp(email, "OTP for Password Change", otp) // In production, send via email
        logger.info(`forgot password otp : ${otp} is sent successfully`)
        res.json({ message: "OTP sent to your email.", token });
    }
    catch (error) {
        logger.error(`Error creating user: ${error} ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    logger.info(`reset password is requested`);

    if (!token || !password) {
      logger.warn(`token or password is missing in reset password`);
      return res.status(400).json({ error: "Token and new password are required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by email instead of ID
    const user = await User.findOne({ userEmail: decoded.email });

    if (!user) {
      logger.warn(`user not found for email ${decoded.email} in reset password`);
      return res.status(404).json({ error: "User not found." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    await user.save();

    logger.info(`Password reset is successful for the user ${user.userEmail}`);
    res.json({ message: "Password reset successfully." });
  } catch (error) {
    logger.error(`Error resetting password: ${error} ${error.message}`);
    res.status(400).json({ error: "Invalid or expired token." });
  }
};


export const verifyOtp = async (req, res) => {
    try {
        const { token, otp: userOtp } = req.body;
        logger.info(`verify otp is requested`)
        if (!token || !userOtp) {
            logger.warn(`token or otp is missing in verify otp`);
            return res.status(400).json({ error: "Token and OTP are required." })
        };
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        if (decoded.otp === userOtp) {
            logger.info(`otp is verified successfully`)
            return res.json({ message: "OTP verified successfully." });
        } else {
            logger.warn(`otp is not verified`)
            return res.status(400).json({ error: "Invalid OTP." });
        }
    } catch (error) {
        logger.error(`Error verifying OTP: ${error} ${error.message}`);
        return res.status(400).json({ error: "OTP expired or invalid." });
    }
}







