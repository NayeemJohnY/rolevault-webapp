// API Health Endpoint: Returns all backend API routes and supported HTTP methods
const express = require('express');
const router = express.Router();
const { adminOrContributor, authenticate } = require('../middleware/auth');


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
                roles: [],
            },
            {
                path: '/api/auth/login',
                methods: ['POST'],
                description: 'Login and receive JWT token',
                authRequired: false,
                roles: [],
            },
            {
                path: '/api/auth/me',
                methods: ['GET', 'PUT'],
                description: 'Get or update current user profile',
                authRequired: true,
                roles: ['admin', 'contributor', 'viewer'],
            },
        ],
    },
    {
        category: 'Users',
        routes: [
            {
                path: '/api/users',
                methods: ['GET', 'POST'],
                description: 'List all users or create a new user (admin only)',
                authRequired: true,
                roles: ['admin'],
            },
            {
                path: '/api/users/:id',
                methods: ['GET', 'PUT', 'DELETE'],
                description: 'Get, update, or delete a user by ID (admin only)',
                authRequired: true,
                roles: ['admin'],
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
                roles: ['admin', 'contributor'],
            },
            {
                path: '/api/apikeys/:id',
                methods: ['DELETE'],
                description: 'Delete an API key',
                authRequired: true,
                roles: ['admin', 'contributor'],
            },
        ],
    },
    {
        category: 'Requests',
        routes: [
            {
                path: '/api/requests',
                methods: ['GET', 'POST'],
                description: 'List or submit requests',
                authRequired: true,
                roles: ['admin', 'contributor', 'viewer'],
            },
            {
                path: '/api/requests/:id/review',
                methods: ['PUT'],
                description: 'Review a request (admin only)',
                authRequired: true,
                roles: ['admin'],
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
                roles: ['admin', 'contributor'],
            },
            {
                path: '/api/files',
                methods: ['GET'],
                description: 'List files',
                authRequired: true,
                roles: ['admin', 'contributor', 'viewer'],
            },
            {
                path: '/api/files/:id/download',
                methods: ['GET'],
                description: 'Download a file',
                authRequired: true,
                roles: ['admin', 'contributor', 'viewer'],
            },
        ],
    },
    {
        category: 'Dashboard',
        routes: [
            {
                path: '/api/dashboard/stats',
                methods: ['GET'],
                description: 'Get dashboard statistics',
                authRequired: true,
                roles: ['admin', 'contributor', 'viewer'],
            },
        ],
    },
];


// Helper: filter endpoints by role
function filterEndpointsByRole(endpoints, role) {
    return endpoints.map(category => ({
        category: category.category,
        routes: category.routes.filter(route => !route.roles.length || route.roles.includes(role)),
    })).filter(cat => cat.routes.length > 0);
}

// GET /api/health (authenticated) - only admin or contributor
router.get('/api/health', adminOrContributor, (req, res) => {
    // Use the authenticated user's role for filtering
    const role = req.user?.role || 'viewer';
    const categoryFilter = req.query.category;
    let endpoints = filterEndpointsByRole(apiEndpoints, role);
    if (categoryFilter) {
        endpoints = endpoints.filter(cat => cat.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    res.json({
        success: true,
        message: 'API Health - List of all endpoints',
        endpoints,
    });
});

module.exports = router;
