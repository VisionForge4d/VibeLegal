// ---------------------- server.js (drop-in) ----------------------
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const prom = require('prom-client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const morgan = require('morgan');
const { randomUUID } = require('crypto');

// Boot banner + safe env import
console.log("BOOT server.js", { node: process.version, pid: process.pid });
let env;
try { env = require('./config/env'); } catch (e) { console.warn("WARN: config/env not loaded:", e?.message); }

// External deps
const { authenticateToken } = require('./middleware/authenticateToken.js');
const { composeContract } = require('./engine/composer.js');
const aiInterpreter = require('./src/ai-interpreter.js');

// DB pool (single source of truth)
const { pool } = require('./src/db/pool');

const app = express();
const PORT = process.env.PORT || 5000;

/* ------------------------- Tiny error toolkit ------------------------- */
class AppError extends Error {
  constructor(code, message, status = 500, details) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
const http = {
  badRequest:   (m='Bad request', d)=> new AppError('BAD_REQUEST', m, 400, d),
  unauthorized: (m='Unauthorized', d)=> new AppError('UNAUTHORIZED', m, 401, d),
  forbidden:    (m='Forbidden', d)=> new AppError('FORBIDDEN', m, 403, d),
  notFound:     (m='Not found', d)=> new AppError('NOT_FOUND', m, 404, d),
  conflict:     (m='Conflict', d)=> new AppError('CONFLICT', m, 409, d),
  serverError:  (m='Internal error', d)=> new AppError('INTERNAL_ERROR', m, 500, d),
};
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* --------------------------- Core middleware -------------------------- */
// Request ID (no external package)
app.use((req, res, next) => {
  const rid = (req.headers['x-request-id'] && String(req.headers['x-request-id'])) || randomUUID();
  req.id = rid;
  res.setHeader('X-Request-Id', rid);
  next();
});

app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

/* -------------------------- Prometheus metrics ------------------------ */
const register = new prom.Registry();
prom.collectDefaultMetrics({ register });

const httpRequestDuration = new prom.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration (s)',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});
const httpRequestsTotal = new prom.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);

// DB query latency histogram
const dbQueryDuration = new prom.Histogram({
  name: 'db_query_duration_seconds',
  help: 'DB query duration (s)',
  labelNames: ['operation'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2],
});
register.registerMetric(dbQueryDuration);

// helper to time queries
async function timedQuery(sql, params, operation = 'generic') {
  const end = dbQueryDuration.startTimer({ operation });
  try { return await pool.query(sql, params); } finally { end(); }
}

// request timing middleware
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer({ method: req.method });
  res.on('finish', () => {
    const route = req.route?.path || req.baseUrl || req.path || 'unmatched';
    const labels = { method: req.method, route, status_code: String(res.statusCode) };
    end(labels);
    httpRequestsTotal.inc(labels);
  });
  next();
});

// PG pool gauges
const pgPoolTotal = new prom.Gauge({ name: 'pg_pool_clients_total', help: 'Total clients in pool' });
const pgPoolIdle  = new prom.Gauge({ name: 'pg_pool_clients_idle',  help: 'Idle clients in pool' });
const pgPoolWait  = new prom.Gauge({ name: 'pg_pool_waiting_count', help: 'Callers waiting for a client' });
register.registerMetric(pgPoolTotal);
register.registerMetric(pgPoolIdle);
register.registerMetric(pgPoolWait);
setInterval(() => {
  pgPoolTotal.set(pool.totalCount || 0);
  pgPoolIdle.set(pool.idleCount || 0);
  pgPoolWait.set(pool.waitingCount || 0);
}, 5000).unref();

/* -------------------------------- Routes ------------------------------ */
// Smoke tests
app.get('/api/ping', (req, res) => res.json({ ok: true, requestId: req.id }));

app.get('/api/explode', asyncHandler(async (_req, _res) => {
  throw http.notFound('Demo: thing not found');
}));

// AI Interpreter
app.use('/api/ai', authenticateToken, aiInterpreter);

// Metrics (Prometheus)
app.get('/api/metrics', asyncHandler(async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}));

// Health
app.get('/api/health', asyncHandler(async (req, res) => {
  const r = await timedQuery('SELECT 1 AS ok', [], 'health_check');
  const dbOk = r.rows?.[0]?.ok === 1;
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'ok' : 'degraded',
    db: dbOk ? 'up' : 'down',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
}));

