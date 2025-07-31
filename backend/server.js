const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Load Environment Variables ---
dotenv.config();

// --- Middleware Imports ---
const { authenticateToken } = require('./src/middleware/authenticateToken.js');
const { rateLimitMiddleware } = require('./src/middleware/rateLimit.js');

// --- Route Imports ---
// FIX: Added the .js extension to make the import path explicit.
const contractRoutes = require('./src/routes/contracts.js');

// --- App Initialization ---
const app = express();
const PORT = process.env.PORT || 5000;

// --- Database Connection Pool ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- Core Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
// This line mounts our contract router. The error was caused by it
// not being imported correctly.
app.use('/api', contractRoutes);


// --- Existing User Authentication Routes ---
// This logic remains in server.js as it was before.

// User registration
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, subscription_tier, contracts_used_this_month) VALUES ($1, $2, $3, $4) RETURNING id, email, subscription_tier',
      [email, hashedPassword, 'basic', 0]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

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

// User login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

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


// --- Existing Contract Management Routes ---
// These routes for getting and viewing saved contracts remain the same.

// Get user contracts
app.get('/api/user-contracts', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, contract_type, created_at FROM contracts WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json({ contracts: result.rows });
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({ error: 'Failed to retrieve contracts' });
  }
});

// Get specific contract
app.get('/api/contracts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM contracts WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    res.json({ contract: result.rows[0] });
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({ error: 'Failed to retrieve contract' });
  }
});


// --- Server Health Check & Final Setup ---

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
