import 'dotenv/config';

const required = ['PORT', 'DRY_RUN', 'LMSTUDIO_BASE_URL'] as const;
type Req = typeof required[number];

const vars = {
  PORT: process.env.PORT ?? '5000',
  DRY_RUN: process.env.DRY_RUN ?? '0',
  LMSTUDIO_BASE_URL: process.env.LMSTUDIO_BASE_URL ?? '',
  LMSTUDIO_API_KEY: process.env.LMSTUDIO_API_KEY ?? ''
};

const missing = required.filter((k) => !vars[k as Req]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 5000),

  // v0.1 carry-over
  LMSTUDIO_BASE_URL: process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234',
  LMSTUDIO_API_KEY: process.env.LMSTUDIO_API_KEY || '',

  // v0.2 new providers
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',

  GROQ_BASE_URL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',

  // DRY_RUN mode
  DRY_RUN: String(process.env.DRY_RUN || '1') === '1',
} as const;

// Optional: log a clean startup message
export function requireVarFor(provider: 'openai' | 'groq') {
  if (ENV.DRY_RUN) return; // validation-only mode
  if (provider === 'openai' && !ENV.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required when DRY_RUN=0.');
  }
  if (provider === 'groq' && !ENV.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is required when DRY_RUN=0.');
  }
}
