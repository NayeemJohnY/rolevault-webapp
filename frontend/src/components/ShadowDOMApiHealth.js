import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * API Health Status Widget using Shadow DOM
 * This component demonstrates Shadow DOM implementation in React
 * Provides complete style and DOM isolation
 */
const ShadowDOMApiHealth = ({ apiEndpoint = '/api/health' }) => {
    const shadowHostRef = useRef(null);
    const [healthData, setHealthData] = useState({
        status: 'checking',
        uptime: 0,
        timestamp: Date.now()
    });

    const checkHealth = useCallback(async () => {
        setHealthData(prev => ({ ...prev, status: 'checking' }));

        try {
            const response = await fetch(apiEndpoint);
            const data = await response.json();

            setHealthData({
                status: response.ok ? 'healthy' : 'error',
                uptime: data.uptime || Date.now() - performance.now(),
                timestamp: Date.now()
            });
        } catch (error) {
            setHealthData({
                status: 'error',
                uptime: 0,
                timestamp: Date.now()
            });
        }
    }, [apiEndpoint]);

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
        
        .health-widget {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 20px;
          color: white;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .health-widget::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .health-widget:hover::before {
          opacity: 1;
        }
        
        .health-widget:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }
        
        .status-indicator {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
          animation: pulse 2s infinite;
        }
        
        .status-healthy { background: #10b981; }
        .status-warning { background: #f59e0b; }
        .status-error { background: #ef4444; }
        .status-checking { background: #6b7280; }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .health-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        
        .health-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }
        
        .health-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 15px;
        }
        
        .metric {
          text-align: center;
        }
        
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }
        
        .metric-label {
          font-size: 12px;
          opacity: 0.8;
          margin: 0;
        }
        
        .refresh-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          color: white;
          padding: 6px 12px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .refresh-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }
        
        .last-updated {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 10px;
          text-align: center;
        }
      </style>
    `;

        // Shadow DOM HTML structure
        const template = `
      ${styles}
      <div class="health-widget">
        <div class="health-header">
          <h3 class="health-title">
            <span class="status-indicator status-${healthData.status}"></span>
            API Health
          </h3>
          <button class="refresh-btn" id="refresh-btn">Refresh</button>
        </div>
        
        <div class="health-metrics">
          <div class="metric">
            <p class="metric-value">${healthData.status === 'healthy' ? '✓' : healthData.status === 'error' ? '✗' : '?'}</p>
            <p class="metric-label">Status</p>
          </div>
          <div class="metric">
            <p class="metric-value">${Math.floor(healthData.uptime / 1000)}s</p>
            <p class="metric-label">Uptime</p>
          </div>
        </div>
        
        <div class="last-updated">
          Last updated: ${new Date(healthData.timestamp).toLocaleTimeString()}
        </div>
      </div>
    `;

        shadowRoot.innerHTML = template;

        // Add event listeners within Shadow DOM
        const refreshBtn = shadowRoot.getElementById('refresh-btn');
        refreshBtn.addEventListener('click', checkHealth);

        // Initial health check
        checkHealth();

        // Cleanup function
        return () => {
            if (shadowRoot) {
                shadowRoot.innerHTML = '';
            }
        };
    }, [healthData, checkHealth]);

    return (
        <div
            ref={shadowHostRef}
            style={{
                width: '300px',
                height: '200px',
                margin: '10px'
            }}
        />
    );
};

export default ShadowDOMApiHealth;