import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { Logger } from "../utils/logger"; // your winston instance

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = (req as any).id; // from express-request-id
  let status = 500;
  let code = "INTERNAL_ERROR";
  let message = "Something went wrong.";
  let details: unknown;

  if (err instanceof AppError) {
    status = err.status;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err && typeof err === "object") {
    // Basic pg & auth normalization examples
    const e = err as any;
    if (e.code === "23505") { // Postgres unique_violation
      status = 409; code = "UNIQUE_VIOLATION"; message = "Resource already exists.";
      details = { constraint: e.constraint };
    }
    if (e.name === "JsonWebTokenError") {
      status = 401; code = "INVALID_TOKEN"; message = "Invalid authentication token.";
    }
    if (e.name === "TokenExpiredError") {
      status = 401; code = "TOKEN_EXPIRED"; message = "Authentication token expired.";
    }
  }

  Logger.error({ requestId, code, status, message, err });

  res.status(status).json({
    requestId,
    error: { code, message, ...(details ? { details } : {}) },
  });
}
