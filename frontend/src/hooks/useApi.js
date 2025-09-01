import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Universal hook for API calls
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = async (method, url, data = null, options = {}) => {
    setLoading(true);
    setError(null);

    // Log request details
    console.log(`[API] ${method} ${url}`, { data, options });

    try {
      const config = { 
        method, 
        url, 
        ...options 
      };
      
      if (data) config.data = data;
      
      const response = await axios(config);
      // Log response
      console.log(`[API] Response for ${method} ${url}:`, response.data);
      
      // Show success message if provided
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      
      setLoading(false);
      return { 
        success: true, 
        data: response.data,
        message: response.data.message 
      };
    } catch (err) {
      const message = err.response?.data?.message || `${method.toUpperCase()} request failed`;
      // Log error
      console.error(`[API] Error for ${method} ${url}:`, err);
      
      // Show error message unless suppressed
      if (!options.suppressError) {
        toast.error(message);
      }
      
      setError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  };

  return {
    loading,
    error,
    apiCall,
    // Convenience methods
    get: (url, options) => apiCall('GET', url, null, options),
    post: (url, data, options) => apiCall('POST', url, data, options),
    put: (url, data, options) => apiCall('PUT', url, data, options),
    patch: (url, data, options) => apiCall('PATCH', url, data, options),
    delete: (url, options) => apiCall('DELETE', url, null, options)
  };
};

// Hook for paginated data
export const usePaginatedData = (url, dependencies = []) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const { get } = useApi();

  const fetchData = async (page = 1, params = {}) => {
    setLoading(true);
    const result = await get(`${url}?page=${page}&${new URLSearchParams(params)}`, { suppressError: true });
    
    if (result.success) {
      setData(result.data);
      setPagination(result.data.pagination || {});
    }
    setLoading(false);
    return result;
  };

  return {
    data,
    pagination,
    loading,
    fetchData,
    refetch: () => fetchData(pagination.current || 1)
  };
};
