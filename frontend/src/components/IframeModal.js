import React from 'react';

const IframeModal = ({ isOpen, onClose, src, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl transition-colors"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>
                <div className="flex-1 p-4">
                    <iframe
                        src={src}
                        title={title}
                        className="w-full h-full border rounded dark:border-gray-600"
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
                    />
                </div>
            </div>
        </div>
    );
};

export default IframeModal;