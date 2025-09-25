# 🚀 RoleVault - Complete Project Overview

**RoleVault** is a modern, full-stack role-based access control system built with React, Express.js, MongoDB, and JWT authentication. It's designed as a comprehensive admin portal with user management, file operations, and request approval workflows.

## 🎯 Core Functionalities

### 1. **Authentication & Authorization**
- **JWT-based authentication** with secure token management
- **Role-based access control** with three distinct user roles:
  - **Admin**: Full system access
  - **Contributor**: Can create, upload, and submit requests
  - **Viewer**: Read-only access
- Secure password hashing with bcrypt
- Protected routes and middleware validation

### 2. **User Management (Admin Only)**
- View all users in a paginated table
- Delete users from the system
- Monitor user roles and activity
- User registration and profile management

### 3. **API Key Management**
- Create API keys with customizable permissions (`read`, `write`, `delete`, `admin`)
- Set expiration dates for keys
- View usage statistics and last request timestamps
- Regenerate and delete API keys
- Role-based visibility (admins see all keys, users see only their own)

### 4. **File Operations**
- **Upload files** with drag-and-drop interface
- Support for multiple file types (images, documents, archives)
- File metadata management (description, tags, visibility)
- **Download files** with search and filtering
- Public/private file visibility controls
- File size limits (10MB default)

### 5. **Request & Approval System**
- Submit different types of requests:
  - **API Key requests** (with specific permissions)
  - **Role upgrade requests** (contributor → admin)
  - **File publishing requests** (make files public)
  - **Feature access requests** (premium features)
- Admin approval/rejection workflow
- Priority levels (low, medium, high, urgent)
- Request tracking and status updates

### 6. **Dashboard & Analytics**
- **Drag-and-drop widget system** using @dnd-kit
- Role-specific dashboard content
- Statistics and metrics display
- Quick action buttons based on user role

### 7. **UI/UX Features**
- **Dark/Light theme** toggle with system preference detection
- Fully responsive design (mobile-first)
- Real-time notifications with react-hot-toast
- Loading states and error handling
- Modern design with Tailwind CSS

## 🛠️ What You Can Do

### As an **Admin** (`admin@rolevault.com` / `admin123`):
- ✅ Manage all users (view, delete)
- ✅ View and manage all API keys system-wide
- ✅ Approve/reject all user requests
- ✅ Access system settings and analytics
- ✅ Upload and download files
- ✅ Full dashboard access with admin widgets

### As a **Contributor** (`contributor@rolevault.com` / `contrib123`):
- ✅ Create and manage own API keys
- ✅ Upload files with metadata
- ✅ Download files (public + own private files)
- ✅ Submit requests for additional permissions
- ✅ Request role upgrades
- ✅ Access contributor-specific dashboard

### As a **Viewer** (`viewer@rolevault.com` / `viewer123`):
- ✅ View own profile and update preferences
- ✅ Download public files only
- ✅ Submit requests for access/upgrades
- ✅ Basic dashboard with limited widgets
- ❌ Cannot upload files
- ❌ Cannot create API keys

## 🎨 Supported Features

### **File Management**
- ✅ Drag-and-drop uploads
- ✅ Multiple file types: `jpeg`, `jpg`, `png`, `gif`, `pdf`, `doc`, `docx`, `txt`, `csv`, `xlsx`, `zip`
- ✅ File metadata (tags, descriptions)
- ✅ Public/private visibility
- ✅ Download tracking
- ✅ Search and filtering
- ✅ Pagination

### **API Key System**
- ✅ Granular permissions system
- ✅ Usage tracking and statistics
- ✅ Expiration management
- ✅ Key regeneration
- ✅ Secure key generation with crypto

### **Request System**
- ✅ Four request types supported
- ✅ Metadata fields for detailed requests
- ✅ Priority system
- ✅ Admin review with comments
- ✅ Status tracking (pending, approved, denied)

### **Security Features**
- ✅ Helmet.js security headers
- ✅ Rate limiting (100 requests/15 minutes)
- ✅ CORS configuration
- ✅ Input validation with Joi
- ✅ File upload restrictions
- ✅ JWT token expiration

## ❌ What's NOT Supported

### **Current Limitations**
- ❌ **Real-time notifications** (currently mock data)
- ❌ **Email notifications** for requests/approvals
- ❌ **Bulk operations** (delete multiple files/users at once)
- ❌ **File versioning** or history
- ❌ **Advanced user roles** beyond the three basic ones
- ❌ **OAuth integration** (Google, GitHub, etc.)
- ❌ **Two-factor authentication**
- ❌ **Audit logs** for tracking user actions
- ❌ **File preview** functionality
- ❌ **Advanced search** with filters across multiple fields
- ❌ **User groups** or team management
- ❌ **API documentation** or Swagger integration
- ❌ **Data export** functionality
- ❌ **Advanced analytics** or reporting
- ❌ **Custom themes** beyond dark/light mode

### **Technical Limitations**
- ❌ **Microservices architecture** (monolithic structure)
- ❌ **Redis caching** for performance optimization
- ❌ **Database migrations** or versioning
- ❌ **Automated testing** suite (though components have test IDs)
- ❌ **CI/CD pipeline** configuration
- ❌ **Docker containerization**
- ❌ **Load balancing** or clustering
- ❌ **Database backups** automation


## 🎯 Use Cases

**Perfect for:**
- Small to medium team administration
- Document management systems
- API key distribution platforms
- Internal tools with role-based access
- Learning modern full-stack development

**Tech Stack:**
- **Frontend**: React 18, Tailwind CSS, Axios, React Router v6
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT
- **Security**: bcrypt, Helmet.js, rate limiting, Joi validation

This project demonstrates modern full-stack development practices with a focus on security, user experience, and scalable architecture patterns.
