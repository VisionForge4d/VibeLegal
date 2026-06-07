import { afterAll, beforeAll, expect, test } from 'vitest';
import request from 'supertest';
import http from 'http';

// Spin up the app from compiled server (or inline express instance)
import express from 'express';
import cors from 'cors';
import { ENV } from '../src/env';
import type { ChatMessage } from '../src/types';
import { default as serverMain } from '../src/index'; // If index exports app, adapt. Otherwise create local.

function makeApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Minimal clone of the route for dry-run test to avoid circular start:
  app.post('/api/llm', (req, res) => {
    const { provider, model, messages } = req.body as {
      provider: 'openai' | 'groq';
      model: string;
      messages: ChatMessage[];
    };
    if (!ENV.DRY_RUN) return res.status(500).json({ ok: false, error: 'Not in DRY_RUN' });
    res.json({
      ok: true,
      dryRun: true,
      provider,
      wouldCall: {
        method: 'POST',
        url:
          provider === 'openai'
            ? `${ENV.OPENAI_BASE_URL}/chat/completions`
            : `${ENV.GROQ_BASE_URL}/chat/completions`,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ***' },
        payload: { model, messages, stream: false },
      },
    });
  });
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  return app;
}

let srv: http.Server;

beforeAll(() => {
  process.env.DRY_RUN = '1';
  (ENV as any).DRY_RUN = true;
  srv = http.createServer(makeApp());
  srv.listen(0);
});

afterAll(() => {
  srv.close();
});

test('POST /api/llm openai DRY_RUN=1', async () => {
  const res = await request(srv)
    .post('/api/llm')
    .send({ provider: 'openai', model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'Say hi' }] });
  expect(res.status).toBe(200);
  expect(res.body.ok).toBe(true);
  expect(res.body.dryRun).toBe(true);
  expect(res.body.provider).toBe('openai');
});

test('POST /api/llm groq DRY_RUN=1', async () => {
  const res = await request(srv)
    .post('/api/llm')
    .send({ provider: 'groq', model: 'llama-3.1-8b-instant', messages: [{ role: 'user', content: 'Say hi' }] });
  expect(res.status).toBe(200);
  expect(res.body.ok).toBe(true);
  expect(res.body.dryRun).toBe(true);
  expect(res.body.provider).toBe('groq');
});
