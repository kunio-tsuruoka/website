import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { aiGuards } from './ai-guards';

function memKV() {
  const store = new Map<string, string>();
  return {
    get: async (k: string) => store.get(k) ?? null,
    put: async (k: string, v: string) => {
      store.set(k, v);
    },
  };
}

function makeLocals(env: Record<string, unknown>) {
  return { runtime: { env } };
}

function jsonRequest(ip: string, body: Record<string, unknown>): Request {
  return new Request('https://example.com/api/ai/test', {
    method: 'POST',
    headers: { 'cf-connecting-ip': ip, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function mockSiteverify(success: boolean, errorCodes: string[] = []) {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ success, 'error-codes': errorCodes }), { status: 200 })
      )
  );
}

describe('aiGuards', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('runtime未注入なら 500 runtime_unavailable', async () => {
    const r = await aiGuards({}, jsonRequest('1.1.1.1', {}), { endpoint: 'test' });
    expect(r).toBeInstanceOf(Response);
    expect((r as Response).status).toBe(500);
  });

  it('全通過時は env と budget を返す', async () => {
    mockSiteverify(true);
    const kv = memKV();
    const locals = makeLocals({
      RATE_LIMIT: kv,
      TURNSTILE_SECRET_KEY: 's',
      OPENROUTER_API_KEY: 'k',
      AI_MONTHLY_BUDGET_USD: '10',
    });
    const result = await aiGuards(locals, jsonRequest('1.1.1.1', { turnstileToken: 'tok' }), {
      endpoint: 'test',
      perMin: 5,
      perDay: 30,
    });
    expect(result).not.toBeInstanceOf(Response);
    if (result instanceof Response) return;
    expect(result.budget.ok).toBe(true);
  });

  it('rate-limit超過なら 429', async () => {
    mockSiteverify(true);
    const kv = memKV();
    const locals = makeLocals({
      RATE_LIMIT: kv,
      TURNSTILE_SECRET_KEY: 's',
      OPENROUTER_API_KEY: 'k',
    });
    const profile = { endpoint: 'test', perMin: 1, perDay: 100 };

    const ok = await aiGuards(locals, jsonRequest('2.2.2.2', { turnstileToken: 'tok' }), profile);
    expect(ok).not.toBeInstanceOf(Response);

    const blocked = await aiGuards(
      locals,
      jsonRequest('2.2.2.2', { turnstileToken: 'tok' }),
      profile
    );
    expect(blocked).toBeInstanceOf(Response);
    expect((blocked as Response).status).toBe(429);
  });

  it('Turnstile失敗なら 403', async () => {
    mockSiteverify(false, ['invalid-input-response']);
    const kv = memKV();
    const locals = makeLocals({
      RATE_LIMIT: kv,
      TURNSTILE_SECRET_KEY: 's',
      OPENROUTER_API_KEY: 'k',
    });
    const r = await aiGuards(locals, jsonRequest('3.3.3.3', { turnstileToken: 'badtoken' }), {
      endpoint: 'test',
    });
    expect(r).toBeInstanceOf(Response);
    expect((r as Response).status).toBe(403);
  });

  it('予算超過なら 503', async () => {
    mockSiteverify(true);
    const kv = memKV();
    await kv.put(`kill:cost:${new Date().toISOString().slice(0, 7)}`, '20');
    const locals = makeLocals({
      RATE_LIMIT: kv,
      TURNSTILE_SECRET_KEY: 's',
      OPENROUTER_API_KEY: 'k',
      AI_MONTHLY_BUDGET_USD: '10',
    });
    const r = await aiGuards(locals, jsonRequest('4.4.4.4', { turnstileToken: 'tok' }), {
      endpoint: 'test',
    });
    expect(r).toBeInstanceOf(Response);
    expect((r as Response).status).toBe(503);
  });
});
