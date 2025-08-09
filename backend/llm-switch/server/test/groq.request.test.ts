import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { callGroq } from '../src/providers/groq';
import * as undici from 'undici';
import { ENV } from '../src/env';

const realRequest = undici.request;

function mockResponse(status = 200, body: any = { choices: [{ message: { content: 'ok' } }] }) {
  return {
    statusCode: status,
    body: {
      json: async () => body,
      text: async () => JSON.stringify(body),
    },
  } as any;
}

describe('groq provider request', () => {
  beforeEach(() => {
    process.env.DRY_RUN = '0';
    (ENV as any).DRY_RUN = false;
    process.env.GROQ_API_KEY = 'gk-test';
    (ENV as any).GROQ_API_KEY = 'gk-test';
  });

  afterEach(() => {
    (undici as any).request = realRequest;
  });

  test('forms correct URL and headers', async () => {
    const spy = vi.spyOn(undici, 'request' as any).mockResolvedValue(mockResponse());

    await callGroq('llama-3.1-8b-instant', [{ role: 'user', content: 'ping' } as any], new AbortController().signal);

    expect(spy).toHaveBeenCalledTimes(1);
    const [url, opts] = spy.mock.calls[0];
    expect(url).toContain('/chat/completions');
    expect(opts.method).toBe('POST');
    expect(opts.headers['Content-Type']).toBe('application/json');
    expect(opts.headers['Authorization']).toBe('Bearer gk-test');
    const body = JSON.parse(opts.body);
    expect(body.model).toBe('llama-3.1-8b-instant');
    expect(Array.isArray(body.messages)).toBe(true);
  });
});
