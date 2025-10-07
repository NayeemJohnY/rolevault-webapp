import React, { useState } from 'react';
import IframeViewer from '../components/IframeViewer';
import IframeModal from '../components/IframeModal';

const IframeDemo = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalSrc, setModalSrc] = useState('');
    const [modalTitle, setModalTitle] = useState('');

    const openModal = (src, title) => {
        setModalSrc(src);
        setModalTitle(title);
        setModalOpen(true);
    };

    const demoIframes = [
        {
            title: 'Web Development Tools',
            items: [
                { name: 'CodePen', url: 'https://codepen.io/trending', description: 'Interactive code examples and demos' },
                { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/', description: 'Comprehensive web development documentation' },
                { name: 'Can I Use', url: 'https://caniuse.com/', description: 'Browser compatibility tables' }
            ]
        },
        {
            title: 'API Documentation',
            items: [
                { name: 'GitHub API', url: 'https://docs.github.com/en/rest', description: 'GitHub REST API documentation' },
                { name: 'JSONPlaceholder', url: 'https://jsonplaceholder.typicode.com/', description: 'Fake REST API for testing' },
                { name: 'HTTP Status Codes', url: 'https://httpstatuses.com/', description: 'HTTP status code reference' }
            ]
        },
        {
            title: 'Design Resources',
            items: [
                { name: 'Tailwind CSS', url: 'https://tailwindcss.com/docs', description: 'Utility-first CSS framework documentation' },
                { name: 'Heroicons', url: 'https://heroicons.com/', description: 'Beautiful hand-crafted SVG icons' },
                { name: 'Unsplash', url: 'https://unsplash.com/', description: 'Free high-resolution photos' }
            ]
        }
    ];

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Iframe Integration Demo</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
                This page demonstrates various ways to integrate external content using iframes in the RoleVault application.
            </p>

            {/* Featured iframe section */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Featured: React Documentation</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <IframeViewer
                        src="https://react.dev/learn"
                        title="React Documentation"
                        height="600px"
                    />
                </div>
            </div>

            {/* Categorized iframe sections */}
            {demoIframes.map((category, categoryIndex) => (
                <div key={categoryIndex} className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">{category.title}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{item.name}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{item.description}</p>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => openModal(item.url, item.name)}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        Open in Modal
                                    </button>
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-center text-sm"
                                    >
                                        Open in New Tab
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Inline iframe examples */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Inline Examples</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">CodePen Trending</h3>
                        <IframeViewer
                            src="https://codepen.io/trending"
                            title="CodePen Trending"
                            height="400px"
                        />
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">CSS Grid Garden</h3>
                        <IframeViewer
                            src="https://cssgridgarden.com/"
                            title="CSS Grid Garden Game"
                            height="400px"
                        />
                    </div>
                </div>
            </div>

            {/* Security notes */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Security Note</h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    All iframes in this application use sandbox attributes for security. Some external sites may not load properly
                    due to their Content Security Policy (CSP) settings. This is normal behavior to prevent clickjacking attacks.
                </p>
            </div>

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

export default IframeDemo;