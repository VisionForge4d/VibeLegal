jest.setTimeout(10000); // ✅ Set global timeout for this file

const request = require('supertest');
const app = require('../../app');
const { Pool } = require('pg');

// ✅ Direct test DB connection
const DATABASE_URL = 'postgres://postgres:DemoPassword123@localhost:5432/vibelegal';

const testEmail = `test_${Date.now()}@example.com`;
let pool;

beforeAll(async () => {
  pool = new Pool({ connectionString: DATABASE_URL });

  // Confirm DB connection works — catch any login issues early
  await pool.query('SELECT NOW()');
});

afterAll(async () => {
  try {
    await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
    await pool.end();
  } catch (err) {
    console.error('DB cleanup error:', err);
  }
});

describe('POST /api/register', () => {
  it('should register a new user and return a token + user object', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ email: testEmail, password: 'securePassword123' });

    console.log('📦 Response:', res.statusCode, res.body); // 🔍 Debug

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', testEmail);
  });
});
