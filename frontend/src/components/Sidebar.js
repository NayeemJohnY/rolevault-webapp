import React, { useState } from 'react';
import { FaGithub, FaLinkedin, FaStethoscope } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  KeyIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  ArrowLeftStartOnRectangleIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { log } from '../utils/helpers';

const Sidebar = ({ isOpen, onClose, collapsed, setCollapsed, onHover }) => {
  const {
    user,
    logout,
    canUploadFiles,
    canDownloadFiles,
    canViewApiKeys,
    canSubmitRequests,
    canManageUsers,
    canViewAllRequests
  } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onHover) onHover(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onHover) onHover(false);
  };

  const handleLogout = () => {
    log('[Sidebar] Logout clicked. User:', user);
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      show: true
    },
    {
      name: 'Upload File',
      href: '/upload',
      icon: DocumentArrowUpIcon,
      show: canUploadFiles()
    },
    {
      name: 'Download Files',
      href: '/download',
      icon: DocumentArrowDownIcon,
      show: canDownloadFiles()
    },
    {
      name: 'API Keys',
      href: '/apikeys',
      icon: KeyIcon,
      show: canViewApiKeys()
    },
    {
      name: 'Submit Request',
      href: '/requests/new',
      icon: PlusIcon,
      show: canSubmitRequests()
    },
    {
      name: 'My Requests',
      href: '/requests/mine',
      icon: ClipboardDocumentListIcon,
      show: canSubmitRequests()
    },
    {
      name: 'User Management',
      href: '/manage/users',
      icon: UserGroupIcon,
      show: canManageUsers()
    },
    {
      name: 'Review Requests',
      href: '/requests',
      icon: ClipboardDocumentListIcon,
      show: canViewAllRequests()
    }
  ];

  const filteredNavItems = navItems.filter(item => item.show);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl transition-all duration-500 ease-out transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${collapsed && !isHovered ? 'lg:w-20' : 'lg:w-64'} 
        w-64`}
      data-testid="sidebar"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col h-full">
        {/* Header with controls */}
        <div className={`h-16 border-b border-gray-200 dark:border-gray-700 transition-all duration-500 ease-out ${collapsed && !isHovered ? 'px-2' : 'px-6'}`}>
          <div className="flex items-center justify-center h-full">
            {/* Collapse/Expand button */}
            <button
              onClick={() => setCollapsed((prev) => !prev)}
              className="hidden lg:flex p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 items-center justify-center transition-all duration-300 ease-out hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-700"
              data-testid="toggle-sidebar-btn"
              title={collapsed && !isHovered ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Bars3Icon className="w-5 h-5 transition-transform duration-300 ease-out" />
            </button>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden flex p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 items-center justify-center"
              data-testid="close-sidebar-btn"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-6 space-y-1 overflow-y-auto transition-all duration-300 ${collapsed && !isHovered ? 'lg:px-2 px-4' : 'px-4'}`}>
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] ${isActive
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  } ${collapsed && !isHovered ? 'lg:p-3 lg:justify-center lg:w-12 lg:h-12 lg:mx-auto px-3 py-2' : 'px-3 py-2'}`
                }
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                title={collapsed && !isHovered ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <span className={`ml-3 font-medium transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${collapsed && !isHovered ? 'lg:max-w-0 lg:opacity-0 max-w-xs opacity-100' : 'max-w-xs opacity-100'
                  }`}>
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* External Links and Logout */}
        <div className={`border-t border-gray-200 dark:border-gray-700 space-y-3 transition-all duration-300 ${collapsed && !isHovered ? 'lg:p-2 p-4' : 'p-4'}`}>
          {/* External Links */}
          <div className={`flex items-center transition-all duration-300 ${collapsed && !isHovered ? 'lg:flex-col lg:gap-2 justify-center gap-3' : 'justify-center gap-3'}`}>
            {canViewApiKeys() && (
              <NavLink
                to="/api/health"
                title="API Health"
                className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 hover:scale-110"
                data-testid="sidebar-apihealth"
              >
                <FaStethoscope className="w-5 h-5 text-green-700 dark:text-green-300" />
              </NavLink>
            )}
            <a
              href="https://www.linkedin.com/in/nayeemjohny/"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 hover:scale-110"
              data-testid="sidebar-linkedin"
            >
              <FaLinkedin className="w-5 h-5 text-blue-700 dark:text-blue-300" />
            </a>
            <a
              href="https://github.com/NayeemJohnY"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
              data-testid="sidebar-github"
            >
              <FaGithub className="w-5 h-5 text-gray-900 dark:text-white" />
            </a>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`group flex items-center text-sm font-medium text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-[1.02] ${collapsed && !isHovered ? 'lg:w-12 lg:h-12 lg:justify-center lg:mx-auto lg:p-3 w-full px-3 py-2' : 'w-full px-3 py-2'
              }`}
            data-testid="logout-btn"
            title={collapsed && !isHovered ? 'Logout' : undefined}
          >
            <ArrowLeftStartOnRectangleIcon className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <span className={`ml-3 font-medium transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${collapsed && !isHovered ? 'lg:max-w-0 lg:opacity-0 max-w-xs opacity-100' : 'max-w-xs opacity-100'
              }`}>
              Logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
