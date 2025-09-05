const express = require('express');
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications - Get notifications for the logged-in user
router.get('/', authenticate, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id, unread: true })
            .sort({ time: -1 })
            .limit(5);
        res.json({ notifications });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
});

module.exports = router;
// PATCH /api/notifications/:id/read - Mark a notification as read
router.patch('/:id/read', authenticate, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { $set: { unread: false } },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Failed to mark notification as read' });
    }
});
