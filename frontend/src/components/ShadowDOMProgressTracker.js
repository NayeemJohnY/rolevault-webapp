import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';

/**
 * Progress Tracker using Shadow DOM
 * Provides isolated progress tracking for file operations
 */
const ShadowDOMProgressTracker = forwardRef((props, ref) => {
    const shadowHostRef = useRef(null);
    const [progressItems, setProgressItems] = useState([]);

    // Expose methods to parent components
    useImperativeHandle(ref, () => ({
        addProgress: (item) => {
            const id = Date.now() + Math.random();
            const newItem = {
                id,
                name: 'Operation',
                progress: 0,
                status: 'running', // running, completed, error, paused
                size: 0,
                speed: 0,
                ...item
            };

            setProgressItems(prev => [...prev, newItem]);
            return id;
        },
        updateProgress: (id, updates) => {
            setProgressItems(prev => prev.map(item =>
                item.id === id ? { ...item, ...updates } : item
            ));
        },
        removeProgress: (id) => {
            setProgressItems(prev => prev.filter(item => item.id !== id));
        },
        clearCompleted: () => {
            setProgressItems(prev => prev.filter(item => item.status !== 'completed'));
        },
        clearAll: () => {
            setProgressItems([]);
        }
    }));

    const formatFileSize = useCallback((bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }, []);

    const formatSpeed = useCallback((bytesPerSecond) => {
        return formatFileSize(bytesPerSecond) + '/s';
    }, [formatFileSize]);

    useEffect(() => {
        if (!shadowHostRef.current) return;

        // Create Shadow DOM
        const shadowRoot = shadowHostRef.current.attachShadow({ mode: 'open' });

        // Shadow DOM styles (completely isolated)
        const styles = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .progress-container {
          background: linear-gradient(145deg, #f8fafc, #e2e8f0);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 
            0 10px 25px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
          max-height: 400px;
          min-height: 150px;
        }
        
        .progress-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.05), transparent);
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        .progress-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .progress-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }
        
        .progress-summary {
          font-size: 14px;
          color: #64748b;
        }
        
        .progress-actions {
          display: flex;
          gap: 8px;
        }
        
        .action-btn {
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .action-btn.secondary {
          background: linear-gradient(145deg, #64748b, #475569);
        }
        
        .progress-list {
          max-height: 300px;
          overflow-y: auto;
          scroll-behavior: smooth;
        }
        
        .progress-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .progress-list::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        
        .progress-list::-webkit-scrollbar-thumb {
          background: linear-gradient(145deg, #cbd5e1, #94a3b8);
          border-radius: 3px;
        }
        
        .progress-item {
          background: white;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.5);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .progress-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }
        
        .progress-item.completed {
          background: linear-gradient(145deg, #ecfdf5, #d1fae5);
          border-color: #10b981;
        }
        
        .progress-item.error {
          background: linear-gradient(145deg, #fef2f2, #fecaca);
          border-color: #ef4444;
        }
        
        .progress-item.paused {
          background: linear-gradient(145deg, #fffbeb, #fef3c7);
          border-color: #f59e0b;
        }
        
        .progress-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        
        .progress-name {
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
          margin: 0;
          flex: 1;
        }
        
        .progress-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #64748b;
        }
        
        .status-icon {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          color: white;
        }
        
        .status-running { background: #3b82f6; animation: pulse 2s infinite; }
        .status-completed { background: #10b981; }
        .status-error { background: #ef4444; }
        .status-paused { background: #f59e0b; }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #10b981);
          border-radius: 4px;
          transition: width 0.3s ease;
          position: relative;
        }
        
        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: progressShine 2s infinite;
        }
        
        @keyframes progressShine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .progress-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          font-size: 12px;
          color: #64748b;
        }
        
        .progress-percentage {
          font-weight: 600;
          color: #3b82f6;
        }
        
        .progress-speed {
          font-weight: 500;
        }
        
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #64748b;
        }
        
        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        
        .empty-title {
          font-size: 16px;
          font-weight: 500;
          margin: 0 0 8px 0;
        }
        
        .empty-subtitle {
          font-size: 14px;
          margin: 0;
        }
      </style>
    `;

        // Update Shadow DOM content
        const updateProgress = () => {
            const completedCount = progressItems.filter(item => item.status === 'completed').length;
            const runningCount = progressItems.filter(item => item.status === 'running').length;

            const template = `
        ${styles}
        <div class="progress-container">
          <div class="progress-header">
            <div>
              <h3 class="progress-title">Progress Tracker</h3>
              <div class="progress-summary">
                ${progressItems.length} items • ${runningCount} running • ${completedCount} completed
              </div>
            </div>
            <div class="progress-actions">
              ${progressItems.some(item => item.status === 'completed') ?
                    '<button class="action-btn secondary" id="clear-completed">Clear Completed</button>' : ''
                }
              ${progressItems.length > 0 ?
                    '<button class="action-btn secondary" id="clear-all">Clear All</button>' : ''
                }
            </div>
          </div>
          
          <div class="progress-list">
            ${progressItems.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h4 class="empty-title">No operations in progress</h4>
                <p class="empty-subtitle">File operations will appear here</p>
              </div>
            ` : progressItems.map(item => `
              <div class="progress-item ${item.status}">
                <div class="progress-info">
                  <p class="progress-name">${item.name}</p>
                  <div class="progress-status">
                    <div class="status-icon status-${item.status}">
                      ${getStatusIcon(item.status)}
                    </div>
                    <span>${item.status}</span>
                  </div>
                </div>
                
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${Math.min(100, Math.max(0, item.progress))}%"></div>
                </div>
                
                <div class="progress-details">
                  <span class="progress-percentage">${Math.round(item.progress)}%</span>
                  <span class="progress-speed">
                    ${item.size > 0 ? formatFileSize(item.size) : ''}
                    ${item.speed > 0 ? ' • ' + formatSpeed(item.speed) : ''}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

            shadowRoot.innerHTML = template;

            // Add event listeners
            const clearCompletedBtn = shadowRoot.getElementById('clear-completed');
            if (clearCompletedBtn) {
                clearCompletedBtn.addEventListener('click', () => {
                    setProgressItems(prev => prev.filter(item => item.status !== 'completed'));
                });
            }

            const clearAllBtn = shadowRoot.getElementById('clear-all');
            if (clearAllBtn) {
                clearAllBtn.addEventListener('click', () => {
                    setProgressItems([]);
                });
            }
        };

        const getStatusIcon = (status) => {
            const icons = {
                running: '⟳',
                completed: '✓',
                error: '✕',
                paused: '⏸'
            };
            return icons[status] || '?';
        };

        updateProgress();

        // Cleanup function
        return () => {
            if (shadowRoot) {
                shadowRoot.innerHTML = '';
            }
        };
    }, [progressItems, formatFileSize, formatSpeed]);

    return (
        <div
            ref={shadowHostRef}
            style={{
                width: '450px',
                minHeight: '200px',
                margin: '10px'
            }}
        />
    );
});

ShadowDOMProgressTracker.displayName = 'ShadowDOMProgressTracker';

export default ShadowDOMProgressTracker;