import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { log } from '../utils/helpers';

const ProtectedRoute = ({ children, permissions = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    log('[ProtectedRoute] Loading user...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    log('[ProtectedRoute] No user found. Redirecting to login.');
    return <Navigate to="/login" replace />;
  }

  // Check permissions first (new system)
  if (permissions.length > 0) {
    const hasPermission = permissions.some(permission => user.permissions?.includes(permission));
    if (!hasPermission) {
      log('[ProtectedRoute] Access denied for user:', user);
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      );
    }
  }


  log('[ProtectedRoute] Access granted for user:', user);
  return children;
};

export default ProtectedRoute;
