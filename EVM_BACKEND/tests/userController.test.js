import { loginUser } from '../controllers/userController.js';
import { User } from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mock dependencies
jest.mock('../models/userModel.js');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

describe('loginUser Controller', () => {
  let req, res;

  // Common setup for each test
  beforeEach(() => {
    req = {
      body: {
        userEmail: 'test@example.com',
        password: 'password123',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(), // Allows chaining .status().json()
      json: jest.fn(),
    };
    // Clear all mocks before each test to ensure isolation
    jest.clearAllMocks();
  });

  // Test Case 1: Successful login
  it('should return 200 and a token if login is successful', async () => {
    const mockUser = { _id: '123', userEmail: 'test@gamil.com', password: 'hashedPassword', isAdmin: false };
    
    // Mock dependencies
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mockToken');
  
    // Call the controller
    await loginUser(req, res);
  
    expect(User.findOne).toHaveBeenCalledWith({ userEmail: 'test@example.com' });
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockUser._id, isAdmin: mockUser.isAdmin },
        expect.any(String), // JWT secret
        { expiresIn: 259200 } // Token expiry matches the actual implementation
      );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Login successful',
      user: mockUser,
      token: 'mockToken',
    });
  });

  // Test Case 2: User not found
  it('should return 404 if user is not found', async () => {
    User.findOne.mockResolvedValue(null);

    await loginUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userEmail: 'test@example.com' });
    expect(bcrypt.compare).not.toHaveBeenCalled(); // Password comparison should not happen
    expect(jwt.sign).not.toHaveBeenCalled(); // Token should not be generated
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  // Test Case 3: Incorrect password
  it('should return 401 if password is incorrect', async () => {
    User.findOne.mockResolvedValue({ userEmail: 'test@example.com', password: 'hashedPassword' });
    bcrypt.compare.mockResolvedValue(false); // Simulate incorrect password

    await loginUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userEmail: 'test@example.com' });
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    expect(jwt.sign).not.toHaveBeenCalled(); // Token should not be generated
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid password' });
  });

  // Test Case 4: Missing userEmail in request body
  it('should return 400 if userEmail is missing', async () => {
    delete req.body.userEmail; // Remove userEmail from the request body

    await loginUser(req, res);

    expect(User.findOne).not.toHaveBeenCalled(); // No database interaction expected
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required' });
  });

  // Test Case 5: Missing password in request body
  it('should return 400 if password is missing', async () => {
    delete req.body.password; // Remove password from the request body

    await loginUser(req, res);

    expect(User.findOne).not.toHaveBeenCalled(); // No database interaction expected
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required' });
  });

  // Test Case 6: Both userEmail and password missing in request body
  it('should return 400 if both userEmail and password are missing', async () => {
    delete req.body.userEmail;
    delete req.body.password;

    await loginUser(req, res);

    expect(User.findOne).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required' });
  });

  // Test Case 7: Database error during User.findOne
  it('should return 500 if an error occurs during user lookup', async () => {
    const error = new Error('Database connection failed');
    User.findOne.mockRejectedValue(error); // Simulate a database error during findOne

    await loginUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userEmail: 'test@example.com' });
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jwt.sign).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });

  // Test Case 8: Error during bcrypt.compare (e.g., unexpected internal bcrypt error)
  it('should return 500 if an error occurs during password comparison', async () => {
    const mockUser = { userEmail: 'test@example.com', password: 'hashedPassword' };
    const error = new Error('Bcrypt comparison failed');
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockRejectedValue(error); // Simulate an error during bcrypt comparison

    await loginUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userEmail: 'test@example.com' });
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    expect(jwt.sign).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });

  // Test Case 9: Error during JWT token generation
  it('should return 500 if an error occurs during token generation', async () => {
    const mockUser = { _id: '123', userEmail: 'test@example.com', password: 'hashedPassword', isAdmin: false };
    const error = new Error('JWT signing error');
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockImplementation(() => { // Simulate an error being thrown by jwt.sign
      throw error;
    });

    await loginUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userEmail: 'test@example.com' });
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    expect(jwt.sign).toHaveBeenCalled(); // It was called, but threw an error
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});

afterAll(() => {
  jest.clearAllMocks();
});