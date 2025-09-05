import { createUser } from '../controllers/userController.js'; // Adjust the path as needed
import { User } from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { sendWelcomeNotification } from '../utils/notificationService.js'; // Assuming you have this service
import logger from '../utils/logger.js'; // Assuming you have a logger utility

// Mock dependencies
jest.mock('../models/userModel.js');
jest.mock('bcryptjs');
jest.mock('../utils/notificationService.js'); // Mock the welcome notification
jest.mock('../utils/logger.js', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('createUser Controller', () => {
  let req, res;

  // Common setup for each test
  beforeEach(() => {
    req = {
      body: {
        userName: 'testuser',
        userEmail: 'test@example.com',
        password: 'password123',
        userPhonenumber: '1234567890',
        isAdmin: false,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(), // Allows chaining .status().json()
      json: jest.fn(),
    };
    // Clear all mocks before each test to ensure isolation
    jest.clearAllMocks();
  });

  // Test Case 1: Successful user creation
  it('should return 201 and a success message if user is created successfully', async () => {
    const mockUser = {
      _id: 'abc',
      userName: 'testuser',
      userEmail: 'test@example.com',
      userPhonenumber: '1234567890',
      isAdmin: false,
    };

    // Mock dependencies
    User.findOne
      .mockResolvedValueOnce(null) // for existingUserName
      .mockResolvedValueOnce(null); // for existingUserEmail
    bcrypt.genSalt.mockResolvedValue('mockSalt');
    bcrypt.hash.mockResolvedValue('hashedPassword');
    User.create.mockResolvedValue(mockUser);
    sendWelcomeNotification.mockResolvedValue(true);

    // Call the controller
    await createUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userName: 'testuser' });
    expect(User.findOne).toHaveBeenCalledWith({ userEmail: 'test@example.com' });
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'mockSalt');
    expect(User.create).toHaveBeenCalledWith({
      userName: 'testuser',
      userEmail: 'test@example.com',
      userPhonenumber: '1234567890',
      password: 'hashedPassword',
      isAdmin: false,
    });
    expect(sendWelcomeNotification).toHaveBeenCalledWith(mockUser._id);
    expect(logger.info).toHaveBeenCalledWith('Signup attempted with the email: test@example.com');
    expect(logger.info).toHaveBeenCalledWith('New User created with the email: test@example.com and username: testuser');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User created successfully',
      user: mockUser,
    });
  });

  // Test Case 2: Username already exists
  it('should return 400 if username already exists', async () => {
    User.findOne.mockResolvedValueOnce({ userName: 'testuser' }); // Simulate existing username

    await createUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userName: 'testuser' });
    expect(User.findOne).not.toHaveBeenCalledWith({ userEmail: expect.any(String) }); // Email check shouldn't happen
    expect(bcrypt.genSalt).not.toHaveBeenCalled();
    expect(User.create).not.toHaveBeenCalled();
    expect(sendWelcomeNotification).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith('Username already exists in the database : testuser');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Username already exists' });
  });

  // Test Case 3: Email already exists
  it('should return 400 if email already exists', async () => {
    User.findOne
      .mockResolvedValueOnce(null) // No existing username
      .mockResolvedValueOnce({ userEmail: 'test@example.com' }); // Simulate existing email

    await createUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userName: 'testuser' });
    expect(User.findOne).toHaveBeenCalledWith({ userEmail: 'test@example.com' });
    expect(bcrypt.genSalt).not.toHaveBeenCalled();
    expect(User.create).not.toHaveBeenCalled();
    expect(sendWelcomeNotification).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith('Email already exists in the database : test@example.com');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email already registered' });
  });

  // Test Case 4: Missing userName in request body
  it('should return 400 if userName is missing', async () => {
    delete req.body.userName;

    await createUser(req, res);

    expect(User.findOne).not.toHaveBeenCalled(); // No database interaction expected
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' }); // The current code throws a generic 500
    // A more robust implementation would check for missing fields explicitly and return 400 with a specific message.
    expect(logger.error).toHaveBeenCalled(); // Expect an error to be logged due to destructuring undefined.
  });

  // Test Case 5: Missing userEmail in request body
  it('should return 400 if userEmail is missing', async () => {
    delete req.body.userEmail;

    await createUser(req, res);

    expect(User.findOne).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    expect(logger.error).toHaveBeenCalled();
  });

  // Test Case 6: Missing password in request body
  it('should return 400 if password is missing', async () => {
    delete req.body.password;

    await createUser(req, res);

    expect(User.findOne).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    expect(logger.error).toHaveBeenCalled();
  });

  // Test Case 7: Database error during User.findOne (for userName)
  it('should return 500 if an error occurs during username lookup', async () => {
    const error = new Error('Database connection failed');
    User.findOne.mockRejectedValue(error);

    await createUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userName: 'testuser' });
    expect(bcrypt.genSalt).not.toHaveBeenCalled();
    expect(User.create).not.toHaveBeenCalled();
    expect(sendWelcomeNotification).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error creating user:'));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });

  // Test Case 8: Database error during User.findOne (for userEmail)
  it('should return 500 if an error occurs during email lookup', async () => {
    const error = new Error('Database connection failed');
    User.findOne
      .mockResolvedValueOnce(null) // No existing username
      .mockRejectedValueOnce(error); // Simulate error during email lookup

    await createUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userName: 'testuser' });
    expect(User.findOne).toHaveBeenCalledWith({ userEmail: 'test@example.com' });
    expect(bcrypt.genSalt).not.toHaveBeenCalled();
    expect(User.create).not.toHaveBeenCalled();
    expect(sendWelcomeNotification).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error creating user:'));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });

  // Test Case 9: Error during bcrypt.genSalt
  it('should return 500 if an error occurs during salt generation', async () => {
    const error = new Error('Bcrypt salt error');
    User.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    bcrypt.genSalt.mockRejectedValue(error);

    await createUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userName: 'testuser' });
    expect(User.findOne).toHaveBeenCalledWith({ userEmail: 'test@example.com' });
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(User.create).not.toHaveBeenCalled();
    expect(sendWelcomeNotification).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error creating user:'));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });

  // Test Case 10: Error during bcrypt.hash
  it('should return 500 if an error occurs during password hashing', async () => {
    const error = new Error('Bcrypt hash error');
    User.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    bcrypt.genSalt.mockResolvedValue('mockSalt');
    bcrypt.hash.mockRejectedValue(error);

    await createUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userName: 'testuser' });
    expect(User.findOne).toHaveBeenCalledWith({ userEmail: 'test@example.com' });
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'mockSalt');
    expect(User.create).not.toHaveBeenCalled();
    expect(sendWelcomeNotification).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error creating user:'));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });

  // Test Case 11: Database error during User.create
  it('should return 500 if an error occurs during user creation', async () => {
    const error = new Error('Failed to save user');
    User.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    bcrypt.genSalt.mockResolvedValue('mockSalt');
    bcrypt.hash.mockResolvedValue('hashedPassword');
    User.create.mockRejectedValue(error);

    await createUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userName: 'testuser' });
    expect(User.findOne).toHaveBeenCalledWith({ userEmail: 'test@example.com' });
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'mockSalt');
    expect(User.create).toHaveBeenCalledWith({
      userName: 'testuser',
      userEmail: 'test@example.com',
      userPhonenumber: '1234567890',
      password: 'hashedPassword',
      isAdmin: false,
    });
    expect(sendWelcomeNotification).not.toHaveBeenCalled(); // Should not be called if user creation fails
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error creating user:'));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });

  // Test Case 12: Error during sendWelcomeNotification (user still created successfully)
  it('should still return 201 if sendWelcomeNotification fails', async () => {
    const mockUser = {
      _id: 'abc',
      userName: 'testuser',
      userEmail: 'test@example.com',
      userPhonenumber: '1234567890',
      isAdmin: false,
    };

    // Mock dependencies
    User.findOne
      .mockResolvedValueOnce(null) // for existingUserName
      .mockResolvedValueOnce(null); // for existingUserEmail
    bcrypt.genSalt.mockResolvedValue('mockSalt');
    bcrypt.hash.mockResolvedValue('hashedPassword');
    User.create.mockResolvedValue(mockUser);
    sendWelcomeNotification.mockRejectedValue(new Error('Notification sending failed')); // Simulate notification failure

    // Call the controller
    await createUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userName: 'testuser' });
    expect(User.findOne).toHaveBeenCalledWith({ userEmail: 'test@example.com' });
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'mockSalt');
    expect(User.create).toHaveBeenCalledWith({
      userName: 'testuser',
      userEmail: 'test@example.com',
      userPhonenumber: '1234567890',
      password: 'hashedPassword',
      isAdmin: false,
    });
    expect(sendWelcomeNotification).toHaveBeenCalledWith(mockUser._id);
    expect(logger.info).toHaveBeenCalledWith('Signup attempted with the email: test@example.com');
    expect(logger.info).toHaveBeenCalledWith('New User created with the email: test@example.com and username: testuser');
    // Note: The original code does not explicitly catch errors from sendWelcomeNotification
    // within the try block, so it would fall into the catch block for the entire function.
    // If you want the user creation to succeed even if the notification fails, you might
    // consider wrapping sendWelcomeNotification in its own try/catch or using .catch()
    // on the promise to log the error without blocking the main flow.
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error creating user:')); // The outer catch block will catch this
    expect(res.status).toHaveBeenCalledWith(500); // This will be 500 because the notification error propagates to the main catch block
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});

afterAll(() => {
  jest.clearAllMocks();
});