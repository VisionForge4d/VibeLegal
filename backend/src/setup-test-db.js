const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables from .env.test
dotenv.config({ path: '.env.test' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createTables = async () => {
  const client = await pool.connect();
  try {
    // Drop existing tables to ensure a clean slate
    await client.query('DROP TABLE IF EXISTS contracts;');
    await client.query('DROP TABLE IF EXISTS users CASCADE;');

    // Create the users table
    await client.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        subscription_tier VARCHAR(50) DEFAULT 'basic',
        contracts_used_this_month INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create the contracts table
    await client.query(`
      CREATE TABLE contracts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        contract_type VARCHAR(100),
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Test database tables created successfully.');
  } catch (err) {
    console.error('Error creating test database tables:', err);
  } finally {
    client.release();
    pool.end();
  }
};

createTables();