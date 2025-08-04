const request = require('supertest');
const { app, pool } = require('../server');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.test') });

let server;

beforeAll(async () => {
    const schemaSql = await require('fs').promises.readFile(path.join(__dirname, '../database.sql'), 'utf-8');
    await pool.query(schemaSql);
    await new Promise(resolve => {
        server = app.listen(process.env.PORT || 5001, resolve);
    });
});

afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
    await pool.end();
});

describe('Auth Endpoints', () => {
    beforeEach(async () => {
        await pool.query('DELETE FROM users');
    });

    // --- Registration Tests ---
    it('should register a user successfully', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({
                email: 'register@example.com',
                password: 'password123',
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
    });

    it('should not register a user with a duplicate email', async () => {
        await request(app).post('/api/register').send({ email: 'duplicate@example.com', password: 'password123' });
        const res = await request(app)
            .post('/api/register')
            .send({
                email: 'duplicate@example.com',
                password: 'password456',
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBe('User already exists');
    });

    // --- Login Tests ---
    it('should log in an existing user successfully', async () => {
        await request(app).post('/api/register').send({ email: 'login@example.com', password: 'password123' });
        const res = await request(app)
            .post('/api/login')
            .send({
                email: 'login@example.com',
                password: 'password123',
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should not log in with an incorrect password', async () => {
        await request(app).post('/api/register').send({ email: 'badpass@example.com', password: 'password123' });
        const res = await request(app)
            .post('/api/login')
            .send({
                email: 'badpass@example.com',
                password: 'wrongpassword',
            });
        expect(res.statusCode).toEqual(401);
        expect(res.body.error).toBe('Invalid credentials');
    });

    it('should not log in a non-existent user', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                email: 'nosuchuser@example.com',
                password: 'password123',
            });
        expect(res.statusCode).toEqual(401);
        expect(res.body.error).toBe('Invalid credentials');
    });
});