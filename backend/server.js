// server.js
// Load env FIRST so anything that reads process.env sees values
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const prom = require('prom-client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// If this module validates env on import, keep it; if it causes noise, comment it out.
const env = require('./config/env');

const { authenticateToken } = require('./middleware/authenticateToken.js');
const helmet = require('helmet');
const morgan = require('morgan');const { composeContract } = require('./engine/composer.js');
const aiInterpreter = require('./src/ai-interpreter.js');

// DB pool (single source of truth)
const { pool, checkDb } = require('./src/db/pool');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(morgan('combined'));app.use(express.json());

// --- AI Interpreter ---
app.use('/api/ai', authenticateToken, aiInterpreter);

// --- Prometheus metrics ---
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
  try {
    return await pool.query(sql, params);
  } finally {
    end();
  }
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

// --- ROUTES ---

// Health (checks DB)
// Health (checks DB + seeds db_query_duration_seconds)
app.get('/api/health', async (_req, res) => {
  try {
    const r = await timedQuery('SELECT 1 AS ok', [], 'health_check');
    const dbOk = r.rows?.[0]?.ok === 1;
    res.status(dbOk ? 200 : 503).json({
      status: dbOk ? 'ok' : 'degraded',
      db: dbOk ? 'up' : 'down',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    res.status(503).json({
      status: 'down',
      db: 'down',
      error: e.message,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }
});

// Metrics (Prometheus)
app.get('/api/metrics', async (_req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (e) {
    res.status(500).send(e.message);
  }
});

// Auth: register
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const existingUser = await timedQuery('SELECT 1 FROM users WHERE email = $1', [email], 'register_user_exists');
    if (existingUser.rowCount > 0) return res.status(400).json({ error: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    const result = await timedQuery(
      `INSERT INTO users (email, password_hash, subscription_tier, contracts_used_this_month)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, subscription_tier`,
      [email, hash, 'basic', 0],
      'register_insert_user'
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user.id, email: user.email, subscription_tier: user.subscription_tier }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Auth: login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const result = await timedQuery('SELECT * FROM users WHERE email = $1', [email], 'login_user_lookup');
    if (result.rowCount === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        subscription_tier: user.subscription_tier,
        contracts_used_this_month: user.contracts_used_this_month
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate contract
app.post('/api/generate-contract', authenticateToken, async (req, res) => {
  const userInput = req.body;
  if (!userInput || !userInput.parameters || !userInput.contractType) {
    return res.status(400).json({ error: 'Invalid request payload. Missing parameters or contractType.' });
  }
  try {
    const contractContent = await composeContract(userInput);
    res.status(200).json({
      message: 'Contract generated successfully.',
      contract: contractContent,
      savedContract: { content: contractContent, title: userInput.parameters.title || 'Untitled Contract' }
    });
  } catch (error) {
    console.error('Contract generation failed:', error);
    res.status(500).json({ error: 'Failed to generate contract.' });
  }
});

// List user contracts
app.get('/api/user-contracts', authenticateToken, async (req, res) => {
  try {
    const result = await timedQuery(
      `SELECT id, title, contract_type, created_at
       FROM contracts
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.userId],
      'contracts_list_by_user'
    );
    res.json({ contracts: result.rows });
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({ error: 'Failed to retrieve contracts' });
  }
});

// Save contract
app.post('/api/save-contract', authenticateToken, async (req, res) => {
  try {
    const { title, contractType, content } = req.body;
    const { userId } = req.user;
    if (!title || !contractType || !content) {
      return res.status(400).json({ error: 'Missing required contract data.' });
    }
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
    res.status(201).json({ message: 'Contract saved successfully!', savedContract: result.rows[0] });
  } catch (error) {
    console.error('Save contract error:', error);
    res.status(500).json({ error: 'Failed to save contract.' });
  }

});// Get individual contract by ID
app.get('/api/contracts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    
    const result = await timedQuery(
      `SELECT * FROM contracts WHERE id = $1 AND user_id = $2`,
      [id, userId],
      'contracts_get_by_id'
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found.' });
    }
    
    res.json({ contract: result.rows[0] });
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({ error: 'Failed to retrieve contract.' });
  }
});

// --- Server Startup (single listener) ---
const server = app.listen(PORT, () => {
  console.log(`✅ API listening on ${server.address().port}`);
});

// Export app for tests
module.exports = { app };

// Graceful shutdown
async function shutdown(code = 0) {
  try {
    await pool.end();
  } finally {
    server.close(() => process.exit(code));
  }
}
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
