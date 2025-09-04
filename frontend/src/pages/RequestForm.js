import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

const RequestForm = () => {
  const [formData, setFormData] = useState({
    // default to feature_access to avoid API key being selected by default
    type: 'feature_access',
    title: '',
    description: '',
    priority: 'medium',
    metadata: {}
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const requestTypes = [
    // API Key option will be conditionally shown based on user role
    {
      value: 'api_key',
      label: 'API Key Request',
      description: 'Request a new API key or additional permissions'
    },
    {
      value: 'role_upgrade',
      label: 'Role Upgrade',
      description: 'Request upgrade to contributor or admin role'
    },
    {
      value: 'feature_access',
      label: 'Feature Access',
      description: 'Request access to premium features or tools'
    }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/requests', formData);
      toast.success('Request submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMetadataChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [key]: value
      }
    }));
  };

  return (
    <div className="page-request-form max-w-2xl mx-auto p-6">
      <h1 className="page-request-form__page-title text-2xl font-bold text-gray-900 dark:text-white mb-6">Submit Request</h1>
      <div className="page-request-form__intro mb-8">
        <h1 className="page-request-form__title text-2xl font-bold text-gray-900 dark:text-white">
          Submit New Request
        </h1>
        <p className="page-request-form__subtitle text-gray-600 dark:text-gray-400">
          Submit a request for review and approval by administrators
        </p>
      </div>

      <form onSubmit={handleSubmit} className="page-request-form__form space-y-6">
        {/* Request Type */}
        <div className="page-request-form__card card">
          <h3 className="page-request-form__section-title text-lg font-medium text-gray-900 dark:text-white mb-4">
            Request Type
          </h3>

          <div className="page-request-form__options grid grid-cols-1 gap-3">
            {requestTypes
              // If current user is a viewer, hide API key requests from the options
              .filter(t => t.value !== 'api_key' || !window.__APP_USER_ROLE__ || window.__APP_USER_ROLE__ !== 'viewer')
              .map((type) => (
                <label
                  key={type.value}
                  className={`page-request-form__request-type-option relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${formData.type === type.value
                    ? 'border-primary-600 ring-2 ring-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                    }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={formData.type === type.value}
                    onChange={handleChange}
                    className="sr-only"
                    data-testid={`request-type-${type.value}`}
                  />
                  <div className="page-request-form__option-content flex-1">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {type.label}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {type.description}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center h-5">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${formData.type === type.value
                        ? 'border-primary-600 bg-primary-600'
                        : 'border-gray-300'
                        }`}
                    >
                      {formData.type === type.value && (
                        <div className="w-2 h-2 rounded-full bg-white m-0.5"></div>
                      )}
                    </div>
                  </div>
                </label>
              ))}
          </div>
        </div>

        {/* Request Details */}
        <div className="page-request-form__card card">
          <h3 className="page-request-form__section-title text-lg font-medium text-gray-900 dark:text-white mb-4">
            Request Details
          </h3>

          <div className="page-request-form__section-content space-y-4">
            <div>
              <label htmlFor="title" className="page-request-form__label form-label">
                Request Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="page-request-form__input form-input"
                placeholder="Brief summary of your request"
                value={formData.title}
                onChange={handleChange}
                data-testid="request-title-input"
              />
            </div>

            <div>
              <label htmlFor="description" className="page-request-form__label form-label">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={5}
                className="page-request-form__textarea form-input"
                placeholder="Provide detailed information about your request, including justification and expected outcomes"
                value={formData.description}
                onChange={handleChange}
                data-testid="request-description-textarea"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Minimum 10 characters. Be specific about what you need and why.
              </p>
            </div>

            <div>
              <label htmlFor="priority" className="page-request-form__label form-label">
                Priority Level
              </label>
              <select
                id="priority"
                name="priority"
                className="page-request-form__select form-input"
                value={formData.priority}
                onChange={handleChange}
                data-testid="request-priority-select"
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Type-specific fields */}
        {formData.type === 'api_key' && (
          <div className="page-request-form__card card">
            <h3 className="page-request-form__section-title text-lg font-medium text-gray-900 dark:text-white mb-4">
              API Key Details
            </h3>

            <div className="page-request-form__section-content space-y-4">
              <div>
                <label className="page-request-form__label form-label">
                  Requested Permissions
                </label>
                <div className="page-request-form__permissions space-y-2">
                  {['read', 'write', 'delete'].map(permission => (
                    <label key={permission} className="page-request-form__permission-row flex items-center">
                      <input
                        type="checkbox"
                        className="page-request-form__permission-checkbox w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        checked={formData.metadata.permissions?.includes(permission) || false}
                        onChange={(e) => {
                          const permissions = formData.metadata.permissions || [];
                          if (e.target.checked) {
                            handleMetadataChange('permissions', [...permissions, permission]);
                          } else {
                            handleMetadataChange('permissions', permissions.filter(p => p !== permission));
                          }
                        }}
                        data-testid={`api-permission-${permission}`}
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {permission}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="page-request-form__label form-label">
                  Purpose/Use Case
                </label>
                <input
                  type="text"
                  className="page-request-form__input form-input"
                  placeholder="e.g., Integration with CRM system"
                  value={formData.metadata.purpose || ''}
                  onChange={(e) => handleMetadataChange('purpose', e.target.value)}
                  data-testid="api-purpose-input"
                />
              </div>
            </div>
          </div>
        )}

        {formData.type === 'role_upgrade' && (
          <div className="page-request-form__card card">
            <h3 className="page-request-form__section-title text-lg font-medium text-gray-900 dark:text-white mb-4">
              Role Upgrade Details
            </h3>

            <div className="page-request-form__section-content space-y-4">
              <div>
                <label className="page-request-form__label form-label">
                  Requested Role
                </label>
                <select
                  className="page-request-form__select form-input"
                  value={formData.metadata.requestedRole || ''}
                  onChange={(e) => handleMetadataChange('requestedRole', e.target.value)}
                  data-testid="requested-role-select"
                >
                  <option value="">Select role</option>
                  <option value="contributor">Contributor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="page-request-form__label form-label">
                  Justification
                </label>
                <textarea
                  rows={3}
                  className="page-request-form__textarea form-input"
                  placeholder="Explain why you need this role upgrade"
                  value={formData.metadata.justification || ''}
                  onChange={(e) => handleMetadataChange('justification', e.target.value)}
                  data-testid="role-justification-textarea"
                />
              </div>
            </div>
          </div>
        )}

        {formData.type === 'feature_access' && (
          <div className="page-request-form__card card">
            <h3 className="page-request-form__section-title text-lg font-medium text-gray-900 dark:text-white mb-4">
              Feature Access Details
            </h3>

            <div className="page-request-form__section-content space-y-4">
              <div>
                <label className="page-request-form__label form-label">
                  Feature Name
                </label>
                <input
                  type="text"
                  className="page-request-form__input form-input"
                  placeholder="e.g., Advanced Analytics Dashboard"
                  value={formData.metadata.featureName || ''}
                  onChange={(e) => handleMetadataChange('featureName', e.target.value)}
                  data-testid="feature-name-input"
                />
              </div>

              <div>
                <label className="page-request-form__label form-label">
                  Business Need
                </label>
                <textarea
                  rows={3}
                  className="page-request-form__textarea form-input"
                  placeholder="Describe the business need for this feature"
                  value={formData.metadata.businessNeed || ''}
                  onChange={(e) => handleMetadataChange('businessNeed', e.target.value)}
                  data-testid="business-need-textarea"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="page-request-form__actions flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="page-request-form__cancel-btn btn-secondary"
            data-testid="cancel-request-btn"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="page-request-form__submit-btn btn-primary flex items-center space-x-2"
            data-testid="submit-request-btn"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <PaperAirplaneIcon className="w-5 h-5" />
            )}
            <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestForm;
