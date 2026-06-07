// server.js
// Load environment variables and validate using Joi schema
const dotenv = require('dotenv');
dotenv.config();

// Load and validate environment configuration (exits on validation failure)
const env = require('./config/env');

// Warn about optional Stripe variables if not present
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  Optional variable STRIPE_SECRET_KEY not set - Payment processing will be disabled');
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn('⚠️  Optional variable STRIPE_WEBHOOK_SECRET not set - Webhook signature verification will be disabled');
}

console.log('✅ Environment validation passed');

const express = require('express');
const cors = require('cors');
const prom = require('prom-client');
const bcrypt = require('bcryptjs');
const fetch = require("node-fetch");
const jwt = require('jsonwebtoken');

const { errorHandler, AppError, asyncHandler } = require('./middleware/errorHandler.js');
const { authenticateToken } = require('./middleware/authenticateToken.js');
const helmet = require('helmet');
const morgan = require('morgan');
const { composeContract } = require('./engine/composer.js');
const { composeContractEnhanced } = require('./engine/composer_enhanced.js');
const { router: aiInterpreter, interpretWithAI } = require('./src/ai-interpreter.js');

// DB pool (single source of truth)
const { pool, checkDb } = require('./src/db/pool');
const { getTierLimits } = require('./src/subscription-limits');

const app = express();
const PORT = process.env.PORT || 5000;
const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173'];
const allowList = configuredOrigins.length > 0 ? configuredOrigins : defaultOrigins;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowList.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`Rejected CORS origin: ${origin}`);
    return callback(null, false);
  },
  credentials: configuredOrigins.length > 0
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('combined'));

const jsonParser = express.json();
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/user/webhook/stripe')) {
    return next();
  }
  return jsonParser(req, res, next);
});

// --- AI Interpreter ---
app.use('/api/ai', authenticateToken, aiInterpreter);

// --- Subscription Service ---
const subscriptionService = require('./src/subscription-service.js');
app.use('/api/user', subscriptionService);

// --- Admin Service ---
const adminService = require('./src/admin-service.js');
app.use('/api/admin', adminService);

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

async function timedClientQuery(client, sql, params, operation = 'generic') {
  const end = dbQueryDuration.startTimer({ operation });
  try {
    return await client.query(sql, params);
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
app.get('/api/health', asyncHandler(async (_req, res) => {
  const r = await timedQuery('SELECT 1 AS ok', [], 'health_check');
  const dbOk = r.rows?.[0]?.ok === 1;
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'ok' : 'degraded',
    db: dbOk ? 'up' : 'down',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}));

// Metrics (Prometheus)
app.get('/api/metrics', asyncHandler(async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}));

// Password validation helper
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  if (password.length < minLength) errors.push('Password must be at least 8 characters');
  if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
  if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
  if (!hasNumber) errors.push('Password must contain at least one number');
  if (!hasSpecialChar) errors.push('Password must contain at least one special character (!@#$%^&*...)');

  return { valid: errors.length === 0, errors };
}

// Auth: register
app.post('/api/register', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({
      error: 'Password does not meet requirements',
      requirements: passwordValidation.errors
    });
  }

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
}));

// Auth: login
app.post('/api/login', asyncHandler(async (req, res) => {
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
      contracts_used_this_month: user.contracts_used_this_month,
      is_admin: user.is_admin || false
    }
  });
}));

// Generate contract
app.post('/api/generate-contract', authenticateToken, asyncHandler(async (req, res) => {
  const userInput = req.body;
  if (!userInput || !userInput.parameters || !userInput.contractType) {
    return res.status(400).json({ error: 'Invalid request payload. Missing parameters or contractType.' });
  }

  // First, analyze requirements with AI
  const aiUserInput = userInput.requirements || `Generate employment contract for ${userInput.parameters["Employee Name"] || "employee"} at ${userInput.parameters["Company Name"] || "company"}`;

  let aiResult = null;
  try {
    aiResult = await interpretWithAI(aiUserInput, {}, "gemini-2.5-pro", req.user.userId);
  } catch (aiError) {
    console.log("AI analysis failed, using standard generation:", aiError.message);
  }

  const enhancedUserInput = {
    ...userInput,
    aiSpec: aiResult?.success ? aiResult.contractSpec : null
  };

  const contractContent = await composeContract(enhancedUserInput);
  res.status(200).json({
    message: "Contract generated with AI analysis.",
    contract: contractContent,
    aiAnalysis: aiResult?.success ? aiResult.contractSpec : "AI analysis unavailable",
    savedContract: { content: contractContent, title: userInput.parameters.title || "AI-Enhanced Contract" }
  });
}));

// Enhanced contract generation endpoint
app.post('/api/generate-contract-enhanced', authenticateToken, asyncHandler(async (req, res) => {
  const { userInput } = req.body;
  if (!userInput || !userInput.parameters || !userInput.contractType) {
    return res.status(400).json({ error: 'Invalid request payload.' });
  }

  // First, analyze requirements with AI
  const aiUserInput = userInput.requirements || `Generate employment contract for ${userInput.parameters["Employee Name"] || "employee"} at ${userInput.parameters["Company Name"] || "company"}`;

  let aiResult = null;
  try {
    aiResult = await interpretWithAI(aiUserInput, {}, "gemini-2.5-pro", req.user.userId);
  } catch (aiError) {
    console.log("AI analysis failed, using enhanced generation:", aiError.message);
  }

  const enhancedUserInput = {
    ...userInput,
    aiSpec: aiResult?.success ? aiResult.contractSpec : null
  };

  const contractContent = await composeContractEnhanced(enhancedUserInput);
  res.json({
    contract: contractContent.content,
    metadata: contractContent.metadata,
    aiAnalysis: aiResult?.success ? aiResult.contractSpec : "AI analysis unavailable",
    savedContract: {
      content: contractContent.content,
      title: userInput.parameters.title || "AI-Enhanced CA Employment Contract",
      version: "enhanced"
    }
  });
}));

