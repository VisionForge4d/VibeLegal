const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai'); // ✅ This replaces OpenAI / Groq setup

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// OpenAI (via Groq) Configuration
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});


// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting middleware
const rateLimit = {};
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

const rateLimitMiddleware = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  if (!rateLimit[ip]) {
    rateLimit[ip] = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
  } else if (now > rateLimit[ip].resetTime) {
    rateLimit[ip] = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
  } else {
    rateLimit[ip].count++;
  }
  
  if (rateLimit[ip].count > MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  
  next();
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// User registration
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
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
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

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

// Generate contract
app.post('/api/generate-contract', rateLimitMiddleware, authenticateToken, async (req, res) => {
  try {
    const { contractType, requirements, clientName, otherPartyName, jurisdiction } = req.body;
    
    if (!contractType || !requirements || !clientName || !otherPartyName || !jurisdiction) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check user's contract limit
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    const user = userResult.rows[0];
    
    if (user.subscription_tier === 'basic' && user.contracts_used_this_month >= 25) {
      return res.status(403).json({ error: 'Monthly contract limit reached. Please upgrade your subscription.' });
    }

    // Generate contract using OpenAI
    const prompt = `Generate a ${contractType} for ${jurisdiction} with the following requirements: ${requirements}. 

The contract should be between:
- Client: ${clientName}
- Other Party: ${otherPartyName}

Include standard legal language, proper formatting, and all necessary clauses. The contract should be comprehensive and professional.

IMPORTANT: Add a disclaimer at the end stating: "LEGAL DISCLAIMER: This document is generated by AI and should be reviewed by a qualified attorney before use. This does not constitute legal advice."

Format the contract with proper headings, numbered sections, and clear structure.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a legal document assistant that generates professional contracts. Always include proper legal disclaimers and formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const generatedContract = completion.choices[0].message.content;

    // Update user's contract count
    await pool.query(
      'UPDATE users SET contracts_used_this_month = contracts_used_this_month + 1 WHERE id = $1',
      [req.user.userId]
    );

    res.json({
      contract: generatedContract,
      contractType,
      clientName,
      otherPartyName,
      jurisdiction
    });
  } catch (error) {
    console.error('Contract generation error:', error);
    if (error.code === 'insufficient_quota') {
      res.status(503).json({ error: 'AI service temporarily unavailable. Please try again later.' });
    } else {
      res.status(500).json({ error: 'Failed to generate contract' });
    }
  }
});

// Save contract
app.post('/api/save-contract', authenticateToken, async (req, res) => {
  try {
    const { title, contractType, content } = req.body;
    
    if (!title || !contractType || !content) {
      return res.status(400).json({ error: 'Title, contract type, and content are required' });
    }

    const result = await pool.query(
      'INSERT INTO contracts (user_id, contract_type, content, title, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [req.user.userId, contractType, content, title]
    );

    res.status(201).json({
      message: 'Contract saved successfully',
      contract: result.rows[0]
    });
  } catch (error) {
    console.error('Save contract error:', error);
    res.status(500).json({ error: 'Failed to save contract' });
  }
});

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

