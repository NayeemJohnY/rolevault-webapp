const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { handleAsync, sendSuccess, sendError } = require('../utils/responseHandler');

const router = express.Router();

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1h' }
  );
};

// Register new user
router.post('/register', validate('user'), handleAsync(async (req, res) => {
  const { name, email, password, role = 'viewer' } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 'User already exists with this email', 400);
  }

  const user = new User({ name, email, password, role });
  await user.save();

  const token = generateToken(user);

  sendSuccess(res, {
    user: user.toJSON(),
    token
  }, 'User registered successfully', 201);
  console.log('POST /register', req.body);
  console.log('Register failed: user exists', { email });
  console.log('Register successful:', { email });
}));

// Login user
router.post('/login', validate('login'), handleAsync(async (req, res) => {
  // Logging for debugging
  console.log('Login attempt:', req.body);

  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    console.log('Login failed: user not found or inactive', { email });
    return sendError(res, 'Invalid credentials or account deactivated', 401);
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    console.log('Login failed: invalid password', { email });
    return sendError(res, 'Invalid credentials', 401);
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user);

  console.log('Login successful:', { email });
  sendSuccess(res, {
    user: user.toJSON(),
    token
  }, 'Login successful');
}));

// Get current user profile
router.get('/me', authenticate, handleAsync(async (req, res) => {
  sendSuccess(res, { user: req.user.toJSON() });
  console.log('GET /me', { userId: req.user._id });
}));

// Update user profile
router.put('/me', authenticate, validate('user', { isUpdate: true }), handleAsync(async (req, res) => {
  const allowedUpdates = ['name', 'preferences', 'profileImage', 'firstName', 'lastName', 'phone', 'country', 'skills', 'experience', 'interests', 'newsletter', 'birthDate', 'portfolio', 'bio', 'priority', 'dashboardWidgets'];
  const updates = {};

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  sendSuccess(res, { user: user.toJSON() }, 'Profile updated successfully');
  console.log('PUT /me', { userId: req.user._id, updates: req.body });
}));

// Logout (client-side handles token removal)
router.post('/logout', (req, res) => {
  sendSuccess(res, null, 'Logout successful');
  console.log('POST /logout', { userId: req.user?._id });
});

module.exports = router;