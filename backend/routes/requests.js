const express = require('express');
const Request = require('../models/Request');
const { authenticate, adminOnly, adminOrContributor } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Get requests (Admin sees all, others see only their own)
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;

    // Build filter based on user role
    const filter = {};
    // Always filter by user for this endpoint (My Requests)
    filter.requestedBy = req.user._id;

    if (status) filter.status = status;
    if (type) filter.type = type;

    const requests = await Request.find(filter)
      .populate('requestedBy', 'name email role')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Request.countDocuments(filter);

    res.json({
      requests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// Get all requests for admin review (Admin only)
router.get('/admin/review', authenticate, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const requests = await Request.find(filter)
      .populate('requestedBy', 'name email role')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Request.countDocuments(filter);

    res.json({
      requests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching requests for review:', error);
    res.status(500).json({ message: 'Error fetching requests for review' });
  }
});// Get request by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const filter = { _id: req.params.id };

    // Non-admin users can only see their own requests
    if (req.user.role !== 'admin') {
      filter.requestedBy = req.user._id;
    }

    const request = await Request.findOne(filter)
      .populate('requestedBy', 'name email role')
      .populate('reviewedBy', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ request });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ message: 'Error fetching request' });
  }
});

// Create new request
// Allow any authenticated user (including viewers) to submit requests.
router.post('/',
  authenticate,
  validate('request'),
  async (req, res) => {
    try {
      // Viewers are allowed to submit regular requests but not API key requests
      if (req.user.role === 'viewer' && req.body.type === 'api_key') {
        return res.status(403).json({ message: 'Viewers are not permitted to request API keys.' });
      }
      const { type, title, description, priority = 'medium', metadata = {} } = req.body;

      const request = new Request({
        type,
        title,
        description,
        priority,
        metadata,
        requestedBy: req.user._id
      });

      await request.save();
      await request.populate('requestedBy', 'name email role');

      res.status(201).json({
        message: 'Request submitted successfully',
        request
      });
    } catch (error) {
      console.error('Error creating request:', error);
      res.status(500).json({ message: 'Error creating request' });
    }
  }
);

// Update request (only for pending requests by the requester)
// Allow the original requester (including viewers) to update their pending requests.
router.put('/:id', authenticate, async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      requestedBy: req.user._id,
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({
        message: 'Request not found or cannot be modified'
      });
    }

    const { title, description, priority, metadata } = req.body;
    const updates = {};

    if (title) updates.title = title;
    if (description) updates.description = description;
    if (priority) updates.priority = priority;
    if (metadata) updates.metadata = metadata;

    Object.assign(request, updates);
    await request.save();
    await request.populate('requestedBy', 'name email role');

    res.json({
      message: 'Request updated successfully',
      request
    });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Error updating request' });
  }
});

// Review request (Admin only)
router.patch('/:id/review',
  authenticate,
  adminOnly,
  validate('request'),
  async (req, res) => {
    try {
      const { status, reviewComment } = req.body;

      const request = await Request.findOne({
        _id: req.params.id,
        status: 'pending'
      });

      if (!request) {
        return res.status(404).json({
          message: 'Request not found or already reviewed'
        });
      }

      request.status = status;
      request.reviewedBy = req.user._id;
      request.reviewedAt = new Date();
      if (reviewComment) request.reviewComment = reviewComment;

      await request.save();
      await request.populate(['requestedBy reviewedBy'], 'name email role');

      res.json({
        message: `Request ${status} successfully`,
        request
      });
    } catch (error) {
      console.error('Error reviewing request:', error);
      res.status(500).json({ message: 'Error reviewing request' });
    }
  }
);

// Delete request (Admin or requester for pending requests)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const filter = { _id: req.params.id };

    // Admin can delete any request, users can only delete their own pending requests
    if (req.user.role !== 'admin') {
      filter.requestedBy = req.user._id;
      filter.status = 'pending';
    }

    const request = await Request.findOneAndDelete(filter);

    if (!request) {
      return res.status(404).json({
        message: 'Request not found or cannot be deleted'
      });
    }

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ message: 'Error deleting request' });
  }
});

// Get pending requests count for admin dashboard
router.get('/stats/pending', authenticate, adminOnly, async (req, res) => {
  try {
    const pendingCount = await Request.countDocuments({ status: 'pending' });

    const recentRequests = await Request.find({ status: 'pending' })
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      pendingCount,
      recentRequests
    });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Error fetching pending requests' });
  }
});

// Get request statistics (Admin only)
router.get('/stats/overview', authenticate, adminOnly, async (req, res) => {
  try {
    const stats = await Request.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Request.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      pending: 0,
      approved: 0,
      denied: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    res.json({
      statusStats: formattedStats,
      typeStats
    });
  } catch (error) {
    console.error('Error fetching request stats:', error);
    res.status(500).json({ message: 'Error fetching request statistics' });
  }
});

module.exports = router;