// Auth: register
app.post('/api/register', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw http.badRequest('Email and password are required');

  const existingUser = await timedQuery('SELECT 1 FROM users WHERE email = $1', [email], 'register_user_exists');
  if (existingUser.rowCount > 0) throw http.conflict('User already exists');

  const hash = await bcrypt.hash(password, 10);
  const result = await timedQuery(
    `INSERT INTO users (email, password_hash, subscription_tier, contracts_used_this_month)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, subscription_tier`,
    [email, hash, 'basic', 0],
    'register_insert_user'
  );

  const user = result.rows[0];
  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

  res.status(201).json({
    message: 'User created successfully',
    token,
    user: { id: user.id, email: user.email, subscription_tier: user.subscription_tier },
    requestId: req.id,
  });
}));

// Auth: login
app.post('/api/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw http.badRequest('Email and password are required');

  const result = await timedQuery('SELECT * FROM users WHERE email = $1', [email], 'login_user_lookup');
  if (result.rowCount === 0) throw http.unauthorized('Invalid credentials');

  const user = result.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw http.unauthorized('Invalid credentials');

  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      subscription_tier: user.subscription_tier,
      contracts_used_this_month: user.contracts_used_this_month
    },
    requestId: req.id,
  });
}));

// Generate contract
app.post('/api/generate-contract', authenticateToken, asyncHandler(async (req, res) => {
  const userInput = req.body;
  if (!userInput || !userInput.parameters || !userInput.contractType) {
    throw http.badRequest('Invalid request payload. Missing parameters or contractType.');
  }
  const contractContent = await composeContract(userInput);
  res.status(200).json({
    message: 'Contract generated successfully.',
    contract: contractContent,
    savedContract: { content: contractContent, title: userInput.parameters.title || 'Untitled Contract' },
    requestId: req.id,
  });
}));

// List user contracts
app.get('/api/user-contracts', authenticateToken, asyncHandler(async (req, res) => {
  const result = await timedQuery(
    `SELECT id, title, contract_type, created_at
     FROM contracts
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [req.user.userId],
    'contracts_list_by_user'
  );
  res.json({ contracts: result.rows, requestId: req.id });
}));

// Save contract
app.post('/api/save-contract', authenticateToken, asyncHandler(async (req, res) => {
  const { title, contractType, content } = req.body;
  const { userId } = req.user;
  if (!title || !contractType || !content) throw http.badRequest('Missing required contract data.');
  const result = await timedQuery(
    `INSERT INTO contracts (user_id, title, contract_type, content)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, title, contractType, content],
    'contracts_insert'
  );
  await timedQuery(
    `UPDATE users
     SET contracts_used_this_month = contracts_used_this_month + 1
     WHERE id = $1`,
    [userId],
    'users_increment_contracts_used'
  );
  res.status(201).json({ message: 'Contract saved successfully!', savedContract: result.rows[0], requestId: req.id });
}));

/* ---------------------- JSON 404 + Error handler ---------------------- */
// 404 forwarder for unmatched routes → centralized handler
app.use((req, _res, next) => next(http.notFound('Route not found')));

// Centralized error handler — MUST have 4 args
app.use((err, req, res, _next) => {
  const rid = req.id;
  let status = 500, code = 'INTERNAL_ERROR', message = 'Something went wrong.', details;

  if (err instanceof AppError) { status = err.status; code = err.code; message = err.message; details = err.details; }
  else if (err && typeof err === 'object') {
    if (err.code === '23505') { status = 409; code = 'UNIQUE_VIOLATION'; message = 'Resource already exists.'; details = { constraint: err.constraint }; }
    if (err.name === 'JsonWebTokenError') { status = 401; code = 'INVALID_TOKEN'; message = 'Invalid authentication token.'; }
    if (err.name === 'TokenExpiredError') { status = 401; code = 'TOKEN_EXPIRED'; message = 'Authentication token expired.'; }
  }

  console.error(JSON.stringify({ level: 'error', requestId: rid, code, status, message, err: String(err) }));
  res.status(status).json({ requestId: rid, error: { code, message, ...(details ? { details } : {}) } });
});

/* --------------------------- Server startup --------------------------- */
const server = app.listen(PORT, () => {
  console.log(`✅ API listening on ${server.address().port}`);
});

// Export app for tests
module.exports = { app };

/* ---------------------- Crash guards / shutdown ----------------------- */
process.on('unhandledRejection', (r) => console.error('UNHANDLED_REJECTION', r));
process.on('uncaughtException',  (e) => { console.error('UNCAUGHT_EXCEPTION', e); process.exit(1); });

async function shutdown(code = 0) {
  try { await pool.end(); } finally { server.close(() => process.exit(code)); }
}
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
// ---------------------- end server.js ----------------------------------
