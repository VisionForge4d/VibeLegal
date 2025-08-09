import { useState } from 'react';

type Provider = 'openai' | 'anthropic' | 'groq' | 'lmstudio' | 'mock';

export function useLLMSwitch(initial: { provider?: Provider; model?: string } = {}) {
  const [provider, setProvider] = useState<Provider>(initial.provider ?? 'mock');
  const [model, setModel] = useState<string>(initial.model ?? 'demo');
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string>('');

  async function chat(prompt: string) {
    setLoading(true);
    try {
      const r = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model,
          messages: [
            { role: 'system', content: 'You are a concise assistant.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 300
        })
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || 'LLM error');
      setText(json.text || '');
      return json;
    } finally {
      setLoading(false);
    }
  }

  return { provider, setProvider, model, setModel, loading, text, chat };
}
