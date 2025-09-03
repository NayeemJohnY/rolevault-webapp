import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';

export default function ApiHealth() {
    const { user } = useAuth();
    const { get } = useApi();
    const [endpoints, setEndpoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // fetch once when user changes; api (from useApi) is stable enough for our uses —
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        let mounted = true;
        async function fetchHealth() {
            setLoading(true);
            try {
                const role = user?.role || 'viewer';
                const res = await get('/api/health', { params: { role } });
                if (!mounted) return;
                if (res?.data?.success) {
                    setEndpoints(res.data.endpoints || []);
                } else {
                    setError(res?.data?.message || 'Failed to load API endpoints');
                }
            } catch (err) {
                setError(err.message || 'Network error');
            } finally {
                if (mounted) setLoading(false);
            }
        }
        fetchHealth();
        return () => { mounted = false; };
    }, [user, get]);

    if (loading) return <div className="p-6">Loading API health...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">API Health</h1>
            {endpoints.length === 0 ? (
                <div>No endpoints available for your role.</div>
            ) : (
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                    {endpoints.map((cat) => (
                        <div key={cat.category} className="p-4 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-lg font-medium mb-2">{cat.category}</h2>
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-gray-500 uppercase">
                                        <th className="px-3 py-2">Path</th>
                                        <th className="px-3 py-2">Methods</th>
                                        <th className="px-3 py-2">Auth</th>
                                        <th className="px-3 py-2">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cat.routes.map((r) => (
                                        <tr key={r.path} className="border-t border-gray-100 dark:border-gray-700">
                                            <td className="px-3 py-2 align-top font-mono text-xs text-gray-700 dark:text-gray-200">{r.path}</td>
                                            <td className="px-3 py-2 align-top">{r.methods.join(', ')}</td>
                                            <td className="px-3 py-2 align-top">{r.authRequired ? 'Yes' : 'No'}</td>
                                            <td className="px-3 py-2 align-top text-gray-600 dark:text-gray-300">{r.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
