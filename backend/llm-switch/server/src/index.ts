import express from 'express';
import cors from 'cors';
import { ENV, requireVarFor } from './env';
import type { ChatMessage, ProviderResponse } from './types';
import { callLMStudio } from './providers/lmstudio';
import { callOpenAI } from './providers/openai';
import { callGroq } from './providers/groq';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: { DRY_RUN: ENV.DRY_RUN, NODE_ENV: ENV.NODE_ENV } });
});

app.post('/api/llm', async (req, res) => {
  try {
    const { provider, model, messages } = req.body as {
      provider: 'mock' | 'lmstudio' | 'openai' | 'groq';
      model: string;
      messages: ChatMessage[];
    };

    if (!provider || !model || !Array.isArray(messages)) {
      return res.status(400).json({ ok: false, error: 'Invalid payload' });
    }

    // DRY_RUN short-circuit: return validation for any provider
    if (ENV.DRY_RUN) {
      const base = {
        mock: { url: '[mock]', headers: {} },
        lmstudio: { url: `${ENV.LMSTUDIO_BASE_URL}/chat/completions`, headers: { 'Content-Type': 'application/json' } },
        openai: { url: `${ENV.OPENAI_BASE_URL}/chat/completions`, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ***' } },
        groq: { url: `${ENV.GROQ_BASE_URL}/chat/completions`, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ***' } },
      }[provider];

      return res.json({
        ok: true,
        dryRun: true,
        provider,
        wouldCall: {
          method: 'POST',
          url: base.url,
          headers: base.headers,
          payload: {
            model,
            messages,
            stream: false,
          },
        },
      });
    }

    // Live mode: ensure env present for external providers
    if (provider === 'openai') requireVarFor('openai');
    if (provider === 'groq') requireVarFor('groq');

    const controller = new AbortController();
    const signal = controller.signal;

    let out: ProviderResponse;

    switch (provider) {
      case 'mock':
        out = { provider: 'mock', text: 'Hello from mock.', latency_ms: 0 };
        break;
      case 'lmstudio':
        out = await callLMStudio(model, messages, signal);
        break;
      case 'openai':
        out = await callOpenAI(model, messages, signal);
        break;
      case 'groq':
        out = await callGroq(model, messages, signal);
        break;
      default:
        return res.status(400).json({ ok: false, error: `Unknown provider ${provider}` });
    }

    res.json({ ok: true, ...out });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || 'Server error' });
  }
});

app.listen(ENV.PORT, () => {
  console.log(`Server listening on :${ENV.PORT} (DRY_RUN=${ENV.DRY_RUN ? 1 : 0})`);
});
