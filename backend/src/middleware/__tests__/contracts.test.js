const request = require('supertest');
const app = require('../../app'); // two levels up from __tests__

describe('GET /api/contracts', () => {
  it('should return 401 if not authenticated', async () => {
    const res = await request(app).get('/api/contracts/1');
    expect(res.statusCode).toBe(401);
  });
});
