const express = require('express');
const User = require('../models/User');
const ApiKey = require('../models/ApiKey');
const Request = require('../models/Request');
const File = require('../models/File');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get dashboard data based on user role
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    let dashboardData = {
      user: req.user,
      widgets: []
    };

    // Common widgets for all users
    dashboardData.widgets.push({
      id: 'profile-summary',
      type: 'profile',
      title: 'Profile Summary',
      data: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        lastLogin: req.user.lastLogin,
        joinDate: req.user.createdAt
      }
    });

    // File statistics for all users
    const fileStats = await File.aggregate([
      { $match: { uploadedBy: userId } },
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: '$size' },
          totalDownloads: { $sum: '$downloadCount' }
        }
      }
    ]);

    dashboardData.widgets.push({
      id: 'file-stats',
      type: 'stats',
      title: 'My Files',
      data: fileStats[0] || { totalFiles: 0, totalSize: 0, totalDownloads: 0 }
    });

    // Role-specific widgets
    if (userRole === 'admin') {
      // Admin-specific widgets
      const userStats = await User.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
            contributors: { $sum: { $cond: [{ $eq: ['$role', 'contributor'] }, 1, 0] } },
            viewers: { $sum: { $cond: [{ $eq: ['$role', 'viewer'] }, 1, 0] } }
          }
        }
      ]);

      dashboardData.widgets.push({
        id: 'user-stats',
        type: 'admin-stats',
        title: 'User Management',
        data: userStats[0] || { total: 0, active: 0, admins: 0, contributors: 0, viewers: 0 }
      });

      const pendingRequests = await Request.countDocuments({ status: 'pending' });
      dashboardData.widgets.push({
        id: 'pending-requests',
        type: 'notification',
        title: 'Pending Requests',
        data: { count: pendingRequests }
      });

      const apiKeyStats = await ApiKey.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            totalRequests: { $sum: '$usage.totalRequests' }
          }
        }
      ]);

      dashboardData.widgets.push({
        id: 'api-key-stats',
        type: 'stats',
        title: 'API Keys Overview',
        data: apiKeyStats[0] || { total: 0, active: 0, totalRequests: 0 }
      });
    }

    if (userRole === 'contributor' || userRole === 'admin') {
      // API key stats for contributors and admins
      const myApiKeys = await ApiKey.find({ userId }).countDocuments();
      const myRequests = await Request.find({ requestedBy: userId }).countDocuments();

      dashboardData.widgets.push({
        id: 'my-api-keys',
        type: 'stats',
        title: 'My API Keys',
        data: { count: myApiKeys }
      });

      dashboardData.widgets.push({
        id: 'my-requests',
        type: 'stats',
        title: 'My Requests',
        data: { count: myRequests }
      });
    }

    // Recent activity for all users
    const recentFiles = await File.find({ uploadedBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('originalName createdAt');

    dashboardData.widgets.push({
      id: 'recent-activity',
      type: 'activity',
      title: 'Recent Activity',
      data: { recentFiles }
    });

    // Theme widget for all users
    dashboardData.widgets.push({
      id: 'theme-switcher',
      type: 'theme',
      title: 'Theme Settings',
      data: { currentTheme: req.user.preferences?.theme || 'light' }
    });

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Get recent activity across the system (Admin only)
router.get('/activity', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    // Get recent files
    const recentFiles = await File.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('originalName uploadedBy createdAt');

    // Get recent requests
    const recentRequests = await Request.find()
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title type status requestedBy createdAt');

    res.json({
      recentUsers,
      recentFiles,
      recentRequests
    });
  } catch (error) {
    console.error('Error fetching activity data:', error);
    res.status(500).json({ message: 'Error fetching activity data' });
  }
});

// Update user theme preference
router.patch('/theme', authenticate, async (req, res) => {
  try {
    const { theme } = req.body;
    
    if (!['light', 'dark'].includes(theme)) {
      return res.status(400).json({ message: 'Invalid theme. Must be light or dark.' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      'preferences.theme': theme
    });

    res.json({ message: 'Theme updated successfully' });
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ message: 'Error updating theme' });
  }
});

module.exports = router;
