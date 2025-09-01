// Universal response handler to reduce code duplication
const handleAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = { success: true, message };
  if (data) {
    // Spread data properties at top level instead of nesting in 'data'
    Object.assign(response, data);
  }
  return res.status(statusCode).json(response);
};

const sendError = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const sendPaginated = (res, data, pagination, message = 'Success') => {
  return res.json({
    success: true,
    message,
    data,
    pagination
  });
};

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return sendError(res, 'Validation error', 400, err.errors);
  }

  if (err.name === 'CastError') {
    return sendError(res, 'Invalid ID format', 400);
  }

  if (err.code === 11000) {
    return sendError(res, 'Duplicate entry', 409);
  }

  return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
};

module.exports = {
  handleAsync,
  sendSuccess,
  sendError,
  sendPaginated,
  errorHandler
};
