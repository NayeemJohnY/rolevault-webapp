import React, { useEffect, useRef, useCallback, useState, useImperativeHandle, forwardRef } from 'react';

/**
 * Notification Widget using Shadow DOM
 * Provides isolated notification system with animations
 */
const ShadowDOMNotificationWidget = forwardRef((props, ref) => {
    const shadowHostRef = useRef(null);
    const [notifications, setNotifications] = useState([]);

    // Expose methods to parent components
    useImperativeHandle(ref, () => ({
        addNotification: (notification) => {
            const id = Date.now() + Math.random();
            const newNotification = {
                id,
                type: 'info',
                title: 'Notification',
                message: '',
                duration: 5000,
                ...notification
            };

            setNotifications(prev => [...prev, newNotification]);

            // Auto remove after duration
            setTimeout(() => {
                removeNotification(id);
            }, newNotification.duration);
        },
        removeNotification: (id) => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        },
        clearAll: () => {
            setNotifications([]);
        }
    }));

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    useEffect(() => {
        if (!shadowHostRef.current) return;

        // Create Shadow DOM
        const shadowRoot = shadowHostRef.current.attachShadow({ mode: 'open' });

        // Shadow DOM styles (completely isolated)
        const styles = `
      <style>
        :host {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          pointer-events: none;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .notification-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 400px;
          min-width: 300px;
        }
        
        .notification {
          background: linear-gradient(145deg, #ffffff, #f8fafc);
          border-radius: 12px;
          padding: 16px 20px;
          box-shadow: 
            0 10px 25px rgba(0, 0, 0, 0.1),
            0 4px 6px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          pointer-events: auto;
          position: relative;
          overflow: hidden;
          transform: translateX(400px);
          opacity: 0;
          animation: slideIn 0.4s ease-out forwards;
        }
        
        .notification::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--accent-color);
        }
        
        .notification.removing {
          animation: slideOut 0.3s ease-in forwards;
        }
        
        @keyframes slideIn {
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOut {
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
        
        .notification.success {
          --accent-color: #10b981;
          border-left: 4px solid #10b981;
        }
        
        .notification.error {
          --accent-color: #ef4444;
          border-left: 4px solid #ef4444;
        }
        
        .notification.warning {
          --accent-color: #f59e0b;
          border-left: 4px solid #f59e0b;
        }
        
        .notification.info {
          --accent-color: #3b82f6;
          border-left: 4px solid #3b82f6;
        }
        
        .notification-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .notification-icon {
          width: 24px;
          height: 24px;
          margin-right: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          color: white;
          background: var(--accent-color);
        }
        
        .notification-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
          flex: 1;
        }
        
        .notification-close {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .notification-close:hover {
          background: rgba(0, 0, 0, 0.1);
          color: #1e293b;
        }
        
        .notification-message {
          color: #475569;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
          padding-left: 36px;
        }
        
        .notification-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          background: var(--accent-color);
          opacity: 0.7;
          animation: progress var(--duration) linear;
        }
        
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        .notification-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          padding-left: 36px;
        }
        
        .notification-action {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .notification-action:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .notification-action.secondary {
          background: transparent;
          color: var(--accent-color);
          border: 1px solid var(--accent-color);
        }
        
        .clear-all-btn {
          background: linear-gradient(145deg, #f1f5f9, #e2e8f0);
          border: 1px solid #cbd5e1;
          color: #64748b;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 12px;
          pointer-events: auto;
        }
        
        .clear-all-btn:hover {
          background: linear-gradient(145deg, #e2e8f0, #cbd5e1);
          transform: translateY(-1px);
        }
      </style>
    `;

        // Update Shadow DOM content
        const updateNotifications = () => {
            const template = `
        ${styles}
        <div class="notification-container">
          ${notifications.length > 0 ? '<button class="clear-all-btn" id="clear-all">Clear All</button>' : ''}
          ${notifications.map(notification => `
            <div class="notification ${notification.type}" data-id="${notification.id}">
              <div class="notification-header">
                <div class="notification-icon">
                  ${getIconForType(notification.type)}
                </div>
                <h4 class="notification-title">${notification.title}</h4>
                <button class="notification-close" data-id="${notification.id}">×</button>
              </div>
              ${notification.message ? `<p class="notification-message">${notification.message}</p>` : ''}
              ${notification.actions ? `
                <div class="notification-actions">
                  ${notification.actions.map(action => `
                    <button class="notification-action ${action.type || ''}" data-action="${action.id}" data-notification="${notification.id}">
                      ${action.label}
                    </button>
                  `).join('')}
                </div>
              ` : ''}
              <div class="notification-progress" style="--duration: ${notification.duration}ms;"></div>
            </div>
          `).join('')}
        </div>
      `;

            shadowRoot.innerHTML = template;

            // Add event listeners
            const closeButtons = shadowRoot.querySelectorAll('.notification-close');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.dataset.id);
                    removeNotification(id);
                });
            });

            const clearAllBtn = shadowRoot.getElementById('clear-all');
            if (clearAllBtn) {
                clearAllBtn.addEventListener('click', () => {
                    setNotifications([]);
                });
            }

            // Action buttons
            const actionButtons = shadowRoot.querySelectorAll('.notification-action');
            actionButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const actionId = e.target.dataset.action;
                    const notificationId = parseInt(e.target.dataset.notification);
                    const notification = notifications.find(n => n.id === notificationId);
                    const action = notification?.actions?.find(a => a.id === actionId);

                    if (action?.onClick) {
                        action.onClick();
                    }

                    // Remove notification after action
                    removeNotification(notificationId);
                });
            });
        };

        const getIconForType = (type) => {
            const icons = {
                success: '✓',
                error: '✕',
                warning: '⚠',
                info: 'ℹ'
            };
            return icons[type] || icons.info;
        };

        updateNotifications();

        // Cleanup function
        return () => {
            if (shadowRoot) {
                shadowRoot.innerHTML = '';
            }
        };
    }, [notifications, removeNotification]);

    return (
        <div
            ref={shadowHostRef}
            style={{
                position: 'fixed',
                top: 0,
                right: 0,
                zIndex: 10000,
                pointerEvents: 'none'
            }}
        />
    );
});

ShadowDOMNotificationWidget.displayName = 'ShadowDOMNotificationWidget';

export default ShadowDOMNotificationWidget;