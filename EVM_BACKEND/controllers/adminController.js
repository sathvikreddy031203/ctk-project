import { User } from '../models/userModel.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({isAdmin:false}, '-password'); // exclude password
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
