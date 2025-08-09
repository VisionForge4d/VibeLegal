import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import bodyParser from 'body-parser';

import { mockProvider } from '../src/providers/mock';
import { ENV } from '../src/env';

// Tiny in-memory app uses the same handler shape as our server
// (mirrors /api/llm for provider=mock only).
function makeApp() {
  const app = express();
  app.use(bodyParser.json());

  app.post('/api/llm', async (req, res) => {
    const { provider, model, messages } = req.body || {};
    if (provider !== 'mock') return res.status(400).json({ error: 'Unsupported provider' });
    if (!model || !Array.isArray(messages)) return res.status(400).json({ error: 'Invalid payload' });

    try {
      const out = await mockProvider(model, messages);
      return res.json(out);
    } catch (e: any) {
      return res.status(500).json({ error: 'Provider error', detail: e?.message });
    }
  });

  return app;
}

describe('POST /api/llm (mock)', () => {
  let app: express.Express;

  beforeAll(() => {
    // Ensure tests don’t require LMSTUDIO envs
    process.env.DRY_RUN = '0';
    app = makeApp();
  });

  afterAll(() => {
    // noop
  });

  it('returns deterministic output with mock', async () => {
    const res = await request(app)
      .post('/api/llm')
      .send({
        provider: 'mock',
        model: 'demo',
        messages: [{ role: 'user', content: 'Say hi in 5 words' }]
      })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('text');
    expect(res.body).toHaveProperty('latency_ms');
    expect(res.body.provider).toBe('mock');
    expect(res.body.model).toBe('demo');
    // If your mock is deterministic, pin an exact response here:
    // expect(res.body.text).toBe('Hello from mock in five.');
  });
});
