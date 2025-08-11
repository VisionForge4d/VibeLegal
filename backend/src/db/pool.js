// src/db/pool.js
const { Pool } = require('pg');

const cfg = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
    }
  : {
      host: process.env.PGHOST,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
    };

const pool = new Pool(cfg);

pool.on('error', (err) => console.error('[pg] idle client error', err));

async function checkDb() {
  const r = await pool.query('SELECT 1 AS ok');
  return r.rows[0]?.ok === 1;
}

module.exports = { pool, checkDb };
