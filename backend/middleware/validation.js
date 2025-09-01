const Joi = require('joi');

// Simplified validation schemas
const schemas = {
  user: Joi.object({
    name: Joi.string().min(2).max(50).when('$isUpdate', { is: true, then: Joi.optional(), otherwise: Joi.required() }),
    email: Joi.string().email().when('$isUpdate', { is: true, then: Joi.optional(), otherwise: Joi.required() }),
    password: Joi.string().min(6).when('$isUpdate', { is: true, then: Joi.optional(), otherwise: Joi.required() }),
    role: Joi.string().valid('admin', 'contributor', 'viewer').optional(),
    isActive: Joi.boolean().optional(),
    preferences: Joi.object({
      theme: Joi.string().valid('light', 'dark').optional(),
      notifications: Joi.boolean().optional()
    }).optional(),
    profileImage: Joi.string().allow(null, '').optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  apiKey: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    permissions: Joi.array().items(Joi.string().valid('read', 'write', 'delete', 'admin')).optional(),
    expiresAt: Joi.date().greater('now').optional()
  }),

  request: Joi.object({
    type: Joi.string().valid('api_key', 'file_publish', 'role_upgrade', 'feature_access').required(),
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(10).max(500).required(),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
    metadata: Joi.object().optional(),
    status: Joi.string().valid('approved', 'denied').optional(),
    reviewComment: Joi.string().max(300).optional()
  }),

  file: Joi.object({
    description: Joi.string().max(200).optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    isPublic: Joi.boolean().optional()
  })
};

// Enhanced validation middleware with better error handling
const validate = (schemaName, options = {}) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({ message: 'Invalid validation schema' });
    }

    const { error } = schema.validate(req.body, { context: options });

    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    next();
  };
};

module.exports = { validate, schemas };
