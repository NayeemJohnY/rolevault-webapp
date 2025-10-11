import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';


const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = React.useRef(false);

  // Configure axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Check if user is authenticated on app load
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/api/auth/me');
          setUser(response.data.user);
          try {
            localStorage.setItem('user_role', response.data.user.role);
            localStorage.setItem('user_permissions', JSON.stringify(response.data.user.permissions || []));
          } catch (e) { }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const data = response.data;

      // Check if TOTP verification is required
      if (data.requiresTOTP) {
        return {
          success: false,
          requiresTOTP: true,
          tempToken: data.tempToken
        };
      }

      // Normal login flow
      const { user: userData, token } = data;

      localStorage.setItem('token', token);
      try {
        localStorage.setItem('user_role', userData.role);
        localStorage.setItem('user_permissions', JSON.stringify(userData.permissions || []));
      } catch (e) { }
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);

      toast.success(`Welcome back, ${userData.name}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyTOTP = async (tempToken, totpCode) => {
    try {
      const response = await axios.post('/api/auth/totp/verify-login', {
        tempToken,
        token: totpCode
      });

      const { user: userData, token } = response.data;

      localStorage.setItem('token', token);
      try {
        localStorage.setItem('user_role', userData.role);
        localStorage.setItem('user_permissions', JSON.stringify(userData.permissions || []));
      } catch (e) {
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);

      toast.success(`Welcome back, ${userData.name}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid TOTP code';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { user: newUser, token } = response.data;

      localStorage.setItem('token', token);
      try {
        localStorage.setItem('user_role', newUser.role);
        localStorage.setItem('user_permissions', JSON.stringify(newUser.permissions || []));
      } catch (e) { }
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(newUser);

      toast.success(`Account created successfully! Welcome, ${newUser.name}!`);
      return { success: true };
    } catch (error) {
      const data = error.response?.data;
      const message = data?.message || 'Registration failed';

      // Map validation errors (Joi) to fieldErrors for the UI
      const fieldErrors = {};
      if (Array.isArray(data?.errors)) {
        data.errors.forEach((err) => {
          if (err.field) fieldErrors[err.field] = err.message;
        });
      }

      // Handle common duplicate email message from server
      if (!Object.keys(fieldErrors).length && /already exists/i.test(message)) {
        fieldErrors.email = message;
      }

      if (Object.keys(fieldErrors).length) {
        toast.error(message);
        return { success: false, error: message, fieldErrors };
      }

      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    try {
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_permissions');
    } catch (e) { }
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (updates, showToast = true) => {
    try {
      const response = await axios.put('/api/auth/me', updates);
      setUser(response.data.user);
      try {
        localStorage.setItem('user_role', response.data.user.role);
        localStorage.setItem('user_permissions', JSON.stringify(response.data.user.permissions || []));
      } catch (e) { }
      if (showToast) {
        toast.success('Profile updated successfully');
      }
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const hasPermission = (permissions) => {
    if (!user) return false;
    if (Array.isArray(permissions)) {
      return permissions.some(permission => user.permissions?.includes(permission));
    }
    return user.permissions?.includes(permissions);
  };

  const canManageUsers = () => hasPermission('rv.users.manage');
  const canViewAllRequests = () => hasPermission('rv.requests.viewAll');
  const canApproveRequests = () => hasPermission(['rv.requests.approve', 'rv.requests.reject']);
  const canSubmitRequests = () => hasPermission('rv.requests.create');
  const canViewApiKeys = () => hasPermission(['rv.apiKeys.view']);
  const canViewAllAPIKeys = () => hasPermission(['rv.apiKeys.viewAll']);
  const canUploadFiles = () => hasPermission('rv.files.upload');
  const canDownloadFiles = () => hasPermission('rv.files.download');
  const canMakeFilesPublic = () => hasPermission('rv.files.makePublic');

  const value = {
    user,
    loading,
    login,
    verifyTOTP,
    register,
    logout,
    updateProfile,
    hasPermission,
    canManageUsers,
    canViewAllRequests,
    canApproveRequests,
    canSubmitRequests,
    canViewApiKeys,
    canViewAllAPIKeys,
    canUploadFiles,
    canDownloadFiles,
    canMakeFilesPublic
  }; return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
