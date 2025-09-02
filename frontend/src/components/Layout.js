import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Log sidebar state changes
  React.useEffect(() => {
    console.log('[Layout] Sidebar open:', sidebarOpen);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />
        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
      {/* Mobile sidebar overlay (optional, keep for mobile only) */}
    </div>
  );
};

export default Layout;
