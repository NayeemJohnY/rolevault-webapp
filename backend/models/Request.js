const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['api_key', 'file_publish', 'role_upgrade', 'feature_access'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Request title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Request description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewComment: {
    type: String,
    maxlength: [300, 'Review comment cannot exceed 300 characters']
  },
  metadata: {
    // For storing request-specific data
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Add index for efficient querying
requestSchema.index({ requestedBy: 1, status: 1 });
requestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Request', requestSchema);
