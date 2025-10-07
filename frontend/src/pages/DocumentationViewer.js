import React, { useState } from 'react';
import IframeViewer from '../components/IframeViewer';

const DocumentationViewer = () => {
    const [selectedDoc, setSelectedDoc] = useState('getting-started');

    const documentationSources = {
        'getting-started': 'https://docs.github.com/en/get-started/quickstart/hello-world',
        'api-reference': 'https://docs.github.com/en/rest',
        'tutorials': 'https://docs.github.com/en/get-started/quickstart',
        'react-docs': 'https://react.dev/learn',
        'tailwind-docs': 'https://tailwindcss.com/docs',
        'changelog': 'https://github.com/changelog'
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Documentation Viewer</h1>

            <div className="flex gap-6">
                {/* Navigation sidebar */}
                <div className="w-64 flex-shrink-0">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Documentation Sections</h3>
                        <nav className="space-y-2">
                            {Object.keys(documentationSources).map((key) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedDoc(key)}
                                    className={`w-full text-left px-3 py-2 rounded transition-colors ${selectedDoc === key
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Iframe content */}
                <div className="flex-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                            {selectedDoc.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h2>
                        <IframeViewer
                            src={documentationSources[selectedDoc]}
                            title={`${selectedDoc} Documentation`}
                            height="800px"
                            className="w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentationViewer;