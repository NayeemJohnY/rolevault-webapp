import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  DocumentIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatFileSize, formatDate } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';

const DownloadFile = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const { user } = useAuth();

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedType) params.append('type', selectedType);
      if (showPublicOnly) params.append('isPublic', 'true');

      const response = await axios.get(`/api/files?${params}`);
      setFiles(response.data.files);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedType, showPublicOnly]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const downloadFile = async (fileId, filename) => {
    try {
      const response = await axios.get(`/api/files/${fileId}/download`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${filename} downloaded successfully!`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const deleteFile = async (fileId, filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    try {
      await axios.delete(`/api/files/${fileId}`);
      setFiles(files.filter(f => f._id !== fileId));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  };

  const fileTypes = [
    { value: '', label: 'All Types' },
    { value: 'image', label: 'Images' },
    { value: 'document', label: 'Documents' },
    { value: 'pdf', label: 'PDF Files' },
    { value: 'text', label: 'Text Files' }
  ];

  if (loading && files.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Download Files</h1>
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="file-search-input"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            className="form-input"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            data-testid="file-type-filter"
          >
            {fileTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowPublicOnly(!showPublicOnly)}
            className={`btn-secondary flex items-center space-x-2 ${showPublicOnly ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : ''
              }`}
            data-testid="public-filter-btn"
          >
            <FunnelIcon className="w-4 h-4" />
            <span>Public Only</span>
          </button>
        </div>
      </div>

      {/* Files table */}
      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="table-header">File Name</th>
                <th className="table-header">Size</th>
                <th className="table-header">Type</th>
                <th className="table-header">Uploaded</th>
                <th className="table-header">Downloads</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {files.length > 0 ? (
                files.map((file) => (
                  <tr key={file._id} data-testid={`file-row-${file._id}`}>
                    <td className="table-cell">
                      <div className="flex items-center space-x-3">
                        <DocumentIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {file.originalName}
                          </p>
                          {file.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {file.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="table-cell">
                      <span className="badge badge-info">
                        {file.mimetype.split('/')[1].toUpperCase()}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDate(file.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          by {file.uploadedBy?.name || 'Unknown'}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell">
                      {file.downloadCount}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${file.isPublic ? 'badge-success' : 'badge-warning'}`}>
                        {file.isPublic ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => downloadFile(file._id, file.originalName)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          title="Download"
                          data-testid={`download-file-${file._id}`}
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>

                        {user?.role === 'admin' || file.uploadedBy?._id === user?._id ? (
                          <button
                            onClick={() => deleteFile(file._id, file.originalName)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete"
                            data-testid={`delete-file-${file._id}`}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="table-cell text-center text-gray-500 dark:text-gray-400">
                    {loading ? 'Loading files...' : 'No files found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing page {pagination.current} of {pagination.pages} ({pagination.total} files total)
          </p>

          <div className="flex space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="prev-page-btn"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.pages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="next-page-btn"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadFile;
