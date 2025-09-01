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

```bash
# Setup everything
chmod +x setup.sh && ./setup.sh

# Start development
./start-app.sh
```

Or manual setup:

```bash
# Backend
cd backend
npm install
cp .env.example .env  # Edit .env with your MongoDB connection
npm run seed          # Create test users
npm run dev           # Start backend

# Frontend
cd frontend
npm install
npm start             # Start React frontend
```

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
