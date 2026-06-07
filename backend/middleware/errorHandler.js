// JavaScript version of error handler
class AppError extends Error {
  constructor(code, message, status = 500, details) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

function errorHandler(err, req, res, next) {
  const requestId = req.id; // from express-request-id if available
  let status = 500;
  let code = "INTERNAL_ERROR";
  let message = "Something went wrong.";
  let details;

  if (err instanceof AppError) {
    status = err.status;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err && typeof err === "object") {
    // Basic pg & auth normalization
    if (err.code === "23505") { // Postgres unique_violation
      status = 409; 
      code = "UNIQUE_VIOLATION"; 
      message = "Resource already exists.";
      details = { constraint: err.constraint };
    }
    if (err.name === "JsonWebTokenError") {
      status = 401; 
      code = "INVALID_TOKEN"; 
      message = "Invalid authentication token.";
    }
    if (err.name === "TokenExpiredError") {
      status = 401; 
      code = "TOKEN_EXPIRED"; 
      message = "Authentication token expired.";
    }
  }

  console.error({ requestId, code, status, message, err });
  
  res.status(status).json({
    requestId,
    error: { code, message, ...(details ? { details } : {}) },
  });
}

module.exports = { errorHandler, AppError };

// Async wrapper to catch errors and pass to error handler
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorHandler, AppError, asyncHandler };
