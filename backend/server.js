const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const apiKeyRoutes = require('./routes/apiKeys');
const requestRoutes = require('./routes/requests');
const fileRoutes = require('./routes/files');
const dashboardRoutes = require('./routes/dashboard');
const apiHealthRoutes = require('./routes/apiHealth');
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

// CORS: Allow frontend and production domains
const allowedOrigins = [
  'http://localhost:3000', // Development frontend
  'http://localhost:5000', // Production single server
  process.env.FRONTEND_URL,
  process.env.PRODUCTION_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
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
app.use(apiHealthRoutes);

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build directory
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // Catch all handler: send back React's index.html file for any non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
} else {
  // Development mode: just handle 404 for API routes
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
}

// Global error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
