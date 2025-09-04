import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  KeyIcon,
  TrashIcon,
  ArrowPathIcon,
  EyeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import { DataTableSearchFilter, DataTablePagination, useTableData } from '../components/TableUtilities';
import { formatDate, copyToClipboard } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';

const ApiKeyManagement = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);

  const { isAdmin } = useAuth();

  // Use table data hook for pagination, search, and filtering
  const {
    paginatedData: paginatedApiKeys,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    pageInfo,
    setCurrentPage,
    updatePageSize
  } = useTableData(apiKeys, 10);

  // Filter options for API key filtering
  const filterOptions = [
    {
      key: 'isActive',
      label: 'All Status',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    }
  ];

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


  const openKeyModal = (apiKey) => {
    setSelectedKey(apiKey);
    setShowKeyModal(true);
  };

  const closeKeyModal = () => {
    setShowKeyModal(false);
    setSelectedKey(null);
  };
  const deactivateApiKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to deactivate this API key?')) return;
    try {
      await axios.put(`/api/apikeys/${keyId}`, { isActive: false });
      setApiKeys(apiKeys.map(key => key._id === keyId ? { ...key, isActive: false } : key));
      toast.success('API key deactivated');
    } catch (error) {
      toast.error('Failed to deactivate API key');
    }
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



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-apikey-management api-key-management-page space-y-6">
      {/* Page header */}
      <div className="page-apikey-management__header page-header flex justify-between items-center">
        <div>
          <h1 className="page-apikey-management__title page-title text-2xl font-bold text-gray-900 dark:text-white mb-6">
            API Key Management
          </h1>
          <p className="page-apikey-management__description page-description text-gray-600 dark:text-gray-400">
            {isAdmin() ? 'Manage all API keys' : 'Manage your API keys'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="page-apikey-management__create-btn create-key-button btn-primary flex items-center space-x-2"
          data-testid="create-api-key-btn"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create API Key</span>
        </button>
      </div>

      {/* Search and Filter Controls */}
      <DataTableSearchFilter
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filterOptions}
        selectedFilters={filters}
        onFilterChange={updateFilter}
        placeholder="Search API keys by name, permissions, or owner..."
      />

      {/* API Keys table */}
      <div className="page-apikey-management__table-container api-keys-table-container card p-0">
        <div className="page-apikey-management__table-wrapper table-wrapper overflow-x-auto">
          <table className="page-apikey-management__table api-keys-table min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="page-apikey-management__table-header table-header bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="page-apikey-management__th header-cell table-header">Name</th>
                <th className="page-apikey-management__th header-cell table-header">Permissions</th>
                <th className="page-apikey-management__th header-cell table-header">Status</th>
                <th className="page-apikey-management__th header-cell table-header">Expiry</th>
                <th className="page-apikey-management__th header-cell table-header">Usage</th>
                <th className="page-apikey-management__th header-cell table-header">Created</th>
                {isAdmin() && <th className="page-apikey-management__th header-cell table-header">Owner</th>}
                <th className="page-apikey-management__th header-cell table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="page-apikey-management__table-body table-body bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedApiKeys.length > 0 ? (
                paginatedApiKeys.map((apiKey) => (
                  <tr key={apiKey._id} className="page-apikey-management__row table-row" data-testid={`api-key-row-${apiKey._id}`}>
                    <td className="page-apikey-management__cell data-cell table-cell">
                      <div className="flex items-center space-x-3">
                        <KeyIcon className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {apiKey.name}
                        </span>
                      </div>
                    </td>
                    <td className="page-apikey-management__cell table-cell">
                      <div className="flex flex-wrap gap-1">
                        {apiKey.permissions.map(permission => (
                          <span
                            key={permission}
                            className="page-apikey-management__badge badge badge-info"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="page-apikey-management__cell table-cell">
                      <span className={`page-apikey-management__badge badge ${apiKey.isActive ? 'badge-success' : 'badge-danger'}`}>{apiKey.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="page-apikey-management__cell table-cell">
                      {apiKey.expiresAt ? formatDate(apiKey.expiresAt) : <span className="text-xs text-gray-400">Never</span>}
                    </td>
                    <td className="page-apikey-management__cell table-cell">
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
                    <td className="page-apikey-management__cell table-cell">
                      {formatDate(apiKey.createdAt)}
                    </td>
                    {isAdmin() && (
                      <td className="page-apikey-management__cell table-cell">
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
                    <td className="page-apikey-management__cell table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openKeyModal(apiKey)}
                          className="page-apikey-management__view-btn text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View API Key"
                          data-testid={`view-key-${apiKey._id}`}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deactivateApiKey(apiKey._id)}
                          className="page-apikey-management__deactivate-btn text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                          title="Deactivate key"
                          data-testid={`deactivate-key-${apiKey._id}`}
                          disabled={!apiKey.isActive}
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteApiKey(apiKey._id, apiKey.name)}
                          className="page-apikey-management__delete-btn text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete key"
                          data-testid={`delete-key-${apiKey._id}`}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    {/* View API Key Modal */}
                    <Modal
                      isOpen={showKeyModal}
                      onRequestClose={closeKeyModal}
                      contentLabel="View API Key"
                      ariaHideApp={false}
                      className="page-apikey-management__key-modal fixed inset-0 flex items-center justify-center z-50"
                      overlayClassName="page-apikey-management__key-modal-overlay fixed inset-0 bg-black bg-opacity-50 z-40"
                    >
                      <div className="page-apikey-management__key-modal-content bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">API Key</h2>
                        <div className="mb-4">
                          <div className="flex items-center gap-2">
                            <div className="overflow-x-auto max-w-xs border rounded bg-gray-100 dark:bg-gray-700 px-3 py-2 font-mono text-lg whitespace-nowrap">
                              {selectedKey?.key}
                            </div>
                            <span
                              onClick={() => {
                                copyToClipboard(selectedKey?.key);
                                toast.success('API key copied to clipboard!');
                              }}
                              className="page-apikey-management__copy-icon cursor-pointer text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Copy API key"
                              data-testid="copy-key-icon"
                              tabIndex={0}
                              role="button"
                              aria-label="Copy API key"
                            >
                              <DocumentDuplicateIcon className="w-5 h-5" />
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={closeKeyModal}
                          className="page-apikey-management__close-btn px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                          Close
                        </button>
                      </div>
                    </Modal>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin() ? "8" : "7"} className="page-apikey-management__empty-state empty-state-cell table-cell text-center text-gray-500 dark:text-gray-400">
                    No API keys found. Create your first API key to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <DataTablePagination
          pageInfo={pageInfo}
          onPageUpdate={setCurrentPage}
          onSizeUpdate={updatePageSize}
        />
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
    <div className="page-apikey-management__create-modal fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="page-apikey-management__create-modal-overlay fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

        <div className="page-apikey-management__create-modal-content relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="page-apikey-management__modal-title text-lg font-medium text-gray-900 dark:text-white">
              Create New API Key
            </h3>
            <button
              onClick={onClose}
              className="page-apikey-management__modal-close-btn text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              data-testid="close-modal-btn"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="page-apikey-management__form space-y-4">
            <div>
              <label className="page-apikey-management__form-label form-label">
                API Key Name *
              </label>
              <input
                type="text"
                required
                className="page-apikey-management__form-input form-input"
                placeholder="e.g., Production API Key"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                data-testid="api-key-name-input"
              />
            </div>

            <div>
              <label className="page-apikey-management__form-label form-label">
                Permissions
              </label>
              <div className="space-y-2">
                {availablePermissions.map(permission => (
                  <label key={permission.value} className="page-apikey-management__permission-row flex items-start">
                    <input
                      type="checkbox"
                      className="page-apikey-management__permission-checkbox w-4 h-4 mt-1 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
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
              <label className="page-apikey-management__form-label form-label">
                Expiration Date (Optional)
              </label>
              <input
                type="datetime-local"
                className="page-apikey-management__form-input form-input"
                value={formData.expiresAt}
                onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                data-testid="expires-at-input"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="page-apikey-management__cancel-btn btn-secondary"
                data-testid="cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="page-apikey-management__create-btn-modal btn-primary"
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
