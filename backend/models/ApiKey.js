const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'API key name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  key: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'delete', 'admin']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
    }
  },
  usage: {
    totalRequests: {
      type: Number,
      default: 0
    },
    lastRequest: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Generate API key
apiKeySchema.methods.generateKey = function() {
  const crypto = require('crypto');
  this.key = 'ak_' + crypto.randomBytes(32).toString('hex');
  return this.key;
};

// Check if API key is expired
apiKeySchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

module.exports = mongoose.model('ApiKey', apiKeySchema);
