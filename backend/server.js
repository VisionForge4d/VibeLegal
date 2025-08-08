
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('./middleware/authenticateToken.js');
const { composeContract } = require('./engine/composer.js');
const aiInterpreter = require('./src/ai-interpreter.js');

dotenv.config();

const pool = new Pool({
  user: 'zod',
  host: 'localhost',
  database: 'vibelegal',
  port: 5432,
  password: 'saddleup123',
  ssl: false
});

async function testDbConnection() {
  try {
    await pool.query('SELECT NOW()');
    console.log('🐘 Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.stack);
    process.exit(1);
  }
}
testDbConnection();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// AI Interpreter Routes
app.use('/api/ai', authenticateToken, aiInterpreter);
// --- ROUTES ---

app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

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
      user: { id: user.id, email: user.email, subscription_tier: user.subscription_tier, contracts_used_this_month: user.contracts_used_this_month }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/generate-contract', authenticateToken, async (req, res) => {
    const userInput = req.body;
    if (!userInput || !userInput.parameters || !userInput.contractType) {
        return res.status(400).json({ error: 'Invalid request payload. Missing parameters or contractType.' });
    }
    try {
        const contractContent = await composeContract(userInput);
        res.status(200).json({
            message: "Contract generated successfully.",
            contract: contractContent,
            savedContract: { content: contractContent, title: userInput.parameters.title || "Untitled Contract" }
        });
    } catch (error) {
        console.error('Contract generation failed:', error);
        res.status(500).json({ error: 'Failed to generate contract.' });
    }
});

app.get('/api/user-contracts', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, title, contract_type, created_at FROM contracts WHERE user_id = $1 ORDER BY created_at DESC', [req.user.userId]);
    res.json({ contracts: result.rows });
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({ error: 'Failed to retrieve contracts' });
  }
});

app.post('/api/save-contract', authenticateToken, async (req, res) => {
  try {
    const { title, contractType, content } = req.body;
    const { userId } = req.user;
    if (!title || !contractType || !content) {
        return res.status(400).json({ error: 'Missing required contract data.' });
    }
    const result = await pool.query(
      'INSERT INTO contracts (user_id, title, contract_type, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title, contractType, content]
    );
    await pool.query('UPDATE users SET contracts_used_this_month = contracts_used_this_month + 1 WHERE id = $1', [userId]);
    res.status(201).json({ message: 'Contract saved successfully!', savedContract: result.rows[0] });
  } catch (error) {
    console.error('Save contract error:', error);
    res.status(500).json({ error: 'Failed to save contract.' });
  }
});

// --- Server Startup ---
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`✅ Server is running on port ${PORT}`);
    });
}

module.exports = { app, pool };
<<<<<<< HEAD
=======
// Save contract endpoint
app.post('/api/save-contract', authenticateToken, async (req, res) => {
  try {
    const { title, content, contractType } = req.body;
    const result = await pool.query(
      'INSERT INTO contracts (user_id, title, content, contract_type) VALUES ($1, $2, $3, $4) RETURNING id',
      [req.user.userId, title, content, contractType]
    );
    res.json({ success: true, contractId: result.rows[0].id });
/ Save contract endpoint
app.post('/api/save-contract', 
authenticateToken, async (req, res) => {
  try {
    const { title, content, contractType } 
= req.body;
    const result = await pool.query(
      'INSERT INTO contracts (user_id, 
title, content, contract_type) VALUES ($1, 
$2, $3, $4) RETURNING id',
      [req.user.userId, title, content, 
contractType]
    );
    res.json({ success: true, contractId: 
result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: 'Failed 
to save contract' });
  }
});

module.exports = { app, pool };
  } catch 
(error) {
    res.status(500).json({ error: 'Failed to save contract' });
  }
});

>>>>>>> 05df584 (feat(ai): implement AI interpreter endpoint with Google Gemini 2.5-pro)
