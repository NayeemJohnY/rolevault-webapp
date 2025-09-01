const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const apiKeyRoutes = require('./routes/apiKeys');
const requestRoutes = require('./routes/requests');
const fileRoutes = require('./routes/files');
const dashboardRoutes = require('./routes/dashboard');
const { errorHandler } = require('./utils/responseHandler');

const app = express();

// Logging middleware (logs every request)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  const body = req.body || {};
  const query = req.query || {};
  if (Object.keys(body).length) {
    console.log('Body:', body);
  }
  if (Object.keys(query).length) {
    console.log('Query:', query);
  }
  // Log response after it is sent
  const oldJson = res.json;
  res.json = function (data) {
    console.log(`[${new Date().toISOString()}] Response for ${req.method} ${req.originalUrl}:`, {
      status: res.statusCode,
      body: data
    });
    return oldJson.call(this, data);
  };
  next();
});

// Security middleware
app.use(helmet());
// CORS: only allow local frontend during development/testing
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/apikeys', apiKeyRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
