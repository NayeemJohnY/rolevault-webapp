
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/helpers';
import { DataTableSearchFilter, DataTablePagination, useTableData } from '../components/TableUtilities';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function MyRequests() {

    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Table utilities
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
        let mounted = true;
        const fetch = async () => {
            try {
                const res = await axios.get('/api/requests');
                if (!mounted) return;
                setRequests(res.data.requests || []);
            } catch (err) {
                console.error('Failed to fetch my requests', err);
                toast.error('Failed to load your requests');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetch();
        return () => { mounted = false; };
    }, [user]);

    if (loading) return <div className="p-6">Loading your requests...</div>;

    return (
        <div className="page-my-requests my-requests-page max-w-4xl mx-auto p-6" data-testid="my-requests">
            <h1 className="page-my-requests__title page-title text-2xl font-bold text-gray-900 dark:text-white mb-4">My Requests</h1>

            {/* Search and Filter Controls */}
            <DataTableSearchFilter
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                filters={filterOptions}
                selectedFilters={filters}
                onFilterChange={updateFilter}
                placeholder="Search requests by type, title, or status..."
            />

            {paginatedRequests.length === 0 ? (
                <div className="page-my-requests__empty-state bg-white dark:bg-gray-800 rounded-lg shadow p-6">You have not submitted any requests yet.</div>
            ) : (
                <div className="page-my-requests__table-wrapper bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submitted</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedRequests.map((r) => (
                                <tr key={r._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{r.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{r.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${r.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            r.status === 'denied' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(r.createdAt)}</td>
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
            )}
        </div>
    );
}
