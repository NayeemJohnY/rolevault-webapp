# 🚀 RoleVault
>A modern, full-stack web app with role-based access control, user management, file operations, and request approval workflows. Built with React, Express, MongoDB, and JWT authentication.

## 🏗️ Architecture

**Backend (Express + MongoDB)**
- Unified auth middleware (`auth.js`)
- Universal response handler (`responseHandler.js`)
- Consolidated validation (Joi)
- Streamlined route handlers

**Frontend (React + Tailwind CSS)**
- Universal API hook (`useApi.js`)
- Simplified auth context
- Paginated data hook (`usePaginatedData.js`)
- Streamlined components

## 🚀 Quick Start

### Method 1: Using Scripts with PM2 (Recommended)
```bash
# Make scripts executable (Linux/Mac)
chmod +x start-app.sh stop-app.sh

# Start the application
./start-app.sh

# Access the app
# Open http://localhost:5000 in your browser

# To stop
./stop-app.sh
```

### Method 2: Using npm scripts
```bash
# Install all dependencies
npm run install:all

# Build frontend and start single server
npm start

# Access: http://localhost:5000
# Stop with Ctrl+C
```

### Method 3: Manual setup (Step by step)

### Method 3: Manual setup (Step by step)

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env file with your MongoDB Atlas connection string

# 3. Seed the database (create test users)
npm run seed

# 4. Install frontend dependencies
cd ../frontend
npm install

# 5. Build frontend
npm run build

# 6. Start backend server (serves frontend)
cd ../backend
npm start

# Access: http://localhost:5000
```

## 🔧 Prerequisites

Before running the project, make sure you have:

1. **Node.js** (v16 or higher) and **npm**
2. **PM2** (will be auto-installed if not present)
3. **MongoDB Atlas account** (cloud database)

## ⚙️ Environment Setup

### MongoDB Atlas Setup
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier works fine)
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string

### Environment Variables
Copy `backend/.env.example` to `backend/.env` and update:
```bash
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rolevault?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
MAX_FILE_SIZE=10485760
```

## 📋 PM2 Process Management

Once started with `./start-app.sh`, you can manage the application using PM2 commands:

```bash
# View running processes
pm2 status

# View logs
pm2 logs rolevault-app

# View real-time logs
pm2 logs rolevault-app --lines 50

# Restart the app
pm2 restart rolevault-app

# Stop the app
pm2 stop rolevault-app

# Delete the app from PM2
pm2 delete rolevault-app

# Save PM2 process list (auto-restart after reboot)
pm2 save
pm2 startup
```

# Frontend
cd frontend
npm install
npm start             # Start React frontend
```

**Access:** `http://localhost:5000`

## 👤 User Roles & Test Users

- **Admin**: admin@test.com / admin123
- **Contributor**: contributor@test.com / contributor123
- **Viewer**: viewer@test.com / viewer123

## 🔑 Features

- Role-based access control (Admin, Contributor, Viewer)
- JWT authentication
- User management (Admin)
- API key management
- File upload/download with permissions
- Request approval workflow
- Drag-and-drop dashboard widgets (@dnd-kit)
- Dark/light theme (Tailwind CSS)
- Responsive design
- Real-time notifications
- Form validation (Joi)
- Consistent error handling
- Security headers & rate limiting

## 📁 Project Structure

```
RoleVault/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   └── utils/
│   └── public/
└── backend/
    ├── routes/
    ├── models/
    ├── middleware/
    ├── utils/
    └── scripts/
```

## 🎯 API Endpoints (Simplified)

All endpoints return:
```json
{
    "success": true|false,
    "message": "Status message",
    "data": { ... },
    "errors": [ ... ]
}
```

**Authentication**
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile

**Users (Admin only)**
- `GET /api/users` - List users (paginated)
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

**API Keys**
- `GET /api/apikeys` - List API keys
- `POST /api/apikeys` - Create API key
- `DELETE /api/apikeys/:id` - Delete API key

**Requests**
- `GET /api/requests` - List requests
- `POST /api/requests` - Submit request
- `PUT /api/requests/:id/review` - Review request (Admin)

**Files**
- `POST /api/files/upload` - Upload file
- `GET /api/files` - List files
- `GET /api/files/:id/download` - Download file

**Dashboard**
- `GET /api/dashboard/stats` - Dashboard stats

## 🧪 Testing

- All components have `data-testid` attributes for Playwright testing

## 🛡️ Security

- Helmet.js for security headers
- Rate limiting (100 requests/15 min)
- JWT token expiration
- Password hashing (bcrypt)
- Input validation (Joi)
- CORS configuration
- File upload restrictions

## 🌙 Development Notes

- Modern JavaScript & React hooks
- File uploads stored in `backend/uploads/`
- JWT tokens expire after 24 hours
- Passwords hashed with bcryptjs (salt rounds: 10)

## 📦 Technology Stack

**Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Multer, Joi
**Frontend**: React 18, React Router v6, @dnd-kit, Tailwind CSS, Axios, React Hot Toast

## 📚 Learn More

- Backend: Express.js, MongoDB, Mongoose
- Frontend: React, Context API, Hooks
- Styling: Tailwind CSS
- Auth: JWT, role-based middleware
- Validation: Joi
- File Handling: Multer
