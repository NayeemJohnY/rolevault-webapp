import React from 'react';

const NotFound = () => (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">404 - Not Found</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">The page or resource you requested does not exist.</p>
        <a href="/dashboard" className="underline text-blue-600 dark:text-blue-400">Go to Dashboard</a>
    </div>
);

export default NotFound;
