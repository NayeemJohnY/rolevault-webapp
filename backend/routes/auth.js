const express = require('express');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { handleAsync, sendSuccess, sendError } = require('../utils/responseHandler');
const { createNotification, NotificationTypes } = require('../utils/notificationService');
const { log } = require('../utils/logger');

const router = express.Router();

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1h' }
  );
};

// Generate temporary token for TOTP verification step
const generateTempToken = (userId) => {
  return jwt.sign(
    { userId, tempAuth: true },
    process.env.JWT_SECRET,
    { expiresIn: '5m' } // Short expiry for security
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

  // Create welcome notification
  await createNotification(user._id, NotificationTypes.ACCOUNT_CREATED(user.name));

  const token = generateToken(user);

  sendSuccess(res, {
    user: user.toJSON(),
    token
  }, 'User registered successfully', 201);
  log('Register successful:', { email });
}));

// Login user
router.post('/login', validate('login'), handleAsync(async (req, res) => {
  const { email, password } = req.body;

  log('Login attempt:', { email });

  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    log('Login failed: user not found or inactive', { email });
    return sendError(res, 'Invalid credentials or account deactivated', 401);
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    log('Login failed: invalid password', { email });
    return sendError(res, 'Invalid credentials', 401);
  }

  // Check if TOTP is enabled for this user
  if (user.totpEnabled) {
    // Generate temporary token for TOTP verification
    const tempToken = generateTempToken(user._id);
    log('Login requires TOTP:', { email });
    return sendSuccess(res, {
      requiresTOTP: true,
      tempToken
    }, 'TOTP verification required');
  }

  // If TOTP not enabled, complete login
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user);

  log('Login successful:', { email });
  sendSuccess(res, {
    user: user.toJSON(),
    token
  }, 'Login successful');
}));

// Get current user profile
router.get('/me', authenticate, handleAsync(async (req, res) => {
  sendSuccess(res, { user: req.user.toJSON() });
  log('GET /me', { userId: req.user._id });
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
  log('PUT /me', { userId: req.user._id, fields: Object.keys(updates) });
}));

// Logout (client-side handles token removal)
router.post('/logout', (req, res) => {
  sendSuccess(res, null, 'Logout successful');
  log('POST /logout', { userId: req.user?._id });
});

// TOTP Setup - Generate QR code for user to scan
router.post('/totp/setup', authenticate, handleAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.totpEnabled) {
    return sendError(res, 'TOTP is already enabled for this account', 400);
  }

  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `RoleVault (${user.email})`,
    issuer: 'RoleVault'
  });

  // Store secret temporarily (not enabled yet)
  user.totpSecret = secret.base32;
  await user.save();

  // Generate QR code
  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

  log('TOTP setup initiated:', { userId: user._id });
  sendSuccess(res, {
    secret: secret.base32,
    qrCode: qrCodeUrl
  }, 'Scan the QR code with your authenticator app');
}));

// TOTP Verify and Enable - Verify the code and enable TOTP
router.post('/totp/verify-setup', authenticate, handleAsync(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return sendError(res, 'TOTP token is required', 400);
  }

  const user = await User.findById(req.user._id);

  if (!user.totpSecret) {
    return sendError(res, 'TOTP setup not initiated. Please start setup first', 400);
  }

  if (user.totpEnabled) {
    return sendError(res, 'TOTP is already enabled', 400);
  }

  // Verify the token
  const verified = speakeasy.totp.verify({
    secret: user.totpSecret,
    encoding: 'base32',
    token: token,
    window: 2 // Allow 2 time steps before/after for clock drift
  });

  if (!verified) {
    log('TOTP setup verification failed:', { userId: user._id });
    return sendError(res, 'Invalid TOTP token', 401);
  }

  // Enable TOTP
  user.totpEnabled = true;
  await user.save();

  // Create notification
  await createNotification(
    user._id,
    'Two-Factor Authentication has been successfully enabled for your account'
  );

  log('TOTP enabled:', { userId: user._id });
  sendSuccess(res, { totpEnabled: true }, 'TOTP successfully enabled');
}));

// TOTP Verify Login - Verify TOTP code during login
router.post('/totp/verify-login', handleAsync(async (req, res) => {
  const { tempToken, token } = req.body;

  if (!tempToken || !token) {
    return sendError(res, 'Temporary token and TOTP token are required', 400);
  }

  try {
    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);

    if (!decoded.tempAuth) {
      return sendError(res, 'Invalid token', 401);
    }

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return sendError(res, 'User not found or account deactivated', 401);
    }

    if (!user.totpEnabled || !user.totpSecret) {
      return sendError(res, 'TOTP is not enabled for this account', 400);
    }

    // Verify TOTP token
    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      log('TOTP login verification failed:', { userId: user._id });
      return sendError(res, 'Invalid TOTP token', 401);
    }

    // Complete login
    user.lastLogin = new Date();
    await user.save();

    const authToken = generateToken(user);

    log('TOTP login successful:', { userId: user._id });
    sendSuccess(res, {
      user: user.toJSON(),
      token: authToken
    }, 'Login successful');

  } catch (error) {
    log('TOTP login error:', error);
    return sendError(res, 'Invalid or expired token', 401);
  }
}));

// TOTP Disable - Disable TOTP for user account
router.post('/totp/disable', authenticate, handleAsync(async (req, res) => {
  const { password, token } = req.body;

  if (!password || !token) {
    return sendError(res, 'Password and current TOTP token are required', 400);
  }

  const user = await User.findById(req.user._id);

  // Verify password
  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    return sendError(res, 'Invalid password', 401);
  }

  if (!user.totpEnabled) {
    return sendError(res, 'TOTP is not enabled', 400);
  }

  // Verify current TOTP token
  const verified = speakeasy.totp.verify({
    secret: user.totpSecret,
    encoding: 'base32',
    token: token,
    window: 2
  });

  if (!verified) {
    return sendError(res, 'Invalid TOTP token', 401);
  }

  // Disable TOTP
  user.totpEnabled = false;
  user.totpSecret = null;
  await user.save();

  // Create notification
  await createNotification(
    user._id,
    'Two-Factor Authentication has been disabled for your account'
  );

  log('TOTP disabled:', { userId: user._id });
  sendSuccess(res, { totpEnabled: false }, 'TOTP successfully disabled');
}));

module.exports = router;