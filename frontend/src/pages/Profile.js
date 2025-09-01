import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const Profile = () => {
  const tabs = [
    { name: 'Profile Information', href: '/profile/profile-information' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile Tools
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your files and preferences
        </p>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <NavLink
              key={tab.name}
              to={tab.href}
              className={({ isActive }) =>
                `py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${isActive
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`
              }
              data-testid={`profile-tab-${tab.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {tab.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Profile;
