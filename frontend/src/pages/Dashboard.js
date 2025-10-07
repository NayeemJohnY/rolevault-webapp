import React, { useState } from 'react';
import { FaThLarge, FaClipboardList, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
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
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

const ALL_WIDGETS = [
  { id: 'pending-requests', title: 'Pending Requests', content: 'View pending requests needing review' },
  { id: 'file-stats', title: 'File Statistics', content: 'Your file upload statistics' },
];

const Dashboard = () => {
  const { user, updateProfile, canManageUsers, canUploadFiles, canDownloadFiles, canViewAllRequests } = useAuth();

  // Widgets currently in dashboard
  const [widgets, setWidgets] = useState([]);
  // Widgets available in right pane
  const [availableWidgets, setAvailableWidgets] = useState(ALL_WIDGETS);
  // Expanded state for floating pane
  const [expanded, setExpanded] = useState(false);
  const lastFetchedUserId = React.useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handles drag end for dashboard area
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    // Dragging from available pane to dashboard
    if (availableWidgets.find(w => w.id === active.id)) {
      const widget = availableWidgets.find(w => w.id === active.id);
      setAvailableWidgets((prev) => prev.filter(w => w.id !== active.id));
      // Use functional update so we persist the correct (new) widgets array
      setWidgets((prev) => {
        const next = [...prev, widget];
        persistDashboardWidgets(next.map(w => w.id));
        return next;
      });
      // Background: fetch server widget data and merge so the newly added widget shows its data (no persistence)
      (async () => {
        try {
          const res = await axios.get('/api/dashboard');
          const serverWidgets = (res?.data?.widgets) || [];
          setWidgets((current) => current.map(w => {
            const sw = serverWidgets.find(s => s.id === w.id);
            return sw ? { ...w, data: sw.data } : w;
          }));
        } catch (err) {
          console.error('Failed to refresh widget data after add:', err);
        }
      })();
      return;
    }

    // Reordering within dashboard
    if (active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const next = arrayMove(items, oldIndex, newIndex);
        // persist new order
        persistDashboardWidgets(next.map(w => w.id));
        return next;
      });
    }
  };

  // Persist dashboard widget ids to user profile
  const persistDashboardWidgets = async (widgetIds) => {
    try {
      // Use updateProfile with showToast=false to avoid duplicate success messages
      await updateProfile({ dashboardWidgets: widgetIds }, false);
    } catch (err) {
      console.error('Failed to persist dashboard widgets', err);
    }
  };

  // Load dashboard configuration / data from backend
  React.useEffect(() => {
    if (!user || lastFetchedUserId.current === user._id) return;
    lastFetchedUserId.current = user._id;

    let mounted = true;
    const fetchDashboard = async () => {
      try {
        const res = await axios.get('/api/dashboard');
        if (!mounted) return;

        if (res?.data) {
          // server provides widgets array with id and data
          const serverWidgets = res.data.widgets || [];

          // map serverWidgets into our ALL_WIDGETS shape
          const mapped = serverWidgets.map(sw => {
            const template = ALL_WIDGETS.find(w => w.id === sw.id) || { id: sw.id, title: sw.title || sw.id, content: '' };
            return { ...template, data: sw.data };
          });

          // Use user's saved dashboard widgets if available
          let finalWidgets = [];
          if (user?.dashboardWidgets !== undefined) {
            // User has configured their dashboard (could be empty array or have widgets)
            finalWidgets = user.dashboardWidgets.map(id => {
              const found = mapped.find(m => m.id === id);
              return found || { id, title: id, data: null };
            });
          } else {
            // New user who has never configured dashboard - show default widget
            const defaultWidget = mapped.find(m => m.id === 'pending-requests');
            finalWidgets = defaultWidget ? [defaultWidget] : [];
          }

          // Ensure we merge server-provided data into finalWidgets (in case placeholders were used)
          const serverById = (serverWidgets || []).reduce((acc, sw) => {
            acc[sw.id] = sw;
            return acc;
          }, {});

          finalWidgets = finalWidgets.map(w => ({ ...w, data: (serverById[w.id] && serverById[w.id].data) || w.data || null }));

          setWidgets(finalWidgets);
          setAvailableWidgets(ALL_WIDGETS.filter(w => !finalWidgets.find(f => f.id === w.id)));
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
    };

    fetchDashboard();
    return () => { mounted = false; };
  }, [user]); const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getQuickActions = () => {
    // Base actions for all users
    const actions = [
      { title: 'View Profile', path: '/profile', icon: '👤' },
    ];

    if (canUploadFiles()) {
      actions.push(
        { title: 'Upload File', path: '/upload', icon: '📤' });
    }

    if (canDownloadFiles()) {
      actions.push({ title: 'Download Files', path: '/download', icon: '📥' });
    }

    if (canManageUsers()) {
      actions.push(
        { title: 'Manage Users', path: '/manage/users', icon: '👥' });
    }

    return actions;
  };

  // Icon mapping for widgets
  const WIDGET_ICONS = {
    'pending-requests': <FaClipboardList className="w-5 h-5" />,
    'file-stats': <FaThLarge className="w-5 h-5" />,
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-7xl mx-auto p-6 flex gap-6" data-testid="dashboard">
        {/* Main dashboard area */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
          {/* Welcome Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-floating dark:shadow-glass backdrop-blur-sm p-6 mb-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 pointer-events-none"></div>
            <div className="relative z-10">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 drop-shadow-sm" data-testid="welcome-message">
                {getGreeting()}, {user?.name || 'User'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Welcome to your dashboard. You have{' '}
                <span className="font-semibold">
                  {canManageUsers() ? 'Administrative' : canUploadFiles() ? 'Contributor' : 'Viewer'}
                </span>{' '}
                access.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-multi-layer dark:shadow-neumorphic-dark p-6 mb-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-blue-50/30 dark:from-gray-700/20 dark:to-blue-900/10 pointer-events-none"></div>
            <div className="relative z-10">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 drop-shadow-sm">Quick Actions</h2>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                {getQuickActions().map((action, index) => (
                  <a
                    key={index}
                    href={action.path}
                    {...(action.external ? { target: '_blank', rel: 'noopener noreferrer', title: action.title } : {})}
                    className="flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300 shadow-depth hover:shadow-glow hover:scale-105 min-w-[140px] border border-blue-100/50 dark:border-blue-800/50"
                    data-testid={`quick-action-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span className="text-2xl drop-shadow-sm group-hover:scale-110 transition-transform duration-200">{action.icon}</span>
                    <span className="text-blue-700 dark:text-blue-300 font-medium">{action.label || action.title}</span>
                  </a>
                ))}
                {/* Extra helpful links */}
                <div className="w-full mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Helpful: <a href="/profile" className="underline mr-2">Profile</a>
                  <a href={`${window.location.origin}/broken/dashboard-help`} className="underline mr-2">Broken Help</a>
                  <a href={`${window.location.origin}/docs/getting-started`} className="underline">Getting Started</a>
                </div>
              </div>
            </div>
          </div>

          {/* Draggable Widgets */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Dashboard Widgets <span className="text-sm text-gray-500">(Drag to reorder or add from right pane)</span>
            </h2>

            <SortableContext items={widgets.map(w => w.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4 min-h-[200px]" data-testid="draggable-widgets">
                {widgets.length === 0 && (
                  <div className="text-gray-500 dark:text-gray-400 text-center py-8">Drag widgets here from the right pane</div>
                )}
                {widgets.map((widget) => (
                  <div className="relative" key={widget.id}>
                    <button
                      type="button"
                      className="absolute top-2 right-2 text-sm text-red-600 hover:text-red-800 z-30 bg-white dark:bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center"
                      style={{ pointerEvents: 'auto' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        window.dispatchEvent(new CustomEvent('widget-remove-click', { detail: widget.id }));
                        // remove from widgets, add back to available
                        const found = ALL_WIDGETS.find(w => w.id === widget.id);
                        if (found) {
                          setAvailableWidgets((prev) => {
                            if (prev.find(w => w.id === widget.id)) {
                              return prev;
                            }
                            return [found, ...prev];
                          });
                        }
                        setWidgets((prev) => {
                          const next = prev.filter(w => w.id !== widget.id);
                          persistDashboardWidgets(next.map(w => w.id));
                          return next;
                        });
                      }}
                      title="Remove widget"
                    >
                      ✖
                    </button>
                    <SortableWidget id={widget.id}>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-move border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">{widget.title}</h3>

                        {/* Custom rendering for pending requests */}
                        {widget.id === 'pending-requests' && widget.data && (
                          <div className="mt-3">
                            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                              {widget.data.count || 0} pending request(s)
                            </div>
                            {widget.data.requests && widget.data.requests.length > 0 && (
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {widget.data.requests.slice(0, 5).map((request) => (
                                  <div key={request._id} className="text-sm bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                                    <div className="font-medium">{request.title}</div>
                                    <div className="text-gray-600 dark:text-gray-400 text-xs">
                                      {request.type} • {request.priority}
                                      {canViewAllRequests() && request.requestedBy ? ` • ${request.requestedBy.name}` : ''}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Custom rendering for file statistics */}
                        {widget.id === 'file-stats' && widget.data && (
                          <div className="mt-3">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                                <div className="font-semibold text-blue-600 dark:text-blue-400">
                                  {widget.data.totalFiles || 0}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Files</div>
                              </div>
                              <div className="text-center bg-green-50 dark:bg-green-900/20 rounded p-2">
                                <div className="font-semibold text-green-600 dark:text-green-400">
                                  {((widget.data.totalSize || 0) / 1024 / 1024).toFixed(1)}MB
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Size</div>
                              </div>
                              <div className="text-center bg-purple-50 dark:bg-purple-900/20 rounded p-2">
                                <div className="font-semibold text-purple-600 dark:text-purple-400">
                                  {widget.data.totalDownloads || 0}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Downloads</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Simple display for other widgets */}
                        {widget.id !== 'pending-requests' && widget.id !== 'file-stats' && widget.data && (
                          <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                            {widget.data.count !== undefined ? (
                              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                {widget.data.count}
                              </div>
                            ) : (
                              <div className="text-xs bg-gray-100 dark:bg-gray-800 rounded p-2 overflow-auto max-h-20">
                                {JSON.stringify(widget.data, null, 2)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </SortableWidget>
                  </div>
                ))}
              </div>
            </SortableContext>
          </div>

          {/* Permission-specific content */}
          {canManageUsers() && (
            <div className="mt-6 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-4">Admin Panel</h2>
              <p className="text-red-700 dark:text-red-400">
                You have administrative privileges. Access user management, system settings, and analytics.
              </p>
            </div>
          )}

          {canUploadFiles() && !canManageUsers() && (
            <div className="mt-6 bg-green-50 dark:bg-green-900/20 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">Contributor Tools</h2>
              <p className="text-green-700 dark:text-green-400">
                You can submit requests, upload files, and collaborate on projects.
              </p>
            </div>
          )}

          {!canUploadFiles() && !canManageUsers() && (
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">Viewer Access</h2>
              <p className="text-blue-700 dark:text-blue-400">
                You have read-only access to view content and download approved files.
              </p>
            </div>
          )}
        </div>


        {/* Floating right-side expandable pane for available widgets (fixed center-right) */}
        <div aria-hidden="false">
          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
            {/* Collapsed icon bar */}
            {!expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Open widgets"
                aria-label="Open widgets pane"
                data-testid="open-widgets-btn"
              >
                <FaThLarge className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              </button>
            )}

            {/* Expanded panel */}
            {expanded && (
              <div className="w-72 bg-white dark:bg-gray-800 rounded-l-lg shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Available Widgets</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpanded(false)}
                      className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Close"
                      aria-label="Close widgets pane"
                      data-testid="close-widgets-btn"
                    >
                      <FaTimes className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                </div>
                <div className="p-3 max-h-[60vh] overflow-y-auto">
                  <SortableContext items={availableWidgets.map(w => w.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3" data-testid="available-widgets">
                      {availableWidgets.length === 0 && (
                        <div className="text-gray-500 dark:text-gray-400 text-center py-6">All widgets added to dashboard</div>
                      )}
                      {availableWidgets.map((widget) => (
                        <SortableWidget key={widget.id} id={widget.id}>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-move">
                            <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border rounded text-gray-700 dark:text-gray-200">{WIDGET_ICONS[widget.id]}</div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">{widget.title}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-300">{widget.content}</p>
                            </div>
                          </div>
                        </SortableWidget>
                      ))}
                    </div>
                  </SortableContext>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default Dashboard;