// Feature flags endpoint
app.get('/api/features', authenticateToken, (req, res) => {
  res.json({
    enhanced_ca_employment: true,
    risk_assessment: true,
    clause_variations: true
  });
});

// Clause library endpoint for Enhanced mode
app.get('/api/clause-library', authenticateToken, asyncHandler(async (req, res) => {
  const fs = require('fs');
  const path = require('path');

  const clauseLibraryPath = path.join(__dirname, 'clause_library_enhanced.json');
  const clauseLibrary = JSON.parse(fs.readFileSync(clauseLibraryPath, 'utf8'));

  res.json(clauseLibrary);
}));

// Delete contract
app.delete('/api/contracts/:id', authenticateToken, asyncHandler(async (req, res) => {
  const contractId = req.params.id;
  const userId = req.user.userId;

  // Verify contract belongs to user before deleting
  const result = await pool.query(
    'DELETE FROM contracts WHERE id = $1 AND user_id = $2 RETURNING id',
    [contractId, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Contract not found or unauthorized' });
  }

  res.json({ message: 'Contract deleted successfully' });
}));

// List user contracts with accurate counts
app.get('/api/user-contracts', authenticateToken, asyncHandler(async (req, res) => {
  const [contractsResult, totalCountResult, monthlyCountResult] = await Promise.all([
    timedQuery(
      `SELECT id, title, contract_type, created_at
       FROM contracts
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.userId],
      'contracts_list_by_user'
    ),
    timedQuery(
      `SELECT COUNT(*) as total_count
       FROM contracts
       WHERE user_id = $1`,
      [req.user.userId],
      'contracts_total_count'
    ),
    timedQuery(
      `SELECT COUNT(*) as monthly_count
       FROM contracts
       WHERE user_id = $1 AND created_at >= date_trunc('month', CURRENT_DATE)`,
      [req.user.userId],
      'contracts_monthly_count'
    )
  ]);

  res.json({
    contracts: contractsResult.rows,
    totalCount: parseInt(totalCountResult.rows[0].total_count),
    monthlyCount: parseInt(monthlyCountResult.rows[0].monthly_count)
  });
}));

// Save contract
app.post('/api/save-contract', authenticateToken, asyncHandler(async (req, res) => {
  const { title, contractType, content } = req.body;
  const { userId } = req.user;

  if (!title || !contractType || !content) {
    return res.status(400).json({ error: 'Missing required contract data.' });
  }

  const client = await pool.connect();
  try {
    await timedClientQuery(client, 'BEGIN', [], 'contracts_begin');

    const userResult = await timedClientQuery(
      client,
      `SELECT id, subscription_tier, contracts_used_this_month
       FROM users
       WHERE id = $1
       FOR UPDATE`,
      [userId],
      'users_select_for_contract'
    );

    if (userResult.rows.length === 0) {
      await timedClientQuery(client, 'ROLLBACK', [], 'contracts_rollback_user_missing');
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = userResult.rows[0];
    const tier = user.subscription_tier || 'basic';
    const tierLimits = getTierLimits(tier);

    let monthlyCountResult = null;
    if (tierLimits.monthlyContracts !== -1) {
      monthlyCountResult = await timedClientQuery(
        client,
        `SELECT COUNT(*)::int AS monthly_count
         FROM contracts
         WHERE user_id = $1
           AND created_at >= date_trunc('month', CURRENT_DATE)`,
        [userId],
        'contracts_monthly_count_for_save'
      );

      const monthlyCount = monthlyCountResult.rows[0].monthly_count;
      if (monthlyCount >= tierLimits.monthlyContracts) {
        await timedClientQuery(client, 'ROLLBACK', [], 'contracts_rollback_quota');
        return res.status(403).json({
          error: 'Monthly contract limit reached for your plan.'
        });
      }
    }

    const insertResult = await timedClientQuery(
      client,
      `INSERT INTO contracts (user_id, title, contract_type, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, title, contractType, content],
      'contracts_insert'
    );

    const updatedMonthlyCount = monthlyCountResult
      ? monthlyCountResult.rows[0].monthly_count + 1
      : user.contracts_used_this_month + 1;

    await timedClientQuery(
      client,
      `UPDATE users
       SET contracts_used_this_month = $2, updated_at = NOW()
       WHERE id = $1`,
      [userId, updatedMonthlyCount],
      'users_increment_contracts_used'
    );

    await timedClientQuery(client, 'COMMIT', [], 'contracts_commit');

    res.status(201).json({ message: 'Contract saved successfully!', savedContract: insertResult.rows[0] });
  } catch (error) {
    try {
      await timedClientQuery(client, 'ROLLBACK', [], 'contracts_rollback_error');
    } catch (rollbackError) {
      console.error('Failed to rollback contract transaction:', rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}));

// Get individual contract by ID
app.get('/api/contracts/:id', authenticateToken, asyncHandler(async (req, res) => {
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
}));

app.use("*", (req, res) => {
  res.status(404).json({
    requestId: req.id || undefined,
    error: { code: "NOT_FOUND", message: `Cannot ${req.method} ${req.originalUrl}` }
  });
});// --- Error Handler (must be last) ---
app.use(errorHandler);
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
