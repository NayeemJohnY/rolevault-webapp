import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import { formatDate } from '../utils/helpers';
import {
  Bars3Icon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  EnvelopeOpenIcon
} from '@heroicons/react/24/outline';

const Header = ({ onMenuClick, sidebarCollapsed }) => {
  const { user, logout, canManageUsers, canUploadFiles } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const lastFetchedUserId = useRef(null);
  const sseRef = useRef(null);
  const navigate = useNavigate();

  // Setup Server-Sent Events for notifications
  useEffect(() => {
    if (!user || lastFetchedUserId.current === user._id) return;
    lastFetchedUserId.current = user._id;

    // Close previous SSE connection if any
    if (sseRef.current) {
      sseRef.current.close();
    }

    // Initial fetch of existing notifications
    const fetchInitialNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications');
        setNotifications(response?.data?.notifications || []);
      } catch (err) {
        console.error('Failed to fetch initial notifications:', err);
      }
    };

    fetchInitialNotifications();

    // Open SSE connection with token in URL
    const token = localStorage.getItem('token');
    const sse = new window.EventSource(`/api/notifications/stream?token=${token}`);
    sseRef.current = sse;

    sse.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);

        // Skip connection messages
        if (notification.type === 'connected') {
          return;
        }

        setNotifications(prev => [notification, ...prev]);
      } catch (err) {
        console.error('Failed to parse SSE notification:', err);
      }
    };

    sse.onerror = (err) => {
      sse.close();
    };

    // Cleanup on unmount or user change
    return () => {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
    };
  }, [user]);

  // Log notification toggle
  const handleNotificationToggle = () => {
    setShowNotifications(prev => !prev);
  };

  return (
    <header className="app-header bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 fixed top-0 left-0 right-0 w-full z-50 shadow-sm">
      <div className="app-header__container flex items-center justify-between h-full px-6">
        {/* Left side */}
        <div className="app-header__left flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            data-testid="menu-button"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* My Vault header logo/title */}
          <div className="app-header__logo">
            <h1 className="app-header__title text-xl lg:text-2xl font-bold text-primary-700 dark:text-primary-300 tracking-tight" data-testid="page-header-logo">
              My Vault
            </h1>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              <a href={`${window.location.origin}/dashboard`} className="mr-3 underline">Dashboard</a>
              <a href={`${window.location.origin}/non-existent-link`} className="underline">Broken Link</a>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="app-header__right flex items-center space-x-4">
          {/* Theme toggle */}
          <button
            onClick={() => {
              toggleTheme();
            }}
            className="header__theme-toggle p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
            data-testid="theme-toggle"
          >
            {theme === 'light' ? (
              <MoonIcon className="w-5 h-5" />
            ) : (
              <SunIcon className="w-5 h-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="header__notifications relative">
            <button
              onClick={handleNotificationToggle}
              className="header__notification-button p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200 relative"
              data-testid="notifications-button"
            >
              <BellIcon className="w-5 h-5" />
              {notifications.some(n => n.unread) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="header__notification-dropdown absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="header__notification-header p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                </div>
                <div className="header__notification-list max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification._id || notification.id}
                        className={`header__notification-item p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 ${notification.unread ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                        data-testid={`notification-${notification._id || notification.id}`}
                      >
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(notification.time)}
                          </p>
                        </div>
                        <button
                          className="ml-2 p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900"
                          title="Mark as read"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await axios.patch(`/api/notifications/${notification._id || notification.id}/read`);
                              setNotifications((prev) => prev.filter((n) => (n._id || n.id) !== (notification._id || notification.id)));
                            } catch (err) {
                              // Optionally show error
                              console.error('Failed to mark notification as read:', err);
                            }
                          }}
                        >
                          <EnvelopeOpenIcon className="w-5 h-5 text-blue-500" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="header__notification-empty p-4 text-center text-gray-500 dark:text-gray-400">
                      No notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User avatar with dropdown */}
          <div className="header__avatar-wrapper relative group">
            <button
              className="header__avatar flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-label="Profile"
              tabIndex={0}
            >
              {/* User Avatar: show uploaded image when available */}
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="header__avatar-img w-10 h-10 rounded-full object-cover border-2 border-primary-500"
                />
              ) : (
                <div className="header__avatar-initial w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}

              {/* User Info - Show on desktop */}
              <div className="header__user-info hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white" data-testid="header-user-name">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400" data-testid="header-user-role">
                  {canManageUsers() ? 'Administrator' : canUploadFiles() ? 'Contributor' : 'Viewer'}
                </p>
              </div>
            </button>
            {/* Dropdown menu */}
            <div className="header__user-dropdown absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
              <div
                className="header__user-dropdown-profile px-4 py-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                role="button"
                tabIndex={0}
                onClick={() => navigate('/profile')}
                onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/profile'); }}
              >
                <UserCircleIcon className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white" data-testid="header-user-name">
                  My Profile
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    logout();
                  }
                }}
                className="header__user-dropdown-logout block w-full text-left px-4 py-2 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                data-testid="logout-button"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
