const express = require('express');
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// SSE clients storage
let clients = [];

// GET /api/notifications/stream - SSE endpoint for real-time notifications
router.get('/stream', authenticate, (req, res) => {
    // Set headers for SSE
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
    });
    res.flushHeaders();

    // Add client to the list
    const clientId = req.user._id.toString();
    const client = { id: clientId, res, userId: req.user._id };
    clients.push(client);

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connected' })}\n\n`);

    // Remove client on disconnect
    req.on('close', () => {
        clients = clients.filter(c => c.id !== clientId);
        console.log(`SSE client disconnected: ${clientId}`);
    });

    req.on('error', () => {
        clients = clients.filter(c => c.id !== clientId);
    });
});

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

// Utility function to send notification to a specific user via SSE
function sendNotificationToUser(userId, notification) {
    const userClients = clients.filter(c => c.userId.toString() === userId.toString());
    userClients.forEach(client => {
        try {
            client.res.write(`data: ${JSON.stringify(notification)}\n\n`);
        } catch (err) {
            console.error('Error sending SSE notification:', err);
            // Remove broken client
            clients = clients.filter(c => c.id !== client.id);
        }
    });
}

module.exports = { router, sendNotificationToUser };
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
