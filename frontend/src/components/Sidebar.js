import React from 'react';
import { FaGithub, FaLinkedin, FaStethoscope } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  KeyIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose, onOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('[Sidebar] Logout clicked. User:', user);
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'My Profile',
      href: '/profile',
      icon: DocumentTextIcon,
      roles: ['admin', 'contributor', 'viewer']
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      roles: ['admin', 'contributor', 'viewer']
    },
    {
      name: 'Upload File',
      href: '/upload',
      icon: DocumentArrowUpIcon,
      roles: ['admin', 'contributor', 'viewer']
    },
    {
      name: 'Download Files',
      href: '/download',
      icon: DocumentArrowDownIcon,
      roles: ['admin', 'contributor', 'viewer']
    },

    {
      name: 'My API Keys',
      href: '/apikeys',
      icon: KeyIcon,
      roles: ['admin', 'contributor']
    },
    {
      name: 'Submit Request',
      href: '/requests/new',
      icon: PlusIcon,
      roles: ['contributor', 'viewer']
    },
    {
      name: 'User Management',
      href: '/manage/users',
      icon: UserGroupIcon,
      roles: ['admin']
    },
    {
      name: 'Review Requests',
      href: '/requests',
      icon: ClipboardDocumentListIcon,
      roles: ['admin']
    }
  ];

  const filteredNavItems = navItems.filter(item =>
    item.roles.includes(user?.role)
  );

  return (
    <div
      className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      data-testid="sidebar"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <NavLink
            to="/dashboard"
            className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            data-testid="app-logo"
          >
            AdminPortal
          </NavLink>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            data-testid="close-sidebar-btn"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white" data-testid="user-name">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize" data-testid="user-role">
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* External Links and Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">

          {/* External Links */}
          <div className="flex gap-3 mt-2">
            <a
              href="https://www.linkedin.com/in/nayeemjohny/"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
              className="p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30"
              data-testid="sidebar-linkedin"
            >
              <FaLinkedin className="w-6 h-6 text-blue-700 dark:text-blue-300" />
            </a>
            <a
              href="https://github.com/NayeemJohnY"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              data-testid="sidebar-github"
            >
              <FaGithub className="w-6 h-6 text-gray-900 dark:text-white" />
            </a>
            <a
              href="/api/health"
              target="_blank"
              rel="noopener noreferrer"
              title="API Health"
              className="p-2 rounded hover:bg-green-100 dark:hover:bg-green-900/30"
              data-testid="sidebar-apihealth"
            >
              <FaStethoscope className="w-6 h-6 text-green-700 dark:text-green-300" />
            </a>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
            data-testid="logout-btn"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
