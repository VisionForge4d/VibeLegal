import { request } from 'undici';
import type { ChatMessage, ProviderResponse } from '../types';
import { ENV } from '../env';

type LMStudioChatReq = {
  model: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  temperature?: number;
  max_tokens?: number;
  stream?: false;
};

type LMStudioChatRes = {
  choices: { message: { role: string; content: string } }[];
};

function redactAuth(h: Record<string, string>) {
  const out = { ...h };
  if ((out as any).Authorization) (out as any).Authorization = 'Bearer ***';
  return out;
}

export async function callLMStudio(
  model: string,
  messages: ChatMessage[],
  signal: AbortSignal
): Promise<ProviderResponse> {
  const url = `${ENV.LMSTUDIO_BASE_URL}/chat/completions`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (ENV.LMSTUDIO_API_KEY) {
    headers['Authorization'] = `Bearer ${ENV.LMSTUDIO_API_KEY}`;
  }

  const payload: LMStudioChatReq = {
    model,
    messages: messages.map(m => ({ role: m.role as any, content: m.content })),
    stream: false,
  };

  if (ENV.DRY_RUN) {
    return {
      provider: 'lmstudio',
      latency_ms: 0,
      text: '[DRY_RUN] Validation only — no upstream call.',
      debug: { url, method: 'POST', headers: redactAuth(headers), payload },
    };
  }

  const res = await request(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal,
  });

  if (res.statusCode < 200 || res.statusCode >= 300) {
    const body = await res.body.text();
    throw new Error(`LM Studio error ${res.statusCode}: ${body}`);
  }

  const data = (await res.body.json()) as LMStudioChatRes;
  const text = data.choices?.[0]?.message?.content ?? '';

  return {
    provider: 'lmstudio',
    text,
    latency_ms: 0,
  };
}
