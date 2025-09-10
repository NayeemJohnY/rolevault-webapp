const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Unified authentication and authorization middleware
const auth = (permissions = []) => {
  return async (req, res, next) => {
    try {
      // Try to get token from header first, then from query params (for SSE)
      let token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token && req.query.token) {
        token = req.query.token;
      }

      if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Invalid token or account deactivated.' });
      }

      // Check permission authorization if permissions are specified
      if (permissions.length > 0) {
        const hasPermission = permissions.some(permission => user.permissions.includes(permission));
        if (!hasPermission) {
          return res.status(403).json({
            message: 'Access denied. Insufficient permissions.',
            required: permissions,
            userPermissions: user.permissions
          });
        }
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token.' });
    }
  };
};



const authenticate = auth();

// Permission-based convenience methods
const canManageUsers = auth(['rv.users.manage']);

const canCreateAPIKeys = auth(['rv.apiKeys.create']);
const canViewOwnApiKeys = auth(['rv.apiKeys.view']);
const canManageOwnApiKeys = auth(['rv.apiKeys.manage']);
const canViewAllApiKeys = auth(['rv.apiKeys.viewAll']);

const canSubmitRequests = auth(['rv.requests.create']);
const canViewAllRequests = auth(['rv.requests.viewAll']);
const canApproveRejectRequests = auth(['rv.requests.approve', 'rv.requests.reject']);

const canUploadFile = auth(['rv.files.upload']);
const canDownloadFile = auth(['rv.files.download']);


module.exports = {
  authenticate,
  canSubmitRequests,
  canCreateAPIKeys,
  canViewAllApiKeys,
  canManageUsers,
  canViewOwnApiKeys,
  canManageOwnApiKeys,
  canViewAllRequests,
  canApproveRejectRequests,
  canUploadFile,
  canDownloadFile
};
