import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NotFound from './pages/NotFound';
import { Toaster, toast, ToastBar } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import UploadFile from './pages/profile/UploadFile';
import DownloadFile from './pages/profile/DownloadFile';
import ProfileInformation from './pages/profile/ProfileInformation';
import UserManagement from './pages/admin/UserManagement';
import ApiKeyManagement from './pages/ApiKeyManagement';
import Requests from './pages/Requests';
import MyRequests from './pages/MyRequests';
import RequestForm from './pages/RequestForm';
import ApiHealth from './pages/ApiHealth';
import DocsGettingStarted from './pages/DocsGettingStarted';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import RandomPopup from './components/RandomPopup';
import { useRandomPopup } from './hooks/useRandomPopup';

import './index.css';

// App content component to access auth context
function AppContent() {
  const { user } = useAuth();
  const popup = useRandomPopup({
    enabled: true,
    isLoggedIn: !!user
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
          },
        }}
      >
        {(t) => (
          <ToastBar toast={t} style={t.style}>
            {({ icon, message }) => (
              <div className="flex items-center justify-between w-full" role='status'>
                <div className="flex items-center">
                  {icon && <span className="mr-2">{icon}</span>}
                  <span>{message}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.dismiss(t.id);
                  }}
                  className="ml-3 w-6 h-6 flex items-center justify-center text-lg font-bold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200 ease-in-out"
                  aria-label="Close notification"
                >
                  ×
                </button>
              </div>
            )}
          </ToastBar>
        )}
      </Toaster>
      <AppRoutes />

      {/* Welcome Popup - Shows once after login */}
      <RandomPopup
        isOpen={popup.isOpen}
        onClose={popup.close}
        onDismiss={popup.dismiss}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
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
        element={!user ? <Auth /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/register"
        element={!user ? <Auth /> : <Navigate to="/dashboard" replace />}
      />

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="docs/getting-started" element={<DocsGettingStarted />} />

        {/* Profile route - only ProfileInformation */}
        <Route path="profile" element={<ProfileInformation />} />

        {/* Upload/Download as separate routes */}
        <Route path="upload" element={
          <ProtectedRoute permissions={['rv.files.upload']}>
            <UploadFile />
          </ProtectedRoute>
        } />
        <Route path="download" element={
          <ProtectedRoute permissions={['rv.files.download']}>
            <DownloadFile />
          </ProtectedRoute>
        } />

        {/* API Key management */}
        <Route path="apikeys" element={
          <ProtectedRoute permissions={['rv.apiKeys.view']}>
            <ApiKeyManagement />
          </ProtectedRoute>
        } />

        {/* Request management */}
        <Route path="requests" element={
          <ProtectedRoute permissions={['rv.requests.viewAll']}>
            <Requests />
          </ProtectedRoute>
        } />

        {/* Users: view their own requests */}
        <Route path="requests/mine" element={
          <ProtectedRoute permissions={['rv.requests.view']}>
            <MyRequests />
          </ProtectedRoute>
        } />

        <Route path="requests/new" element={
          <ProtectedRoute permissions={['rv.requests.create']}>
            <RequestForm />
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="manage">
          <Route path="users" element={
            <ProtectedRoute permissions={['rv.users.manage']}>
              <UserManagement />
            </ProtectedRoute>
          } />
        </Route>
        {/* API Health (admin + contributor) */}
        <Route path="api/health" element={
          <ProtectedRoute permissions={['rv.apiKeys.view']}>
            <ApiHealth />
          </ProtectedRoute>
        } />
      </Route>

      {/* Catch all - show NotFound page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
