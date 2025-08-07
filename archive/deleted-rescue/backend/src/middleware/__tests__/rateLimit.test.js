const express = require('express');
const request = require('supertest');
// Import both the middleware and the store for testing.
const { rateLimitMiddleware, rateLimitStore } = require('../rateLimit.js');

// We create a minimal Express app to test the middleware in isolation.
const app = express();
app.use(rateLimitMiddleware);

// A simple route that the middleware will protect.
app.get('/test-route', (req, res) => {
  res.status(200).send({ message: 'Success' });
});

describe('Rate Limiting Middleware', () => {
  // Use fake timers to control time-based logic like the reset window.
  beforeEach(() => {
    jest.useFakeTimers();
    // CRITICAL FIX: Reset the rate limit store before each test.
    // This prevents state from leaking between tests.
    for (const key in rateLimitStore) {
      delete rateLimitStore[key];
    }
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should allow requests below the rate limit', async () => {
    // The first request should always be successful.
    const response = await request(app).get('/test-route');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Success');
  });

  it('should block requests that exceed the rate limit', async () => {
    // MAX_REQUESTS_PER_WINDOW is 15 in the middleware file.
    const MAX_REQUESTS = 15;

    // Send 15 successful requests.
    for (let i = 0; i < MAX_REQUESTS; i++) {
      await request(app).get('/test-route').expect(200);
    }

    // The 16th request should be blocked.
    const blockedResponse = await request(app).get('/test-route');
    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.body.error).toBe('Too many requests. Please try again later.');
  });

  it('should reset the rate limit after the window expires', async () => {
    const MAX_REQUESTS = 15;
    const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute, as defined in the middleware

    // Exceed the rate limit.
    for (let i = 0; i < MAX_REQUESTS; i++) {
      await request(app).get('/test-route').expect(200);
    }
    await request(app).get('/test-route').expect(429);

    // Advance time by the full window period + 1 second to ensure the window has expired.
    jest.advanceTimersByTime(RATE_LIMIT_WINDOW_MS + 1000);

    // The next request should be successful again.
    const responseAfterReset = await request(app).get('/test-route');
    expect(responseAfterReset.status).toBe(200);
    expect(responseAfterReset.body.message).toBe('Success');
  });
});
