const rateLimitStore = {};
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15; // Allow 15 requests per minute per IP

/**
 * A simple in-memory rate limiting middleware.
 * NOTE: In a production environment with multiple server instances,
 * a more robust solution like Redis would be necessary to share the rate limit state.
 */
const rateLimitMiddleware = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();

  const userEntry = rateLimitStore[ip];

  if (!userEntry || now > userEntry.resetTime) {
    // If no entry exists or the window has reset, create a new entry.
    rateLimitStore[ip] = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    };
  } else {
    // Increment the request count for the current window.
    rateLimitStore[ip].count++;
  }

  // Check if the request count exceeds the maximum allowed.
  if (rateLimitStore[ip].count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  next();
};

// This line exports the function so other files can import it.
// We also export the store itself FOR TESTING PURPOSES ONLY.
module.exports = { rateLimitMiddleware, rateLimitStore };
