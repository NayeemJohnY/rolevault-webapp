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

      {/* Header (full width) */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* Main content (shift right on large screens to account for fixed sidebar) */}
      <div className="lg:ml-20">
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
