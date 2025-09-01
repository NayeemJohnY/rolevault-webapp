import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, copyToClipboard } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';

const ApiKeyManagement = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState(new Set());

  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await axios.get('/api/apikeys');
      setApiKeys(response.data.apiKeys || response.data);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const toggleKeyVisibility = (keyId) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId);
    } else {
      newVisibleKeys.add(keyId);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const copyKey = (key) => {
    copyToClipboard(key);
    toast.success('API key copied to clipboard!');
  };

  const deleteApiKey = async (keyId, keyName) => {
    if (!window.confirm(`Are you sure you want to delete the API key "${keyName}"?`)) {
      return;
    }

    try {
      await axios.delete(`/api/apikeys/${keyId}`);
      setApiKeys(apiKeys.filter(key => key._id !== keyId));
      toast.success('API key deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete API key');
    }
  };

  const regenerateKey = async (keyId, keyName) => {
    if (!window.confirm(`Are you sure you want to regenerate the API key "${keyName}"? This will invalidate the current key.`)) {
      return;
    }

    try {
      const response = await axios.post(`/api/apikeys/${keyId}/regenerate`);
      setApiKeys(apiKeys.map(key =>
        key._id === keyId ? response.data.apiKey : key
      ));
      toast.success('API key regenerated successfully');
    } catch (error) {
      console.error('Regenerate error:', error);
      toast.error('Failed to regenerate API key');
    }
  };

  const maskKey = (key) => {
    if (!key) return '';
    return key.substring(0, 8) + '••••••••••••••••••••••••••••••••••••••••••••••••••••••••';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            API Key Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isAdmin() ? 'Manage all API keys' : 'Manage your API keys'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
          data-testid="create-api-key-btn"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create API Key</span>
        </button>
      </div>

      {/* API Keys table */}
      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">API Key</th>
                <th className="table-header">Permissions</th>
                <th className="table-header">Status</th>
                <th className="table-header">Usage</th>
                <th className="table-header">Created</th>
                {isAdmin() && <th className="table-header">Owner</th>}
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {apiKeys.length > 0 ? (
                apiKeys.map((apiKey) => (
                  <tr key={apiKey._id} data-testid={`api-key-row-${apiKey._id}`}>
                    <td className="table-cell">
                      <div className="flex items-center space-x-3">
                        <KeyIcon className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {apiKey.name}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                          {visibleKeys.has(apiKey._id) ? apiKey.key : maskKey(apiKey.key)}
                        </code>
                        <button
                          onClick={() => toggleKeyVisibility(apiKey._id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          data-testid={`toggle-key-visibility-${apiKey._id}`}
                        >
                          {visibleKeys.has(apiKey._id) ? (
                            <EyeSlashIcon className="w-4 h-4" />
                          ) : (
                            <EyeIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyKey(apiKey.key)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy to clipboard"
                          data-testid={`copy-key-${apiKey._id}`}
                        >
                          <DocumentDuplicateIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1">
                        {apiKey.permissions.map(permission => (
                          <span
                            key={permission}
                            className="badge badge-info"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${apiKey.isActive ? 'badge-success' : 'badge-danger'
                        }`}>
                        {apiKey.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {apiKey.usage?.totalRequests || 0} requests
                        </p>
                        {apiKey.usage?.lastRequest && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Last used: {formatDate(apiKey.usage.lastRequest)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      {formatDate(apiKey.createdAt)}
                    </td>
                    {isAdmin() && (
                      <td className="table-cell">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {apiKey.userId?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {apiKey.userId?.role || 'unknown'}
                          </p>
                        </div>
                      </td>
                    )}
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => regenerateKey(apiKey._id, apiKey.name)}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                          title="Regenerate key"
                          data-testid={`regenerate-key-${apiKey._id}`}
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteApiKey(apiKey._id, apiKey.name)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete key"
                          data-testid={`delete-key-${apiKey._id}`}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin() ? "8" : "7"} className="table-cell text-center text-gray-500 dark:text-gray-400">
                    No API keys found. Create your first API key to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <CreateApiKeyModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newApiKey) => {
            setApiKeys([newApiKey, ...apiKeys]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

// Create API Key Modal Component
const CreateApiKeyModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    permissions: ['read'],
    expiresAt: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = { ...formData };
      if (!submitData.expiresAt) {
        delete submitData.expiresAt;
      }

      const response = await axios.post('/api/apikeys', submitData);
      onSuccess(response.data.apiKey);
      toast.success('API key created successfully!');
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission, checked) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, permission]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== permission)
      }));
    }
  };

  const availablePermissions = [
    { value: 'read', label: 'Read', description: 'View data' },
    { value: 'write', label: 'Write', description: 'Create and update data' },
    { value: 'delete', label: 'Delete', description: 'Remove data' },
    { value: 'admin', label: 'Admin', description: 'Full administrative access' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Create New API Key
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              data-testid="close-modal-btn"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">
                API Key Name *
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g., Production API Key"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                data-testid="api-key-name-input"
              />
            </div>

            <div>
              <label className="form-label">
                Permissions
              </label>
              <div className="space-y-2">
                {availablePermissions.map(permission => (
                  <label key={permission.value} className="flex items-start">
                    <input
                      type="checkbox"
                      className="w-4 h-4 mt-1 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      checked={formData.permissions.includes(permission.value)}
                      onChange={(e) => handlePermissionChange(permission.value, e.target.checked)}
                      data-testid={`permission-${permission.value}`}
                    />
                    <div className="ml-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {permission.label}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {permission.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">
                Expiration Date (Optional)
              </label>
              <input
                type="datetime-local"
                className="form-input"
                value={formData.expiresAt}
                onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                data-testid="expires-at-input"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                data-testid="cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                data-testid="create-btn"
              >
                {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                Create API Key
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManagement;
