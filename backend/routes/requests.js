const express = require('express');
const Request = require('../models/Request');
const { authenticate, canApproveRejectRequests, canViewAllRequests, canSubmitRequests } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { createNotification, NotificationTypes } = require('../utils/notificationService');

const router = express.Router();

// Get own requests
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

// Get all requests for review 
router.get('/review', canViewAllRequests, async (req, res) => {
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
});

// Get request by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const filter = { _id: req.params.id };

    // Non-admin users can only see their own requests
    if (!req.user.permissions.includes('rv.requests.viewAll')) {
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
// Allow authenticated users with submit permission to submit requests.
router.post('/', canSubmitRequests, validate('request'), async (req, res) => {
  try {
    // Viewers are allowed to submit regular requests but not API key requests
    if (req.body.type === 'api_key' && !req.user.permissions.includes('rv.apiKeys.create')) {
      return res.status(403).json({ message: 'You do not have permission to request API keys.' });
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

    // Create notification for request submission
    await createNotification(req.user._id, NotificationTypes.REQUEST_SUBMITTED(request.type));

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
router.put('/:id', canSubmitRequests, async (req, res) => {
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

// Review request & Approve / Reject
router.patch('/:id/review', canApproveRejectRequests, async (req, res) => {
  try {
    const { status, reviewComment } = req.body;

    // Check if user has permission to approve or reject based on the status
    if (status === 'approved' && !req.user.permissions.includes('rv.requests.approve')) {
      return res.status(403).json({ message: 'You do not have permission to approve requests.' });
    }
    if (status === 'rejected' && !req.user.permissions.includes('rv.requests.reject')) {
      return res.status(403).json({ message: 'You do not have permission to reject requests.' });
    }

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

    // Create notification for request review
    if (status === 'approved') {
      await createNotification(request.requestedBy._id, NotificationTypes.REQUEST_APPROVED(request.type));
    } else if (status === 'rejected') {
      await createNotification(request.requestedBy._id, NotificationTypes.REQUEST_REJECTED(request.type));
    }

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
    if (!req.user.permissions.includes('rv.requests.viewAll')) {
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


module.exports = router;
