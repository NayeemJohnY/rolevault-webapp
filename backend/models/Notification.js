const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    time: { type: Date, default: Date.now },
    unread: { type: Boolean, default: true },
});

module.exports = mongoose.model('Notification', NotificationSchema);
