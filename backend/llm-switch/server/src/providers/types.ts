export type Role = 'system' | 'user' | 'assistant';

export type ChatMessage = {
  role: Role;
  content: string;
};

export type ProviderRequest = {
  provider: 'mock' | 'lmstudio';
  model: string;
  messages: ChatMessage[];
};

export type ProviderResponse = {
  text: string;
  latency_ms: number;
  provider: 'mock' | 'lmstudio';
  model: string;
};
