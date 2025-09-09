// Centralized role-based permission definitions
const ROLE_PERMISSIONS = {
    admin: [
        'rv.requests.viewAll',
        'rv.requests.approve',
        'rv.requests.reject',
        'rv.files.upload',
        'rv.files.download',
        'rv.files.makePublic',
        'rv.apiKeys.create',
        'rv.apiKeys.view',
        'rv.apiKeys.manage',
        'rv.apiKeys.viewAll',
        'rv.apiKeys.deleteAll',
        'rv.users.manage',
    ],
    contributor: [
        'rv.files.upload',
        'rv.files.download',
        'rv.requests.create',
        'rv.requests.view',
        'rv.apiKeys.create',
        'rv.apiKeys.view',
        'rv.apiKeys.manage'
    ],
    viewer: [
        'rv.files.download',
        'rv.requests.create',
        'rv.requests.view',
    ]
};

// Get permissions for a specific role
const getPermissionsForRole = (role) => {
    return ROLE_PERMISSIONS[role] || [];
};

// Get all permissions across all roles
const getAllPermissions = () => {
    const allPermissions = new Set();
    Object.values(ROLE_PERMISSIONS).forEach(permissions => {
        permissions.forEach(permission => allPermissions.add(permission));
    });
    return Array.from(allPermissions);
};

// Get all role-permission mappings
const getAllRolePermissions = () => {
    return ROLE_PERMISSIONS;
};

// Check if a role has a specific permission
const roleHasPermission = (role, permission) => {
    return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

module.exports = {
    ROLE_PERMISSIONS,
    getPermissionsForRole,
    getAllPermissions,
    getAllRolePermissions,
    roleHasPermission
};
