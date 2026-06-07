import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { callOpenAI } from '../src/providers/openai';
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

describe('openai provider request', () => {
  beforeEach(() => {
    process.env.DRY_RUN = '0';
    (ENV as any).DRY_RUN = false;
    process.env.OPENAI_API_KEY = 'sk-test';
    (ENV as any).OPENAI_API_KEY = 'sk-test';
  });

  afterEach(() => {
    (undici as any).request = realRequest;
  });

  test('forms correct URL and headers', async () => {
    const spy = vi.spyOn(undici, 'request' as any).mockResolvedValue(mockResponse());

    await callOpenAI('gpt-4o-mini', [{ role: 'user', content: 'ping' } as any], new AbortController().signal);

    expect(spy).toHaveBeenCalledTimes(1);
    const [url, opts] = spy.mock.calls[0];
    expect(url).toContain('/chat/completions');
    expect(opts.method).toBe('POST');
    expect(opts.headers['Content-Type']).toBe('application/json');
    expect(opts.headers['Authorization']).toBe('Bearer sk-test');
    const body = JSON.parse(opts.body);
    expect(body.model).toBe('gpt-4o-mini');
    expect(Array.isArray(body.messages)).toBe(true);
  });
});
