import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatFileSize } from '../../utils/helpers';

const UploadFile = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      tags: '',
      isPublic: false,
      status: 'pending'
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const updateFileData = (fileId, field, value) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, [field]: value } : f))
    );
  };

  const uploadFile = async (fileData) => {
    const formData = new FormData();
    formData.append('file', fileData.file);
    formData.append('description', fileData.description);
    formData.append('tags', fileData.tags);
    formData.append('isPublic', fileData.isPublic);

    try {
      const response = await axios.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress((prev) => ({
            ...prev,
            [fileData.id]: progress
          }));
        }
      });

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id
            ? { ...f, status: 'completed', uploadedFile: response.data.file }
            : f
        )
      );

      toast.success(`${fileData.file.name} uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id ? { ...f, status: 'error' } : f
        )
      );
      toast.error(`Failed to upload ${fileData.file.name}`);
    }
  };

  const uploadAllFiles = async () => {
    setUploading(true);
    const pendingFiles = files.filter((f) => f.status === 'pending');

    for (const fileData of pendingFiles) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id ? { ...f, status: 'uploading' } : f
        )
      );
      await uploadFile(fileData);
    }

    setUploading(false);
  };

  const clearCompleted = () => {
    setFiles((prev) => prev.filter((f) => f.status !== 'completed'));
    setUploadProgress({});
  };


  return (
    <div className="page-upload-file max-w-3xl mx-auto p-6">
      <h1 className="page-upload-file__title text-2xl font-bold text-gray-900 dark:text-white mb-6">Upload File</h1>
      <div className="space-y-6">
        {/* Drag and drop area */}
        <div
          {...getRootProps()}
          className={`page-upload-file__dropzone border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
            }`}
          data-testid="file-upload-zone"
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-primary-600 dark:text-primary-400">
              Drop the files here...
            </p>
          ) : (
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop files here, or click to select files
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Maximum file size: 10MB
              </p>
            </div>
          )}
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="page-upload-file__list space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Files to Upload ({files.length})
              </h3>
              <div className="space-x-2">
                <button
                  onClick={clearCompleted}
                  className="page-upload-file__clear-btn btn-secondary"
                  disabled={!files.some((f) => f.status === 'completed')}
                  data-testid="clear-completed-btn"
                >
                  Clear Completed
                </button>
                <button
                  onClick={uploadAllFiles}
                  disabled={uploading || !files.some((f) => f.status === 'pending')}
                  className="page-upload-file__upload-all-btn btn-primary"
                  data-testid="upload-all-btn"
                >
                  {uploading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  Upload All
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {files.map((fileData) => (
                <div
                  key={fileData.id}
                  className="page-upload-file__item card"
                  data-testid={`file-item-${fileData.id}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {fileData.file.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={fileData.status} className="page-upload-file__status-badge" />
                          {fileData.status === 'pending' && (
                            <button
                              onClick={() => removeFile(fileData.id)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              data-testid={`remove-file-${fileData.id}`}
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {formatFileSize(fileData.file.size)} • {fileData.file.type}
                      </p>

                      {/* Progress bar */}
                      {fileData.status === 'uploading' && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">
                              Uploading...
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {uploadProgress[fileData.id] || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress[fileData.id] || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* File metadata form */}
                      {fileData.status === 'pending' && (
                        <div className="page-upload-file__meta space-y-3">
                          <div>
                            <label className="form-label">Description</label>
                            <input
                              type="text"
                              className="page-upload-file__input form-input"
                              placeholder="Optional description"
                              value={fileData.description}
                              onChange={(e) =>
                                updateFileData(fileData.id, 'description', e.target.value)
                              }
                              data-testid={`file-description-${fileData.id}`}
                            />
                          </div>
                          <div>
                            <label className="form-label">Tags</label>
                            <input
                              type="text"
                              className="page-upload-file__input form-input"
                              placeholder="Comma-separated tags"
                              value={fileData.tags}
                              onChange={(e) =>
                                updateFileData(fileData.id, 'tags', e.target.value)
                              }
                              data-testid={`file-tags-${fileData.id}`}
                            />
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`public-${fileData.id}`}
                              className="page-upload-file__public-checkbox w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                              checked={fileData.isPublic}
                              onChange={(e) =>
                                updateFileData(fileData.id, 'isPublic', e.target.checked)
                              }
                              data-testid={`file-public-${fileData.id}`}
                            />
                            <label
                              htmlFor={`public-${fileData.id}`}
                              className="page-upload-file__public-label ml-2 text-sm text-gray-700 dark:text-gray-300"
                            >
                              Make this file public
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'badge-warning', text: 'Pending' },
    uploading: { color: 'badge-info', text: 'Uploading' },
    completed: { color: 'badge-success', text: 'Completed' },
    error: { color: 'badge-danger', text: 'Error' }
  };
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`badge ${config.color}`} data-testid={`status-${status}`}>
      {config.text}
    </span>
  );
};

export default UploadFile;
