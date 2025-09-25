import React, { useState, useEffect } from 'react';
import { DataTableSearchFilter, DataTablePagination } from '../../components/TableUtilities';
import Modal from 'react-modal';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' });
  const [creating, setCreating] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [pageSize, setPageSize] = useState(10);

  // Filter options for role filter
  const filterOptions = [
    {
      key: 'role',
      label: 'All Roles',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'contributor', label: 'Contributor' },
        { value: 'viewer', label: 'Viewer' }
      ]
    }
  ];
  const openModal = () => {
    setForm({ name: '', email: '', password: '', role: 'viewer' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (query) => {
    // Child component debounces and calls this handler with the final value.
    setSearchQuery(query);
    fetchUsers(1, pageSize, query, selectedFilters); // Reset to page 1 when searching
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...selectedFilters, [filterKey]: value };
    setSelectedFilters(newFilters);
    fetchUsers(1, pageSize, searchQuery, newFilters); // Reset to page 1 when filtering
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, current: newPage }));
    fetchUsers(newPage, pageSize, searchQuery, selectedFilters);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to page 1
    fetchUsers(1, newSize, searchQuery, selectedFilters);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await axios.post('/api/users', form);
      setUsers([response.data.user, ...users]);
      toast.success('User created successfully');
      closeModal();
      // Refresh the current page to show updated data
      fetchUsers(pagination.current, pageSize, searchQuery, selectedFilters);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const initializedRef = React.useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      fetchUsers(1, 10, '', {}); // Use default pageSize of 10
    }
  }, []); // Only run on mount

  // ...existing code...

  const fetchUsers = async (page = 1, limit = 10, search = '', filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (search) params.append('search', search);
      if (filters.role) params.append('role', filters.role);

      const response = await axios.get(`/api/users?${params}`);

      setUsers(response.data.users || []);

      // Ensure pagination data has proper structure
      const paginationData = response.data.pagination || {
        current: 1,
        pages: 1,
        total: 0
      };

      setPagination(paginationData);

    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    setConfirmDialog({
      open: true,
      title: 'Delete User',
      message: 'Are you sure you want to delete this user?',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, open: false });
        try {
          await axios.delete(`/api/users/${userId}`);
          toast.success('User deleted successfully');

          // If we're on the last page and there's only one item, go to previous page
          let newPage = pagination.current;
          if (users.length === 1 && pagination.current > 1) {
            newPage = pagination.current - 1;
            setPagination(prev => ({ ...prev, current: newPage }));
          }

          // Refresh the data with potentially updated page
          fetchUsers(newPage, pageSize, searchQuery, selectedFilters);
        } catch (error) {
          console.error('Error deleting user:', error);
          toast.error('Failed to delete user');
        }
      }
    });
  };

  if (loading) {
    return <div className="p-6">Loading users...</div>;
  }

  return (
    <div className="page-user-management user-management-page p-6" data-testid="user-management">
      <h1 className="page-user-management__title page-title text-2xl font-bold text-gray-900 dark:text-white mb-6">
        User Management
      </h1>

      <button
        onClick={openModal}
        className="page-user-management__add-btn add-user-button mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        data-testid="add-user-btn"
      >
        Add New User
      </button>

      {/* Search and Filter Controls */}
      <DataTableSearchFilter
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        filters={filterOptions}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        placeholder="Search users by name, email, or role..."
      />

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add User Modal"
        ariaHideApp={false}
        className="page-user-management__modal fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="page-user-management__modal-overlay fixed inset-0 bg-black bg-opacity-50 z-40"
      >
        <form
          onSubmit={handleCreateUser}
          className="page-user-management__form bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md"
        >
          <h2 className="text-xl font-bold mb-4">Add New User</h2>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleFormChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleFormChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="viewer">Viewer</option>
              <option value="contributor">Contributor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {creating ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
      />

      <div className="page-user-management__table users-table-container bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="page-user-management__table-table users-table min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="page-user-management__table-header table-header bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="header-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="header-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="header-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="header-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="page-user-management__table-body table-body bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {loading ? 'Loading users...' : 'No users found'}
                </td>
              </tr>
            ) : (
              users.map((userItem) => (
                <tr key={userItem._id} className="page-user-management__row table-row">
                  <td className="page-user-management__cell data-cell px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {userItem.name}
                  </td>
                  <td className="page-user-management__cell data-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {userItem.email}
                  </td>
                  <td className="page-user-management__cell data-cell px-6 py-4 whitespace-nowrap">
                    <span className={`page-user-management__role-badge role-badge inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userItem.role === 'admin' ? 'bg-red-100 text-red-800' :
                      userItem.role === 'contributor' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                      {userItem.role}
                    </span>
                  </td>
                  <td className="page-user-management__cell actions-cell px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => deleteUser(userItem._id)}
                      className="page-user-management__delete-btn delete-user-button text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      data-testid={`delete-user-${userItem._id}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination - only show if there are users */}
        {users.length > 0 && (
          <DataTablePagination
            pageInfo={{
              currentPage: pagination.current,
              totalPages: pagination.pages,
              totalRecords: pagination.total,
              pageSize: pageSize
            }}
            onPageUpdate={handlePageChange}
            onSizeUpdate={handlePageSizeChange}
          />
        )}
      </div>
    </div>
  );
};

export default UserManagement;
