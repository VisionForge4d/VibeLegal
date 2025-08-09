import React, { useState } from 'react';

export function LLMSwitchPanel() {
  const [provider, setProvider] = useState<'mock'|'lmstudio'|'openai'|'groq'>('mock');
  const [model, setModel] = useState('');
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    try {
      const res = await fetch('/api/llm', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          provider,
          model: model || 'gpt-4o-mini',
          messages: [{ role: 'user', content: input || 'Say hi in 5 words' }]
        })
      }).then(r=>r.json());
      setResponse(JSON.stringify(res, null, 2));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{padding:16, fontFamily:'system-ui, sans-serif'}}>
      <h1>LLM Switch</h1>
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:12 }}>
        <label>
          Provider:&nbsp;
          <select value={provider} onChange={e=>setProvider(e.target.value as any)}>
            <option value="mock">mock</option>
            <option value="lmstudio">lmstudio</option>
            <option value="openai">openai</option>
            <option value="groq">groq</option>
          </select>
        </label>
        <label>
          Model:&nbsp;
          <input value={model} onChange={e=>setModel(e.target.value)} placeholder="model id (manual)" />
        </label>
        <button onClick={send} disabled={loading}>{loading ? 'Sending…' : 'Send'}</button>
      </div>
      <textarea rows={5} style={{width:'100%'}} value={input} onChange={e=>setInput(e.target.value)} placeholder="Type your message…" />
      <pre style={{ whiteSpace:'pre-wrap', marginTop:12 }}>{response}</pre>
    </div>
  );
}
