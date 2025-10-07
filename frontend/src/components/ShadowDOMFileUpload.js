import React, { useEffect, useRef, useCallback } from 'react';

/**
 * File Upload Widget using Shadow DOM
 * Provides isolated drag-and-drop file upload functionality
 */
const ShadowDOMFileUpload = ({ onFileSelect, maxFiles = 3, acceptedTypes = '*' }) => {
    const shadowHostRef = useRef(null);

    const handleFileSelect = useCallback((files) => {
        if (onFileSelect) {
            onFileSelect(Array.from(files));
        }
    }, [onFileSelect]);

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
        
        .upload-widget {
          background: linear-gradient(145deg, #f8fafc, #e2e8f0);
          border: 2px dashed #cbd5e1;
          border-radius: 16px;
          padding: 30px;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        
        .upload-widget::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
          transition: left 0.5s ease;
        }
        
        .upload-widget:hover::before {
          left: 100%;
        }
        
        .upload-widget:hover {
          border-color: #3b82f6;
          background: linear-gradient(145deg, #eff6ff, #dbeafe);
          transform: scale(1.02);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15);
        }
        
        .upload-widget.drag-over {
          border-color: #10b981;
          background: linear-gradient(145deg, #ecfdf5, #d1fae5);
          transform: scale(1.05);
        }
        
        .upload-icon {
          font-size: 48px;
          color: #64748b;
          margin-bottom: 15px;
          transition: all 0.3s ease;
        }
        
        .upload-widget:hover .upload-icon {
          color: #3b82f6;
          transform: scale(1.1) rotate(5deg);
        }
        
        .upload-title {
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 10px 0;
        }
        
        .upload-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 20px 0;
        }
        
        .upload-stats {
          display: flex;
          justify-content: space-around;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }
        
        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #3b82f6;
          margin: 0;
        }
        
        .stat-label {
          font-size: 12px;
          color: #64748b;
          margin: 5px 0 0 0;
        }
        
        .file-input {
          display: none;
        }
        
        .progress-bar {
          width: 100%;
          height: 4px;
          background: #e2e8f0;
          border-radius: 2px;
          overflow: hidden;
          margin-top: 15px;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #10b981);
          border-radius: 2px;
          transition: width 0.3s ease;
          width: 0%;
        }
        
        .selected-files {
          margin-top: 15px;
          text-align: left;
        }
        
        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 8px;
          margin: 5px 0;
          font-size: 14px;
        }
        
        .file-name {
          color: #1e293b;
          font-weight: 500;
        }
        
        .file-size {
          color: #64748b;
          font-size: 12px;
        }
        
        .remove-file {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .remove-file:hover {
          background: #dc2626;
          transform: scale(1.05);
        }
      </style>
    `;

        // Shadow DOM HTML structure
        const template = `
      ${styles}
      <div class="upload-widget" id="upload-widget">
        <div class="upload-icon">📁</div>
        <h3 class="upload-title">Drop files here</h3>
        <p class="upload-subtitle">or click to browse (max ${maxFiles} files)</p>
        
        <input 
          type="file" 
          class="file-input" 
          id="file-input" 
          multiple 
          accept="${acceptedTypes}"
        />
        
        <div class="upload-stats">
          <div class="stat">
            <p class="stat-value" id="file-count">0</p>
            <p class="stat-label">Files Selected</p>
          </div>
          <div class="stat">
            <p class="stat-value" id="total-size">0KB</p>
            <p class="stat-label">Total Size</p>
          </div>
        </div>
        
        <div class="progress-bar" id="progress-bar" style="display: none;">
          <div class="progress-fill" id="progress-fill"></div>
        </div>
        
        <div class="selected-files" id="selected-files"></div>
      </div>
    `;

        shadowRoot.innerHTML = template;

        // Get Shadow DOM elements
        const widget = shadowRoot.getElementById('upload-widget');
        const fileInput = shadowRoot.getElementById('file-input');
        const fileCountEl = shadowRoot.getElementById('file-count');
        const totalSizeEl = shadowRoot.getElementById('total-size');
        const selectedFilesEl = shadowRoot.getElementById('selected-files');

        let selectedFiles = [];

        // Event handlers
        const updateDisplay = () => {
            fileCountEl.textContent = selectedFiles.length;
            const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
            totalSizeEl.textContent = formatFileSize(totalSize);

            // Display selected files
            selectedFilesEl.innerHTML = selectedFiles.map((file, index) => `
        <div class="file-item">
          <div>
            <div class="file-name">${file.name}</div>
            <div class="file-size">${formatFileSize(file.size)}</div>
          </div>
          <button class="remove-file" data-index="${index}">Remove</button>
        </div>
      `).join('');

            // Add remove file event listeners
            selectedFilesEl.querySelectorAll('.remove-file').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    selectedFiles.splice(index, 1);
                    updateDisplay();
                    handleFileSelect(selectedFiles);
                });
            });
        };

        const formatFileSize = (bytes) => {
            if (bytes === 0) return '0KB';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
        };

        // File selection handler
        const handleFiles = (files) => {
            const newFiles = Array.from(files).slice(0, maxFiles - selectedFiles.length);
            selectedFiles = [...selectedFiles, ...newFiles];
            updateDisplay();
            handleFileSelect(selectedFiles);
        };

        // Event listeners
        widget.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

        // Drag and drop
        widget.addEventListener('dragover', (e) => {
            e.preventDefault();
            widget.classList.add('drag-over');
        });

        widget.addEventListener('dragleave', () => {
            widget.classList.remove('drag-over');
        });

        widget.addEventListener('drop', (e) => {
            e.preventDefault();
            widget.classList.remove('drag-over');
            handleFiles(e.dataTransfer.files);
        });

        // Initial display
        updateDisplay();

        // Cleanup function
        return () => {
            if (shadowRoot) {
                shadowRoot.innerHTML = '';
            }
        };
    }, [handleFileSelect, maxFiles, acceptedTypes]);

    return (
        <div
            ref={shadowHostRef}
            style={{
                width: '400px',
                margin: '10px'
            }}
        />
    );
};

export default ShadowDOMFileUpload;