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

    // Pending requests widget - show for all roles (filtered by role)
    let pendingRequestsQuery = { status: 'pending' };
    if (userRole !== 'admin') {
      // Non-admins see only their own pending requests
      pendingRequestsQuery.requestedBy = userId;
    }

    const pendingRequests = await Request.find(pendingRequestsQuery)
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title type priority createdAt requestedBy');

    dashboardData.widgets.push({
      id: 'pending-requests',
      type: 'requests',
      title: 'Pending Requests',
      data: {
        requests: pendingRequests,
        count: pendingRequests.length,
        isAdmin: userRole === 'admin'
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
      title: 'File Statistics',
      data: fileStats[0] || { totalFiles: 0, totalSize: 0, totalDownloads: 0 }
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
