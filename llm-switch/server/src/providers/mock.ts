import type { ChatMessage, ProviderResponse } from './types';

export async function mockProvider(model: string, messages: ChatMessage[]): Promise<ProviderResponse> {
  const start = Date.now();

  // trivial deterministic behavior: echo last user content length, capped
  const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';
  const fiveWords = (lastUser.match(/\b\w+\b/g) ?? []).slice(0, 5).join(' ');
  const text = fiveWords ? `[mock:${model}] ${fiveWords}` : `[mock:${model}] ok`;

  return {
    text,
    latency_ms: Date.now() - start,
    provider: 'mock',
    model
  };
}
