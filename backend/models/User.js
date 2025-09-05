const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['admin', 'contributor', 'viewer'],
    default: 'viewer'
  },
  permissions: {
    type: [String],
    enum: [
      'rv.requests.create',
      'rv.requests.view',
      'rv.requests.viewAll',
      'rv.requests.approve',
      'rv.requests.reject',
      'rv.files.upload',
      'rv.files.download',
      'rv.files.makePublic',
      'rv.apiKeys.create',
      'rv.apiKeys.view',
      'rv.apiKeys.manage',
      'rv.apiKeys.viewAll',
      'rv.apiKeys.deleteAll',
      'rv.users.manage',
    ],
    default: function () {
      // Set default permissions based on role for backward compatibility
      switch (this.role) {
        case 'admin':
          return [
            'rv.requests.viewAll',
            'rv.requests.approve',
            'rv.requests.reject',
            'rv.files.upload',
            'rv.files.download',
            'rv.files.makePublic',
            'rv.apiKeys.create',
            'rv.apiKeys.view',
            'rv.apiKeys.manage',
            'rv.apiKeys.viewAll',
            'rv.apiKeys.deleteAll',
            'rv.users.manage',
          ];
        case 'contributor':
          return [
            'rv.files.upload',
            'rv.files.download',
            'rv.requests.create',
            'rv.requests.view',
            'rv.apiKeys.create',
            'rv.apiKeys.view',
            'rv.apiKeys.manage'
          ];
        case 'viewer':
        default:
          return [
            'rv.files.download',
            'rv.requests.create',
            'rv.requests.view',
          ];
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  profileImage: {
    type: String,
    default: null
  },
  // UI / profile fields used by frontend
  firstName: {
    type: String,
    trim: true,
    default: ''
  },
  lastName: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  experience: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive', ''],
    default: ''
  },
  interests: [{
    type: String
  }],
  newsletter: {
    type: Boolean,
    default: false
  },
  birthDate: {
    type: Date
  },
  portfolio: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Persist user's selected dashboard widgets (array of widget ids)
  dashboardWidgets: [{
    type: String
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get user without password
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
