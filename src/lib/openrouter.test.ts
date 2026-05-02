import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenRouterError, chatCompletion, chatCompletionWithBudget } from './openrouter';

function memKV() {
  const store = new Map<string, string>();
  return {
    get: async (k: string) => store.get(k) ?? null,
    put: async (k: string, v: string) => {
      store.set(k, v);
    },
    _store: store,
  };
}

function mockResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('chatCompletion', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('成功時に text/usage/cost を返す', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse({
        choices: [{ message: { content: 'hello' } }],
        usage: { prompt_tokens: 1_000_000, completion_tokens: 1_000_000, total_tokens: 2_000_000 },
        model: 'google/gemini-2.5-flash-lite',
      })
    );

    const r = await chatCompletion('key', {
      model: 'google/gemini-2.5-flash-lite',
      messages: [{ role: 'user', content: 'hi' }],
    });

    expect(r.text).toBe('hello');
    expect(r.usage.promptTokens).toBe(1_000_000);
    expect(r.costUsd).toBeCloseTo(0.1 + 0.4, 5);
  });

  it('未知モデルは costUsd=0', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse({
        choices: [{ message: { content: 'x' } }],
        usage: { prompt_tokens: 100, completion_tokens: 50 },
      })
    );

    const r = await chatCompletion('key', {
      model: 'unknown/model',
      messages: [{ role: 'user', content: 'hi' }],
    });

    expect(r.costUsd).toBe(0);
  });

  it('HTTPエラーは OpenRouterError', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse({ error: { message: 'rate limited' } }, 429)
    );

    await expect(
      chatCompletion('key', {
        model: 'google/gemini-2.5-flash-lite',
        messages: [{ role: 'user', content: 'hi' }],
      })
    ).rejects.toThrow(OpenRouterError);
  });

  it('referer/titleはヘッダに乗る', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue(
      mockResponse({
        choices: [{ message: { content: '' } }],
        usage: { prompt_tokens: 0, completion_tokens: 0 },
      })
    );

    await chatCompletion(
      'key',
      { model: 'google/gemini-2.5-flash-lite', messages: [] },
      { referer: 'https://beekle.jp', title: 'Beekle' }
    );

    const init = fetchMock.mock.calls[0][1] as { headers: Record<string, string> };
    expect(init.headers['http-referer']).toBe('https://beekle.jp');
    expect(init.headers['x-title']).toBe('Beekle');
    expect(init.headers.authorization).toBe('Bearer key');
  });
});

describe('chatCompletionWithBudget', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('成功時にKVに費用が記録される', async () => {
    const kv = memKV();
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse({
        choices: [{ message: { content: 'ok' } }],
        usage: { prompt_tokens: 1_000_000, completion_tokens: 0 },
        model: 'google/gemini-2.5-flash-lite',
      })
    );

    await chatCompletionWithBudget(kv, 'key', {
      model: 'google/gemini-2.5-flash-lite',
      messages: [{ role: 'user', content: 'hi' }],
    });

    const keys = Array.from(kv._store.keys());
    const costKey = keys.find((k) => k.startsWith('kill:cost:'));
    expect(costKey).toBeTruthy();
    if (costKey) {
      expect(Number.parseFloat(kv._store.get(costKey) ?? '0')).toBeCloseTo(0.1, 5);
    }
  });

  it('cost=0(未知モデル)なら記録しない', async () => {
    const kv = memKV();
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse({
        choices: [{ message: { content: 'ok' } }],
        usage: { prompt_tokens: 100, completion_tokens: 50 },
      })
    );

    await chatCompletionWithBudget(kv, 'key', {
      model: 'unknown/model',
      messages: [{ role: 'user', content: 'hi' }],
    });

    expect(kv._store.size).toBe(0);
  });
});
