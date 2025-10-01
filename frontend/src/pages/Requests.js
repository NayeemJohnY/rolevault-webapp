import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/helpers';
import { DataTableSearchFilter, DataTablePagination, useTableData } from '../components/TableUtilities';
import axios from 'axios';
import toast from 'react-hot-toast';

const Requests = () => {
  const { canApproveRequests } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use table data hook for pagination, search, and filtering
  const {
    paginatedData: paginatedRequests,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    pageInfo,
    setCurrentPage,
    updatePageSize
  } = useTableData(requests, 10);

  // Filter options for request filtering
  const filterOptions = [
    {
      key: 'status',
      label: 'All Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'denied', label: 'Denied' }
      ]
    },
    {
      key: 'type',
      label: 'All Types',
      options: [
        { value: 'data_access', label: 'Data Access' },
        { value: 'permission_change', label: 'Permission Change' },
        { value: 'account_update', label: 'Account Update' }
      ]
    }
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/requests/review');
      setRequests(response.data.requests);
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId) => {
    try {
      await axios.patch(`/api/requests/${requestId}/review`, {
        status: 'approved'
      });
      setRequests(requests.map(req =>
        req._id === requestId ? { ...req, status: 'approved' } : req
      ));
      toast.success('Request approved successfully');
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await axios.patch(`/api/requests/${requestId}/review`, {
        status: 'denied'
      });
      setRequests(requests.map(req =>
        req._id === requestId ? { ...req, status: 'denied' } : req
      ));
      toast.success('Request rejected');
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  if (loading) {
    return <div className="p-6">Loading requests...</div>;
  }

  return (
    <div className="page-requests-management requests-management-page max-w-7xl mx-auto p-6" data-testid="requests">
      <h1 className="page-requests-management__title page-title text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Requests Management
      </h1>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Help: <a href={`${window.location.origin}/help/requests`} className="underline mr-2">Requests Guide</a>
        <a href="/help/unknown" className="underline">Broken Help</a>
      </div>

      {/* Search and Filter Controls */}
      <DataTableSearchFilter
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filterOptions}
        selectedFilters={filters}
        onFilterChange={updateFilter}
        placeholder="Search requests by type, title, or submitter..."
      />

      <div className="page-requests-management__table requests-table-container bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden overflow-x-auto">
        <table className="page-requests-management__table-table requests-table min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
          <thead className="page-requests-management__table-header table-header bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="header-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">
                Type
              </th>
              <th className="header-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-48">
                Title
              </th>
              <th className="header-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">
                Status
              </th>
              <th className="header-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">
                Submitted By
              </th>
              <th className="header-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">
                Submitted
              </th>
              <th className="header-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">
                Last Modified
              </th>
              <th className="header-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="page-requests-management__table-body table-body bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedRequests.map((request) => (
              <tr key={request._id} className="page-requests-management__row table-row">
                <td className="page-requests-management__cell data-cell px-6 py-4 text-sm font-medium text-gray-900 dark:text-white truncate">
                  {request.type}
                </td>
                <td className="page-requests-management__cell data-cell px-6 py-4 text-sm text-gray-500 dark:text-gray-300 truncate">
                  {request.title}
                </td>
                <td className="page-requests-management__cell data-cell px-6 py-4">
                  <span className={`status-badge inline-flex px-2 py-1 text-xs font-semibold rounded-full ${request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    request.status === 'denied' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                    {request.status}
                  </span>
                </td>
                <td className="page-requests-management__cell data-cell px-6 py-4 text-sm text-gray-500 dark:text-gray-300 truncate">
                  {request.requestedBy?.name || 'Unknown'}
                </td>
                <td className="page-requests-management__cell data-cell px-6 py-4 text-sm text-gray-500 dark:text-gray-300 truncate">
                  {formatDate(request.createdAt)}
                </td>
                <td className="page-requests-management__cell data-cell px-6 py-4 text-sm text-gray-500 dark:text-gray-300 truncate">
                  {formatDate(request.updatedAt || request.reviewedAt || request.createdAt)}
                </td>
                <td className="page-requests-management__cell actions-cell px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {request.status === 'pending' && canApproveRequests() && (
                    <div className="page-requests-management__action-buttons action-buttons flex space-x-3">
                      <button
                        onClick={() => approveRequest(request._id)}
                        className="page-requests-management__approve-btn approve-button inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800 dark:text-green-100 dark:hover:bg-green-700 transition-colors"
                        data-testid={`approve-request-${request._id}`}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectRequest(request._id)}
                        className="page-requests-management__reject-btn reject-button inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700 transition-colors"
                        data-testid={`reject-request-${request._id}`}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <DataTablePagination
          pageInfo={pageInfo}
          onPageUpdate={setCurrentPage}
          onSizeUpdate={updatePageSize}
        />
      </div>
    </div>
  );
};

export default Requests;
