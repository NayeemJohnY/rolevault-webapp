import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadFile from './pages/profile/UploadFile';
import DownloadFile from './pages/profile/DownloadFile';
import ProfileInformation from './pages/profile/ProfileInformation';
import UserManagement from './pages/admin/UserManagement';
import ApiKeyManagement from './pages/ApiKeyManagement';
import Requests from './pages/Requests';
import RequestForm from './pages/RequestForm';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                },
              }}
            />
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
      />

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Profile route - only ProfileInformation */}
        <Route path="profile" element={<ProfileInformation />} />

        {/* Upload/Download as separate routes */}
        <Route path="upload" element={<UploadFile />} />
        <Route path="download" element={<DownloadFile />} />

        {/* API Key management */}
        <Route path="apikeys" element={
          <ProtectedRoute roles={['admin', 'contributor']}>
            <ApiKeyManagement />
          </ProtectedRoute>
        } />

        {/* Request management */}
        <Route path="requests" element={
          <ProtectedRoute roles={['admin']}>
            <Requests />
          </ProtectedRoute>
        } />

        <Route path="requests/new" element={
          <ProtectedRoute roles={['contributor', 'viewer']}>
            <RequestForm />
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="manage">
          <Route path="users" element={
            <ProtectedRoute roles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
