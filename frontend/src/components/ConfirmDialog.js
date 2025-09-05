import React from 'react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 z-10 w-full max-w-xs">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">{message}</p>
                <div className="flex justify-end gap-2">
                    <button
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
