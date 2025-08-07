const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg'); // Import the pg Pool

// Load environment variables from .env file
dotenv.config();

// --- Database Configuration ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL configuration for production environments like Heroku
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// --- Test Database Connection ---
async function testDbConnection() {
  try {
    await pool.query('SELECT NOW()');
    console.log('🐘 Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.stack);
    process.exit(1); // Exit if we can't connect to the database
  }
}
testDbConnection();


const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


// --- Server Startup ---
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`✅ Server is running on port ${PORT}`);
    });
}

// Export the app and pool for testing
module.exports = { app, pool };