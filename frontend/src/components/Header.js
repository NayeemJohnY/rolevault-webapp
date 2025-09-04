import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  Bars3Icon,
  BellIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

const Header = ({ onMenuClick, sidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  // Log user and theme info on mount
  React.useEffect(() => {
    console.log('[Header] Mounted. User:', user);
    console.log('[Header] Current theme:', theme);
  }, [user, theme]);

  const notifications = [
    {
      id: 1,
      message: 'New API key request submitted',
      time: '5 minutes ago',
      unread: true
    },
    {
      id: 2,
      message: 'File upload completed successfully',
      time: '1 hour ago',
      unread: false
    }
  ];

  // Log notification toggle
  const handleNotificationToggle = () => {
    setShowNotifications((prev) => {
      console.log('[Header] Notifications toggled:', !prev);
      return !prev;
    });
  };

  return (
    <header className="app-header bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16">
      <div className={`app-header__container flex items-center justify-between h-full px-6 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
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
          <div className="app-header__logo hidden lg:block">
            <h1 className="app-header__title text-2xl font-bold text-primary-700 dark:text-primary-300 tracking-tight" data-testid="page-header-logo">
              My Vault
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className="app-header__right flex items-center space-x-4">
          {/* Theme toggle */}
          <button
            onClick={() => {
              console.log('[Header] Theme toggle clicked. Previous theme:', theme);
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
                        key={notification.id}
                        className={`header__notification-item p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 ${notification.unread ? 'bg-blue-50 dark:bg-blue-900/10' : ''}
                          }`}
                        data-testid={`notification-${notification.id}`}
                      >
                        <p className="text-sm text-gray-900 dark:text-white">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {notification.time}
                        </p>
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
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize" data-testid="header-user-role">
                  {user?.role}
                </p>
              </div>
            </button>
            {/* Dropdown menu */}
            <div className="header__user-dropdown absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
              <div
                className="header__user-dropdown-profile px-4 py-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                role="button"
                tabIndex={0}
                onClick={() => navigate('/profile')}
                onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/profile'); }}
              >
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
                className="header__user-dropdown-logout block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                data-testid="logout-button"
              >
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
