export type Role = 'system' | 'user' | 'assistant';

export type ChatMessage = {
  role: Role;
  content: string;
};

export type ProviderResponse = {
  provider: 'mock' | 'lmstudio' | 'openai' | 'groq';
  text: string;
  latency_ms: number;
  debug?: unknown;
};
