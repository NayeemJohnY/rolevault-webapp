const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const apiKeyRoutes = require('./routes/apiKeys');
const requestRoutes = require('./routes/requests');
const fileRoutes = require('./routes/files');
const dashboardRoutes = require('./routes/dashboard');
const { router: notificationRoutes } = require('./routes/notifications');
const rolesRoutes = require('./routes/roles');
const apiHealthRoutes = require('./routes/apiHealth');
const { errorHandler } = require('./utils/responseHandler');
const { scheduleApiKeyExpirationCheck, scheduleApiKeyExpirationWarning } = require('./utils/scheduledNotifications');
const { log } = require('./utils/logger');

const app = express();

// Logging middleware (logs every request)
app.use((req, res, next) => {
  log(`${req.method} ${req.originalUrl}: ${res.statusCode}`);
  next();
});

// Security middleware
app.use(helmet());

// Allow CORS from everywhere
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files for uploads (use absolute backend/uploads path)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/apikeys', apiKeyRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/roles', rolesRoutes);
app.use(apiHealthRoutes);

// Always serve static frontend files for all non-API routes
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Global error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  log(`🚀 RoleVault started successfully on port ${PORT}`);

  // Initialize notification schedulers
  scheduleApiKeyExpirationCheck();
  scheduleApiKeyExpirationWarning();
  log('📬 Notification system initialized');
});
