import { AppError } from "../errors/AppError";

export const badRequest   = (msg = "Bad request",      d?: unknown) => new AppError("BAD_REQUEST", msg, 400, d);
export const unauthorized = (msg = "Unauthorized",     d?: unknown) => new AppError("UNAUTHORIZED", msg, 401, d);
export const forbidden    = (msg = "Forbidden",        d?: unknown) => new AppError("FORBIDDEN", msg, 403, d);
export const notFound     = (msg = "Not found",        d?: unknown) => new AppError("NOT_FOUND", msg, 404, d);
export const conflict     = (msg = "Conflict",         d?: unknown) => new AppError("CONFLICT", msg, 409, d);
export const teapot       = (msg = "I'm a teapot",     d?: unknown) => new AppError("TEAPOT", msg, 418, d);
export const serverError  = (msg = "Internal error",   d?: unknown) => new AppError("INTERNAL_ERROR", msg, 500, d);
