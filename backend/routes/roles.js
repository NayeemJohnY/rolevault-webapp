const express = require('express');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { getPermissionsForRole, getAllRolePermissions } = require('../utils/rolePermissions');

const router = express.Router();

// Get permissions for a specific role
router.get('/permissions/:role', (req, res) => {
    const { role } = req.params;

    const permissions = getPermissionsForRole(role);

    if (permissions.length === 0 && !['admin', 'contributor', 'viewer'].includes(role)) {
        return sendError(res, 'Invalid role specified', 400);
    }

    sendSuccess(res, {
        role,
        permissions
    }, `Permissions for ${role} role retrieved successfully`);
});

// Get all roles and their permissions
router.get('/permissions', (req, res) => {
    const allRolePermissions = getAllRolePermissions();

    sendSuccess(res, allRolePermissions, 'All role permissions retrieved successfully');
});

module.exports = router;
