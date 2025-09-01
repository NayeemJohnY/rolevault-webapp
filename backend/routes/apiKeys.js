const express = require('express');
const ApiKey = require('../models/ApiKey');
const { authenticate, adminOnly, adminOrContributor } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Get API keys (Admin sees all, Contributors see only their own)
router.get('/', authenticate, adminOrContributor, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    // Build filter based on user role
    const filter = {};
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }
    
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const apiKeys = await ApiKey.find(filter)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ApiKey.countDocuments(filter);

    res.json({
      apiKeys,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ message: 'Error fetching API keys' });
  }
});

// Get API key by ID
router.get('/:id', authenticate, adminOrContributor, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    
    // Non-admin users can only see their own API keys
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }

    const apiKey = await ApiKey.findOne(filter)
      .populate('userId', 'name email role');
    
    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    res.json({ apiKey });
  } catch (error) {
    console.error('Error fetching API key:', error);
    res.status(500).json({ message: 'Error fetching API key' });
  }
});

// Create new API key
router.post('/', 
  authenticate, 
  adminOrContributor, 
  validate('apiKey'), 
  async (req, res) => {
    try {
      const { name, permissions = ['read'], expiresAt } = req.body;

      // Create new API key
      const apiKey = new ApiKey({
        name,
        userId: req.user._id,
        permissions,
        expiresAt
      });

      // Generate the key
      apiKey.generateKey();
      await apiKey.save();

      // Populate user info
      await apiKey.populate('userId', 'name email role');

      res.status(201).json({
        message: 'API key created successfully',
        apiKey
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      res.status(500).json({ message: 'Error creating API key' });
    }
  }
);

// Update API key
router.put('/:id', authenticate, adminOrContributor, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    
    // Non-admin users can only update their own API keys
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }

    const { name, permissions, isActive } = req.body;
    const updates = {};
    
    if (name) updates.name = name;
    if (permissions) updates.permissions = permissions;
    if (isActive !== undefined) updates.isActive = isActive;

    const apiKey = await ApiKey.findOneAndUpdate(
      filter,
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'name email role');

    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    res.json({
      message: 'API key updated successfully',
      apiKey
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).json({ message: 'Error updating API key' });
  }
});

// Delete API key
router.delete('/:id', authenticate, adminOrContributor, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    
    // Non-admin users can only delete their own API keys
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }

    const apiKey = await ApiKey.findOneAndDelete(filter);
    
    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({ message: 'Error deleting API key' });
  }
});

// Regenerate API key
router.post('/:id/regenerate', authenticate, adminOrContributor, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    
    // Non-admin users can only regenerate their own API keys
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }

    const apiKey = await ApiKey.findOne(filter);
    
    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    // Generate new key
    apiKey.generateKey();
    apiKey.usage.totalRequests = 0;
    apiKey.usage.lastRequest = null;
    apiKey.lastUsed = null;
    
    await apiKey.save();
    await apiKey.populate('userId', 'name email role');

    res.json({
      message: 'API key regenerated successfully',
      apiKey
    });
  } catch (error) {
    console.error('Error regenerating API key:', error);
    res.status(500).json({ message: 'Error regenerating API key' });
  }
});

// Get API key statistics (Admin only)
router.get('/stats/overview', authenticate, adminOnly, async (req, res) => {
  try {
    const stats = await ApiKey.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          expired: { 
            $sum: { 
              $cond: [{ $lt: ['$expiresAt', new Date()] }, 1, 0] 
            } 
          },
          totalRequests: { $sum: '$usage.totalRequests' }
        }
      }
    ]);

    const recentKeys = await ApiKey.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: stats[0] || { total: 0, active: 0, expired: 0, totalRequests: 0 },
      recentKeys
    });
  } catch (error) {
    console.error('Error fetching API key stats:', error);
    res.status(500).json({ message: 'Error fetching API key statistics' });
  }
});

module.exports = router;
