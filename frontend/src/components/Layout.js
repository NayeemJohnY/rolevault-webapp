import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';


const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [sidebarHovered, setSidebarHovered] = useState(false);



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onHover={setSidebarHovered}
      />

      {/* Backdrop blur overlay - visible when sidebar is open, expanded, or hovered */}
      {(sidebarOpen || !sidebarCollapsed || sidebarHovered) && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-30 transition-opacity duration-500 ease-out"
          style={{ WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)' }}
          onClick={() => {
            setSidebarOpen(false);
            setSidebarCollapsed(true);
            setSidebarHovered(false);
          }}
        />
      )}

      {/* Header (fixed, full width) */}
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarCollapsed={sidebarCollapsed && !sidebarHovered} />

      {/* Main content - always has left padding on desktop to avoid sidebar overlap */}
      <div
        className={`w-full lg:pl-20 ${sidebarOpen ? 'pointer-events-none select-none' : ''
          }`}
        style={{ paddingTop: '4rem' }}
      >
        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
