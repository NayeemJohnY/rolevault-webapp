// API Health Endpoint: Returns all backend API routes and supported HTTP methods
const express = require('express');
const router = express.Router();
const { canViewOwnApiKeys } = require('../middleware/auth');


// List of all API endpoints with metadata
const apiEndpoints = [
    {
        category: 'Authentication',
        routes: [
            {
                path: '/api/auth/register',
                methods: ['POST'],
                description: 'Register a new user',
                authRequired: false,
                permissions: [],
            },
            {
                path: '/api/auth/login',
                methods: ['POST'],
                description: 'Login and receive JWT token',
                authRequired: false,
                permissions: [],
            },
            {
                path: '/api/auth/me',
                methods: ['GET', 'PUT'],
                description: 'Get or update current user profile',
                authRequired: true,
                permissions: [],
            },
            {
                path: '/api/auth/logout',
                methods: ['POST'],
                description: 'Logout user',
                authRequired: true,
                permissions: [],
            },
        ],
    },
    {
        category: 'Users',
        routes: [
            {
                path: '/api/users',
                methods: ['GET', 'POST'],
                description: 'List all users or create a new user',
                authRequired: true,
                permissions: ['rv.users.manage'],
            },
            {
                path: '/api/users/:id',
                methods: ['GET', 'PUT', 'DELETE'],
                description: 'Get, update, or delete a user by ID',
                authRequired: true,
                permissions: ['rv.users.manage'],
            },
        ],
    },
    {
        category: 'API Keys',
        routes: [
            {
                path: '/api/apikeys',
                methods: ['GET', 'POST'],
                description: 'List or create API keys',
                authRequired: true,
                permissions: ['rv.apiKeys.view', 'rv.apiKeys.create'],
            },
            {
                path: '/api/apikeys/:id',
                methods: ['GET', 'PUT', 'DELETE'],
                description: 'Get, update, or delete an API key',
                authRequired: true,
                permissions: ['rv.apiKeys.view', 'rv.apiKeys.manage'],
            },
            {
                path: '/api/apikeys/:id/regenerate',
                methods: ['POST'],
                description: 'Regenerate an API key',
                authRequired: true,
                permissions: ['rv.apiKeys.manage'],
            },
            {
                path: '/api/apikeys/stats/overview',
                methods: ['GET'],
                description: 'Get API key statistics overview',
                authRequired: true,
                permissions: ['rv.apiKeys.viewAll'],
            },
        ],
    },
    {
        category: 'Requests',
        routes: [
            {
                path: '/api/requests',
                methods: ['GET'],
                description: 'List user\'s own requests',
                authRequired: true,
                permissions: ['rv.requests.view'],
            },
            {
                path: '/api/requests',
                methods: ['POST'],
                description: 'Submit a new request',
                authRequired: true,
                permissions: ['rv.requests.create'],
            },
            {
                path: '/api/requests/review',
                methods: ['GET'],
                description: 'List all requests for review',
                authRequired: true,
                permissions: ['rv.requests.viewAll'],
            },
            {
                path: '/api/requests/:id',
                methods: ['GET', 'PUT', 'DELETE'],
                description: 'Get, update, or delete a specific request',
                authRequired: true,
                permissions: ['rv.requests.view', 'rv.requests.create'],
            },
            {
                path: '/api/requests/:id/review',
                methods: ['PATCH'],
                description: 'Review (approve/reject) a request',
                authRequired: true,
                permissions: ['rv.requests.approve', 'rv.requests.reject'],
            },
        ],
    },
    {
        category: 'Files',
        routes: [
            {
                path: '/api/files/upload',
                methods: ['POST'],
                description: 'Upload a file',
                authRequired: true,
                permissions: ['rv.files.upload'],
            },
            {
                path: '/api/files',
                methods: ['GET'],
                description: 'List files',
                authRequired: true,
                permissions: ['rv.files.download'],
            },
            {
                path: '/api/files/:id',
                methods: ['GET', 'PUT', 'DELETE'],
                description: 'Get, update, or delete a file',
                authRequired: true,
                permissions: ['rv.files.download', 'rv.files.upload'],
            },
            {
                path: '/api/files/:id/download',
                methods: ['GET'],
                description: 'Download a file',
                authRequired: true,
                permissions: ['rv.files.download'],
            },
        ],
    },
    {
        category: 'Dashboard',
        routes: [
            {
                path: '/api/dashboard',
                methods: ['GET'],
                description: 'Get dashboard data and statistics',
                authRequired: true,
                permissions: [],
            },
            {
                path: '/api/dashboard/theme',
                methods: ['PATCH'],
                description: 'Update user theme preference',
                authRequired: true,
                permissions: [],
            },
        ],
    },
    {
        category: 'System',
        routes: [
            {
                path: '/api/health',
                methods: ['GET'],
                description: 'API health check and endpoint documentation',
                authRequired: true,
                permissions: ['rv.apiKeys.view'],
            },
        ],
    },
];


// Helper: filter endpoints by user permissions
function filterEndpointsByPermissions(endpoints, userPermissions) {
    return endpoints.map(category => ({
        category: category.category,
        routes: category.routes.filter(route => {
            // If no permissions required, show to all authenticated users
            if (!route.permissions || route.permissions.length === 0) {
                return true;
            }
            // Check if user has any of the required permissions
            return route.permissions.some(permission => userPermissions.includes(permission));
        }),
    })).filter(cat => cat.routes.length > 0);
}

// GET /api/health (authenticated)
router.get('/api/health', canViewOwnApiKeys, (req, res) => {
    // Use the authenticated user's permissions for filtering
    const userPermissions = req.user?.permissions || [];
    const categoryFilter = req.query.category;

    let endpoints = filterEndpointsByPermissions(apiEndpoints, userPermissions);

    if (categoryFilter) {
        endpoints = endpoints.filter(cat =>
            cat.category.toLowerCase() === categoryFilter.toLowerCase()
        );
    }

    res.json({
        success: true,
        message: 'API Health - List of available endpoints based on your permissions',
        user: {
            id: req.user._id,
            name: req.user.name,
            role: req.user.role,
            permissions: userPermissions
        },
        endpoints,
        totalEndpoints: endpoints.reduce((acc, cat) => acc + cat.routes.length, 0)
    });
});

module.exports = router;
