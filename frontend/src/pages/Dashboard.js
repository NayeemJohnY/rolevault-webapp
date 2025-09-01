import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Widget Component
function SortableWidget({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

const Dashboard = () => {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState([
    { id: 'stats', title: 'Statistics', content: 'User Stats Widget' },
    { id: 'activity', title: 'Recent Activity', content: 'Activity Feed Widget' },
    { id: 'requests', title: 'Pending Requests', content: 'Requests Widget' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getQuickActions = () => {
    const baseActions = [
      { title: 'View Profile', path: '/profile', icon: '👤' },
    ];

    if (user?.role === 'admin') {
      return [
        ...baseActions,
        { title: 'Manage Users', path: '/users', icon: '👥' },
        { title: 'System Settings', path: '/settings', icon: '⚙️' },
      ];
    }

    if (user?.role === 'contributor') {
      return [
        ...baseActions,
        { title: 'Submit Request', path: '/requests/new', icon: '📝' },
        { title: 'Upload File', path: '/upload', icon: '📤' },
        { title: 'Download Files', path: '/download', icon: '📥' },
      ];
    }

    return baseActions;
  };

  return (
    <div className="max-w-5xl mx-auto p-6" data-testid="dashboard">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" data-testid="welcome-message">
          {getGreeting()}, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Welcome to your dashboard. You're logged in as a <span className="font-semibold capitalize">{user?.role}</span>.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getQuickActions().map((action, index) => (
            <a
              key={index}
              href={action.path}
              className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              data-testid={`quick-action-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span className="text-2xl mr-3">{action.icon}</span>
              <span className="text-blue-700 dark:text-blue-300 font-medium">{action.title}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Draggable Widgets */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Dashboard Widgets <span className="text-sm text-gray-500">(Drag to reorder)</span>
        </h2>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={widgets.map(w => w.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4" data-testid="draggable-widgets">
              {widgets.map((widget) => (
                <SortableWidget key={widget.id} id={widget.id}>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-move border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">{widget.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{widget.content}</p>
                  </div>
                </SortableWidget>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Role-specific content */}
      {user?.role === 'admin' && (
        <div className="mt-6 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-4">Admin Panel</h2>
          <p className="text-red-700 dark:text-red-400">
            You have administrative privileges. Access user management, system settings, and analytics.
          </p>
        </div>
      )}

      {user?.role === 'contributor' && (
        <div className="mt-6 bg-green-50 dark:bg-green-900/20 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">Contributor Tools</h2>
          <p className="text-green-700 dark:text-green-400">
            You can submit requests, upload files, and collaborate on projects.
          </p>
        </div>
      )}

      {user?.role === 'viewer' && (
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">Viewer Access</h2>
          <p className="text-blue-700 dark:text-blue-400">
            You have read-only access to view content and download approved files.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
