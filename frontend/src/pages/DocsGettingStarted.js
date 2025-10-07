import React, { useState } from 'react';
import IframeViewer from '../components/IframeViewer';
import IframeModal from '../components/IframeModal';

const DocsGettingStarted = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalSrc, setModalSrc] = useState('');
    const [modalTitle, setModalTitle] = useState('');

    const openModal = (src, title) => {
        setModalSrc(src);
        setModalTitle(title);
        setModalOpen(true);
    };

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

            {/* Interactive Tutorial Section */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Interactive Tutorial</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Learn React fundamentals with this interactive tutorial:
                </p>
                <IframeViewer
                    src="https://react.dev/learn/tutorial-tic-tac-toe"
                    title="React Interactive Tutorial"
                    height="600px"
                />
            </div>

            {/* API Playground Section */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">API Documentation</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Explore REST API concepts and examples:
                </p>
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => openModal('https://httpbin.org/', 'HTTP Testing Service')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Open HTTP Testing Tool
                    </button>
                    <button
                        onClick={() => openModal('https://jsonplaceholder.typicode.com/', 'JSON Placeholder API')}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                        Open JSON API Examples
                    </button>
                </div>
                <IframeViewer
                    src="https://docs.github.com/en/rest"
                    title="GitHub REST API Documentation"
                    height="500px"
                />
            </div>

            {/* Code Examples Section */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Code Examples</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Browse JavaScript and React code examples:
                </p>
                <IframeViewer
                    src="https://codepen.io/trending"
                    title="CodePen Trending Examples"
                    height="500px"
                />
            </div>

            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                If you need more help, contact your administrator or check the support documentation.
            </p>

            {/* Iframe Modal */}
            <IframeModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                src={modalSrc}
                title={modalTitle}
            />
        </div>
    );
};

export default DocsGettingStarted;
