const Notification = require('../models/Notification');
const { log } = require('./logger');
const { sendNotificationToUser } = require('../routes/notifications');

/**
 * Create a notification for a user
 * @param {string} userId - The user ID to send notification to
 * @param {string} message - The notification message
 * @returns {Promise} - Returns the created notification
 */
const createNotification = async (userId, message) => {
    try {
        const notification = new Notification({
            user: userId,
            message: message,
            time: new Date(),
            unread: true
        });
        await notification.save();
        log(`Notification created for user ${userId}: ${message}`);
        // Send real-time notification via SSE
        sendNotificationToUser(userId, notification);
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

/**
 * Create notifications for multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {string} message - The notification message
 * @returns {Promise} - Returns array of created notifications
 */
const createBulkNotifications = async (userIds, message) => {
    try {
        const notifications = userIds.map(userId => ({
            user: userId,
            message: message,
            time: new Date(),
            unread: true
        }));

        const createdNotifications = await Notification.insertMany(notifications);
        log(`Bulk notifications created for ${userIds.length} users: ${message}`);
        return createdNotifications;
    } catch (error) {
        console.error('Error creating bulk notifications:', error);
        throw error;
    }
};

/**
 * Notification types for different backend operations
 */
const NotificationTypes = {
    // Auth notifications
    LOGIN_SUCCESS: (username) => `Welcome back, ${username}!`,
    ACCOUNT_CREATED: (username) => `Welcome to RoleVault, ${username}! Your account has been created successfully.`,
    PASSWORD_CHANGED: () => `Your password has been changed successfully.`,

    // API Key notifications
    API_KEY_CREATED: (keyName) => `New API key "${keyName}" has been created.`,
    API_KEY_EXPIRED: (keyName) => `API key "${keyName}" has expired.`,
    API_KEY_DELETED: (keyName) => `API key "${keyName}" has been deleted.`,

    // File notifications
    FILE_UPLOADED: (fileName) => `File "${fileName}" has been uploaded successfully.`,
    FILE_DOWNLOAD: (fileName) => `File "${fileName}" has been downloaded.`,
    FILE_DELETED: (fileName) => `File "${fileName}" has been deleted.`,

    // Request notifications
    REQUEST_SUBMITTED: (requestType) => `Your ${requestType} request has been submitted.`,
    REQUEST_APPROVED: (requestType) => `Your ${requestType} request has been approved.`,
    REQUEST_REJECTED: (requestType) => `Your ${requestType} request has been rejected.`,

    // Admin notifications
    NEW_USER_REGISTERED: (username) => `New user "${username}" has registered.`,
    USER_STATUS_CHANGED: (username, status) => `User "${username}" status changed to ${status}.`,

    // System notifications
    SYSTEM_MAINTENANCE: () => `System maintenance scheduled. Please save your work.`,
    SYSTEM_UPDATE: () => `System has been updated with new features.`,
};

module.exports = {
    createNotification,
    createBulkNotifications,
    NotificationTypes
};
