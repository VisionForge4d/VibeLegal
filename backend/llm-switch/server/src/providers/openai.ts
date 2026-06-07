import { request } from 'undici';
import type { ChatMessage, ProviderResponse } from '../types';
import { ENV } from '../env';

type OpenAIChatReq = {
  model: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  temperature?: number;
  max_tokens?: number;
  stream?: false;
};

type OpenAIChatRes = {
  choices: { message: { role: string; content: string } }[];
};

function redactAuth(h: Record<string, string>) {
  const out = { ...h };
  if (out.Authorization) out.Authorization = 'Bearer ***';
  return out;
}

export async function callOpenAI(
  model: string,
  messages: ChatMessage[],
  signal: AbortSignal
): Promise<ProviderResponse> {
  const url = `${ENV.OPENAI_BASE_URL}/chat/completions`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ENV.OPENAI_API_KEY || ''}`,
  };

  const payload: OpenAIChatReq = {
    model,
    messages: messages.map(m => ({ role: m.role as any, content: m.content })),
    stream: false,
  };

  if (ENV.DRY_RUN) {
    return {
      provider: 'openai',
      latency_ms: 0,
      text: '[DRY_RUN] Validation only — no upstream call.',
      debug: { url, method: 'POST', headers: redactAuth(headers), payload },
    };
  }

  if (!ENV.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required when DRY_RUN=0.');
  }

  const res = await request(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal,
  });

  if (res.statusCode < 200 || res.statusCode >= 300) {
    const body = await res.body.text();
    throw new Error(`OpenAI error ${res.statusCode}: ${body}`);
  }

  const data = (await res.body.json()) as OpenAIChatRes;
  const text = data.choices?.[0]?.message?.content ?? '';

  return {
    provider: 'openai',
    text,
    latency_ms: 0, // (optional) you can wire timing later
  };
}
