const mongoose = require('mongoose');
const User = require('../models/User');
const ApiKey = require('../models/ApiKey');
const Request = require('../models/Request');
const path = require('path');
const { log } = require('../utils/logger');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await ApiKey.deleteMany({});
    await Request.deleteMany({});
    log('Cleared existing data');

    // Create test users
    const admin = new User({
      name: 'Admin User',
      email: 'admin@rolevault.com',
      password: 'admin123',
      role: 'admin',
      preferences: { theme: 'dark', notifications: true }
    });

    const contributor = new User({
      name: 'Contributor User',
      email: 'contributor@rolevault.com',
      password: 'contrib123',
      role: 'contributor',
      preferences: { theme: 'light', notifications: true }
    });

    const viewer = new User({
      name: 'Viewer User',
      email: 'viewer@rolevault.com',
      password: 'viewer123',
      role: 'viewer',
      preferences: { theme: 'light', notifications: false }
    });

    const contributor2 = new User({
      name: 'John Contributor',
      email: 'john@rolevault.com',
      password: 'john123',
      role: 'contributor'
    });

    await Promise.all([admin.save(), contributor.save(), viewer.save(), contributor2.save()]);
    log('Created test users');

    // Create test API keys
    const apiKey1 = new ApiKey({
      name: 'Production API Key',
      userId: contributor._id,
      permissions: ['read', 'write'],
      isActive: true
    });
    apiKey1.generateKey();

    const apiKey2 = new ApiKey({
      name: 'Development API Key',
      userId: contributor._id,
      permissions: ['read'],
      isActive: true
    });
    apiKey2.generateKey();

    const apiKey3 = new ApiKey({
      name: 'Admin API Key',
      userId: admin._id,
      permissions: ['read', 'write', 'delete', 'admin'],
      isActive: true
    });
    apiKey3.generateKey();

    const apiKey4 = new ApiKey({
      name: 'Testing Key',
      userId: contributor2._id,
      permissions: ['read'],
      isActive: false
    });
    apiKey4.generateKey();

    await Promise.all([apiKey1.save(), apiKey2.save(), apiKey3.save(), apiKey4.save()]);
    log('Created test API keys');

    // Create test requests
    const request1 = new Request({
      type: 'api_key',
      title: 'Request for Write Access API Key',
      description: 'I need an API key with write permissions to integrate with our CRM system.',
      requestedBy: contributor2._id,
      priority: 'high',
      status: 'pending',
      metadata: {
        permissions: ['read', 'write'],
        purpose: 'CRM Integration'
      }
    });

    const request2 = new Request({
      type: 'role_upgrade',
      title: 'Request for Contributor Role',
      description: 'I would like to be upgraded to contributor role to manage API keys.',
      requestedBy: viewer._id,
      priority: 'medium',
      status: 'pending'
    });

    const request3 = new Request({
      type: 'file_publish',
      title: 'Publish Training Documents',
      description: 'Request to make training documents publicly accessible.',
      requestedBy: contributor._id,
      priority: 'low',
      status: 'approved',
      reviewedBy: admin._id,
      reviewedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      reviewComment: 'Approved after security review'
    });

    const request4 = new Request({
      type: 'feature_access',
      title: 'Access to Advanced Analytics',
      description: 'Request access to the advanced analytics dashboard.',
      requestedBy: contributor2._id,
      priority: 'medium',
      status: 'denied',
      reviewedBy: admin._id,
      reviewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      reviewComment: 'Feature not available for your subscription tier'
    });

    await Promise.all([request1.save(), request2.save(), request3.save(), request4.save()]);
    log('Created test requests');

    log('✅ Seed data created successfully!');
    log('📧 Test Users:');
    log('Admin: admin@rolevault.com / admin123');
    log('Contributor: contributor@rolevault.com / contrib123');
    log('Viewer: viewer@rolevault.com / viewer123');
    log('Contributor 2: john@rolevault.com / john123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedData();
