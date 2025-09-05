const cron = require('node-cron');
const ApiKey = require('../models/ApiKey');
const { createNotification, NotificationTypes } = require('../utils/notificationService');
const { log } = require('./logger');

// Check for expired API keys every day at midnight
const scheduleApiKeyExpirationCheck = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            log('🔍 Checking for expired API keys...');

            const now = new Date();
            const expiredApiKeys = await ApiKey.find({
                expiresAt: { $lte: now },
                isActive: true
            }).populate('userId', 'name email');

            for (const apiKey of expiredApiKeys) {
                // Deactivate the API key
                apiKey.isActive = false;
                await apiKey.save();

                // Create notification for the user
                await createNotification(
                    apiKey.userId._id,
                    NotificationTypes.API_KEY_EXPIRED(apiKey.name)
                );

                log(`🔑 API key "${apiKey.name}" expired for user ${apiKey.userId.email}`);
            }

            if (expiredApiKeys.length === 0) {
                log('✅ No expired API keys found');
            } else {
                log(`⚠️ ${expiredApiKeys.length} API keys expired and notifications sent`);
            }

        } catch (error) {
            console.error('❌ Error checking expired API keys:', error);
        }
    });

    log('⏰ API key expiration checker scheduled (daily at midnight)');
};

// Check for API keys expiring soon (within 7 days)
const scheduleApiKeyExpirationWarning = () => {
    cron.schedule('0 9 * * *', async () => {
        try {
            log('⚠️ Checking for API keys expiring soon...');

            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

            const now = new Date();

            const expiringSoonApiKeys = await ApiKey.find({
                expiresAt: {
                    $gte: now,
                    $lte: sevenDaysFromNow
                },
                isActive: true,
                expirationWarningNotified: { $ne: true }
            }).populate('userId', 'name email');

            for (const apiKey of expiringSoonApiKeys) {
                const daysUntilExpiry = Math.ceil((apiKey.expiresAt - now) / (1000 * 60 * 60 * 24));

                await createNotification(
                    apiKey.userId._id,
                    `Your API key "${apiKey.name}" will expire in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}.`
                );

                // Mark as notified to avoid duplicate warnings
                apiKey.expirationWarningNotified = true;
                await apiKey.save();

                log(`⏰ Expiration warning sent for API key "${apiKey.name}" (expires in ${daysUntilExpiry} days)`);
            }

            if (expiringSoonApiKeys.length === 0) {
                log('✅ No API keys expiring soon');
            } else {
                log(`📬 ${expiringSoonApiKeys.length} expiration warnings sent`);
            }

        } catch (error) {
            console.error('❌ Error checking API keys expiring soon:', error);
        }
    });

    log('⏰ API key expiration warning scheduler started (daily at 9 AM)');
};

module.exports = {
    scheduleApiKeyExpirationCheck,
    scheduleApiKeyExpirationWarning
};
