const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Unified authentication and authorization middleware
const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Invalid token or account deactivated.' });
      }

      // Check role authorization if roles are specified
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ 
          message: 'Access denied. Insufficient permissions.',
          required: roles,
          userRole: user.role
        });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token.' });
    }
  };
};

// Check resource ownership or admin access
const ownerOrAdmin = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceId = req.params.id || req.params.userId || req.body[resourceField];
    if (req.user._id.toString() === resourceId) {
      return next();
    }

    return res.status(403).json({ message: 'Access denied. You can only access your own resources.' });
  };
};

// Convenience methods for common role combinations
const authenticate = auth();
const adminOnly = auth(['admin']);
const adminOrContributor = auth(['admin', 'contributor']);

module.exports = {
  auth,
  authenticate,
  adminOnly,
  adminOrContributor,
  ownerOrAdmin
};
