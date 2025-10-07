import React, { useRef, useState } from 'react';
import ShadowDOMApiHealth from '../components/ShadowDOMApiHealth';
import ShadowDOMFileUpload from '../components/ShadowDOMFileUpload';
import ShadowDOMNotificationWidget from '../components/ShadowDOMNotificationWidget';
import ShadowDOMProgressTracker from '../components/ShadowDOMProgressTracker';

/**
 * Shadow DOM Demo Page
 * Showcases various Shadow DOM components and their isolation capabilities
 */
const ShadowDOMDemo = () => {
    const notificationRef = useRef(null);
    const progressRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileSelect = (files) => {
        setSelectedFiles(files);

        // Demo: Add progress items for each file
        if (progressRef.current && files.length > 0) {
            files.forEach((file, index) => {
                const id = progressRef.current.addProgress({
                    name: `Uploading ${file.name}`,
                    progress: 0,
                    status: 'running',
                    size: file.size,
                    speed: Math.random() * 1000000 + 100000 // Random speed for demo
                });

                // Simulate upload progress
                simulateProgress(id, file.name);
            });
        }

        // Show notification
        if (notificationRef.current) {
            notificationRef.current.addNotification({
                type: 'success',
                title: 'Files Selected',
                message: `${files.length} file(s) selected for upload`,
                actions: [
                    {
                        id: 'upload',
                        label: 'Start Upload',
                        onClick: () => {
                            console.log('Starting upload for files:', files);
                        }
                    },
                    {
                        id: 'cancel',
                        label: 'Cancel',
                        type: 'secondary',
                        onClick: () => {
                            setSelectedFiles([]);
                        }
                    }
                ]
            });
        }
    };

    const simulateProgress = (id, fileName) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;

            if (progress >= 100) {
                progress = 100;
                progressRef.current?.updateProgress(id, {
                    progress: 100,
                    status: 'completed',
                    speed: 0
                });

                // Show completion notification
                notificationRef.current?.addNotification({
                    type: 'success',
                    title: 'Upload Complete',
                    message: `${fileName} has been uploaded successfully`,
                    duration: 3000
                });

                clearInterval(interval);
            } else {
                progressRef.current?.updateProgress(id, {
                    progress,
                    speed: Math.random() * 500000 + 100000
                });
            }
        }, 200 + Math.random() * 300);
    };

    const showTestNotifications = () => {
        if (!notificationRef.current) return;

        const notifications = [
            {
                type: 'info',
                title: 'System Update',
                message: 'New features are now available in your dashboard',
                duration: 4000
            },
            {
                type: 'warning',
                title: 'Storage Warning',
                message: 'You are approaching your storage limit',
                duration: 6000,
                actions: [
                    {
                        id: 'upgrade',
                        label: 'Upgrade Plan',
                        onClick: () => console.log('Upgrade clicked')
                    }
                ]
            },
            {
                type: 'error',
                title: 'Connection Failed',
                message: 'Unable to connect to the server. Please try again.',
                duration: 8000
            }
        ];

        notifications.forEach((notification, index) => {
            setTimeout(() => {
                notificationRef.current.addNotification(notification);
            }, index * 1000);
        });
    };

    const addTestProgress = () => {
        if (!progressRef.current) return;

        const operations = [
            { name: 'Processing large dataset.csv', size: 50000000 },
            { name: 'Generating report.pdf', size: 2000000 },
            { name: 'Backing up database', size: 100000000 }
        ];

        operations.forEach((op, index) => {
            setTimeout(() => {
                const id = progressRef.current.addProgress({
                    ...op,
                    progress: Math.random() * 30,
                    status: 'running',
                    speed: Math.random() * 1000000 + 200000
                });

                // Simulate random progress updates
                simulateProgress(id, op.name);
            }, index * 500);
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-800 mb-4">
                        Shadow DOM Components Demo
                    </h1>
                    <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                        Experience true component isolation with Shadow DOM. Each component below
                        has its own isolated styles and DOM tree, preventing style conflicts and
                        providing encapsulation.
                    </p>
                </div>

                {/* Demo Controls */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">Demo Controls</h2>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={showTestNotifications}
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                        >
                            Show Test Notifications
                        </button>
                        <button
                            onClick={addTestProgress}
                            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                        >
                            Add Test Progress Items
                        </button>
                        <button
                            onClick={() => progressRef.current?.clearCompleted()}
                            className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                        >
                            Clear Completed
                        </button>
                        <button
                            onClick={() => notificationRef.current?.clearAll()}
                            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                            Clear All Notifications
                        </button>
                    </div>
                </div>

                {/* Components Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* API Health Monitor */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">
                            API Health Monitor
                        </h3>
                        <p className="text-slate-600 mb-6">
                            Isolated health monitoring widget with gradient effects and real-time status updates.
                        </p>
                        <div className="flex justify-center">
                            <ShadowDOMApiHealth apiEndpoint="/api/health" />
                        </div>
                    </div>

                    {/* File Upload Widget */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">
                            File Upload Widget
                        </h3>
                        <p className="text-slate-600 mb-6">
                            Drag-and-drop file upload with isolated styling and progress tracking.
                        </p>
                        <div className="flex justify-center">
                            <ShadowDOMFileUpload
                                onFileSelect={handleFileSelect}
                                maxFiles={5}
                                acceptedTypes="*"
                            />
                        </div>
                        {selectedFiles.length > 0 && (
                            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                                <h4 className="font-medium text-slate-800 mb-2">Selected Files:</h4>
                                <ul className="text-sm text-slate-600">
                                    {selectedFiles.map((file, index) => (
                                        <li key={index} className="flex justify-between">
                                            <span>{file.name}</span>
                                            <span>{(file.size / 1024).toFixed(1)} KB</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Progress Tracker */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">
                            Progress Tracker
                        </h3>
                        <p className="text-slate-600 mb-6">
                            Real-time progress tracking for file operations with isolated animations.
                        </p>
                        <div className="flex justify-center">
                            <ShadowDOMProgressTracker ref={progressRef} />
                        </div>
                    </div>

                    {/* Feature Highlights */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">
                            Shadow DOM Features
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div>
                                    <h4 className="font-medium text-slate-800">Style Isolation</h4>
                                    <p className="text-sm text-slate-600">
                                        Components have completely isolated CSS that cannot conflict with global styles.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <div>
                                    <h4 className="font-medium text-slate-800">DOM Encapsulation</h4>
                                    <p className="text-sm text-slate-600">
                                        Internal DOM structure is hidden from external JavaScript queries.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                <div>
                                    <h4 className="font-medium text-slate-800">Event Isolation</h4>
                                    <p className="text-sm text-slate-600">
                                        Events are contained within the shadow boundary while still allowing controlled communication.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                <div>
                                    <h4 className="font-medium text-slate-800">Reusability</h4>
                                    <p className="text-sm text-slate-600">
                                        Components can be safely reused anywhere without style conflicts.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technical Info */}
                <div className="mt-12 bg-slate-900 text-white rounded-2xl p-8">
                    <h2 className="text-2xl font-semibold mb-6">Technical Implementation</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-medium mb-3 text-blue-300">Shadow DOM Creation</h3>
                            <pre className="bg-slate-800 p-4 rounded-lg text-sm overflow-x-auto">
                                {`const shadowRoot = element.attachShadow({ 
  mode: 'open' 
});
shadowRoot.innerHTML = template;`}
                            </pre>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium mb-3 text-green-300">Style Isolation</h3>
                            <pre className="bg-slate-800 p-4 rounded-lg text-sm overflow-x-auto">
                                {`<style>
  :host {
    display: block;
    /* Isolated styles */
  }
</style>`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Widget (Fixed Position) */}
            <ShadowDOMNotificationWidget ref={notificationRef} />
        </div>
    );
};

export default ShadowDOMDemo;