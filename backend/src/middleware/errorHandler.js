class ApiError extends Error {
  constructor(statusCode, message, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'ERROR';
  }
}

function notFoundHandler(req, res) {
  res.status(404).json({ code: 'NOT_FOUND', message: `No route for ${req.method} ${req.path}` });
}

function errorHandler(err, req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ code: err.code, message: err.message });
  }

  if (err?.name === 'ZodError') {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: err.issues,
    });
  }

  console.error(err);
  return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Something went wrong' });
}

module.exports = { ApiError, notFoundHandler, errorHandler };
