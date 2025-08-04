const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();
console.log('📦 Loaded DATABASE_URL:', process.env.DATABASE_URL); // Debug
// --- Middleware
const { authenticateToken } = require('./middleware/authenticateToken.js');
const { rateLimitMiddleware } = require('./middleware/rateLimit.js');

// --- Routes
const contractRoutes = require('./routes/contracts.js');

// --- App Setup
const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors());
app.use(express.json());
app.use('/api', contractRoutes(pool));

// --- Register Route ---
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, subscription_tier, contracts_used_this_month)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, subscription_tier`,
      [email, hashedPassword, 'basic', 0]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'User created successfully',
      token,
      user
    });

  } catch (error) {
    console.error('🔥 Error in /api/register:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Login Route ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
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
    console.error('🔥 Error in /api/login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Protected Routes ---
app.get('/api/user-contracts', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, contract_type, created_at FROM contracts WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    return res.json({ contracts: result.rows });
  } catch (error) {
    console.error('🔥 Error in /api/user-contracts:', error);
    return res.status(500).json({ error: 'Failed to retrieve contracts' });
  }
});

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
    return res.json({ contract: result.rows[0] });
  } catch (error) {
    console.error('🔥 Error in /api/contracts/:id:', error);
    return res.status(500).json({ error: 'Failed to retrieve contract' });
  }
});

app.post('/api/save-contract', authenticateToken, async (req, res) => {
  try {
    const { title, contractType, content } = req.body;
    const { userId } = req.user;

    if (!title || !contractType || !content) {
      return res.status(400).json({ error: 'Missing required contract data' });
    }

    const result = await pool.query(
      `INSERT INTO contracts (user_id, title, contract_type, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, created_at`,
      [userId, title, contractType, content]
    );

    const newContract = result.rows[0];

    return res.status(201).json({
      message: 'Contract saved successfully!',
      contract: newContract
    });

  } catch (error) {
    console.error('🔥 Error in /api/save-contract:', error);
    return res.status(500).json({ error: 'Failed to save the contract' });
  }
});

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error('🔥 Global Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
