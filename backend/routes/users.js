const express = require('express');
const User = require('../models/User');
const { adminOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { handleAsync, sendSuccess, sendError, sendPaginated } = require('../utils/responseHandler');

const router = express.Router();

// Get all users (Admin only)
router.get('/', adminOnly, handleAsync(async (req, res) => {
  const { page = 1, limit = 10, search, role, isActive } = req.query;
  
  // Build filter
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
    console.log('GET /users', req.query);

  // Execute query with pagination
  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(filter);
    // Return users at top level for consistency
    sendSuccess(res, { users, pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    } });
}));

// Get user by ID (Admin only)
router.get('/:id', adminOnly, handleAsync(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return sendError(res, 'User not found', 404);
  }
    console.log('GET /users/:id', req.params);

  sendSuccess(res, { user });
}));

// Create new user (Admin only)
router.post('/', adminOnly, validate('user'), handleAsync(async (req, res) => {
  const { name, email, password, role = 'viewer' } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 'User already exists with this email', 400);
  }
    console.log('POST /users', req.body);

  const user = new User({ name, email, password, role });
  await user.save();

  sendSuccess(res, { user: user.toJSON() }, 'User created successfully', 201);
}));

// Update user (Admin only)
router.put('/:id', adminOnly, validate('user', { isUpdate: true }), handleAsync(async (req, res) => {
  const updates = req.body;
  
  // Don't allow password updates through this route
  delete updates.password;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return sendError(res, 'User not found', 404);
  }
    console.log('PUT /users/:id', { params: req.params, updates: req.body });

  sendSuccess(res, { user }, 'User updated successfully');
}));

// Delete user (Admin only)
router.delete('/:id', adminOnly, handleAsync(async (req, res) => {
  // Prevent admin from deleting themselves
  if (req.params.id === req.user._id.toString()) {
    return sendError(res, 'You cannot delete your own account', 400);
  }

  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    return sendError(res, 'User not found', 404);
  }
    console.log('DELETE /users/:id', { params: req.params, userId: req.user._id });

  sendSuccess(res, null, 'User deleted successfully');
}));

module.exports = router;
