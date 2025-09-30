import React, { useState, useEffect, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
// Single popup variant for welcome message
const popupVariant = {
    icon: '🎉',
    title: 'Welcome to RoleVault!',
    message: 'Thanks for logging in to RoleVault! Explore your dashboard to manage users, files, and requests efficiently.',
    tip: '💡 Tip: You can manage users, upload files, and handle requests all from your dashboard!',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    tipBg: 'bg-blue-50 dark:bg-blue-900/20',
    tipText: 'text-blue-800 dark:text-blue-200'
};

const RandomPopup = ({ isOpen, onClose, onDismiss }) => {
    const [isAnimating, setIsAnimating] = useState(false);

    // Animation effect when popup opens
    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
        }
    }, [isOpen]);

    // Handle close (X button) - popup can show again
    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    // Handle Got it - permanently dismiss popup
    const handleGotIt = useCallback(() => {
        if (onDismiss) {
            onDismiss();
        } else {
            onClose();
        }
    }, [onClose, onDismiss]);



    // Handle Escape key to close popup
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && isOpen) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, handleClose]);

    if (!isOpen) return null;

    const variant = popupVariant;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-title"
            aria-describedby="popup-description"
            data-testid="random-popup-overlay"
            title="RoleVault App Information - Interactive Help Dialog"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={handleClose}
                data-testid="popup-backdrop"
                aria-label="Close popup by clicking outside"
            />            {/* Popup Content */}
            <div
                className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all duration-300 ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}
                data-testid="popup-content"
                role="document"
                title="RoleVault Feature Spotlight - Tips and Information"
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
                    aria-label="Close popup"
                    data-testid="popup-close-button"
                    type="button"
                    title="Close this RoleVault tip - will reappear in 5 seconds"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>                {/* Popup Content */}
                <div className="mt-2" data-testid="popup-body">
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0">
                            <div
                                className={`w-12 h-12 ${variant.bgColor} rounded-full flex items-center justify-center animate-bounce`}
                                data-testid="popup-icon"
                                aria-hidden="true"
                                title={`RoleVault Feature: ${variant.title}`}
                            >
                                <span className="text-2xl">{variant.icon}</span>
                            </div>
                        </div>
                        <div className="ml-4">
                            <h3
                                id="popup-title"
                                className="text-lg font-semibold text-gray-900 dark:text-white"
                                data-testid="popup-title"
                                title={`RoleVault App Information: ${variant.title}`}
                            >
                                {variant.title}
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p
                            id="popup-description"
                            className="text-gray-600 dark:text-gray-300"
                            data-testid="popup-message"
                            title="RoleVault Feature Information and Usage Details"
                        >
                            {variant.message}
                        </p>                        <div
                            className={`${variant.tipBg} rounded-lg p-3`}
                            data-testid="popup-tip"
                            role="note"
                            aria-label="Helpful tip"
                            title="RoleVault Pro Tip - Best Practices and Features"
                        >
                            <p className={`text-sm ${variant.tipText}`}>
                                <strong>{variant.tip.split(':')[0]}:</strong> {variant.tip.split(':').slice(1).join(':').trim()}
                            </p>
                        </div>                        <div className="flex justify-end items-center pt-4" data-testid="popup-actions">
                            <button
                                onClick={handleGotIt}
                                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                data-testid="popup-got-it-button"
                                type="button"
                                aria-describedby="popup-description"
                                title="Dismiss this RoleVault tip permanently - move to next feature highlight"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RandomPopup;