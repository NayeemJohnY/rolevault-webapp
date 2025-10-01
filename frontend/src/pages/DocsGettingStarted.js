import React from 'react';

const DocsGettingStarted = () => {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Getting Started</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
                Welcome to RoleVault. This short guide helps you get started with the most common tasks:
            </p>

                    <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Create and manage requests from the <a href="/requests" className="underline">Requests</a> page.</li>
                    <li>Upload and manage files from the <a href={`${window.location.origin}/upload`} className="underline">Upload</a> page.</li>
                    <li>Manage API keys from the <a href="/apikeys" className="underline">API Keys</a> section (if you have permissions).</li>
                    <li>Visit your <a href={`${window.location.origin}/profile`} className="underline">Profile</a> to update information and preferences.</li>
                </ul>

            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                If you need more help, contact your administrator or check the support documentation.
            </p>
        </div>
    );
};

export default DocsGettingStarted;
