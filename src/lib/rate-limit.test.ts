import { describe, expect, it } from 'vitest';
import { checkRateLimit, limitByIp } from './rate-limit';

function createMemoryKV() {
  const store = new Map<string, { value: string; expiresAt?: number }>();
  return {
    get: async (k: string) => {
      const v = store.get(k);
      if (!v) return null;
      if (v.expiresAt && Date.now() > v.expiresAt) {
        store.delete(k);
        return null;
      }
      return v.value;
    },
    put: async (k: string, value: string, opts?: { expirationTtl?: number }) => {
      store.set(k, {
        value,
        expiresAt: opts?.expirationTtl ? Date.now() + opts.expirationTtl * 1000 : undefined,
      });
    },
    _store: store,
  };
}

describe('checkRateLimit', () => {
  it('limit内では順次OKを返し remaining が減る', async () => {
    const kv = createMemoryKV();
    const opts = { windowSec: 60, max: 3 };

    const r1 = await checkRateLimit(kv, 'ip:1.1.1.1', opts);
    const r2 = await checkRateLimit(kv, 'ip:1.1.1.1', opts);
    const r3 = await checkRateLimit(kv, 'ip:1.1.1.1', opts);

    expect(r1.ok).toBe(true);
    expect(r1.remaining).toBe(2);
    expect(r2.remaining).toBe(1);
    expect(r3.remaining).toBe(0);
  });

  it('limit超過時は ok=false と retryAfterSec を返す', async () => {
    const kv = createMemoryKV();
    const opts = { windowSec: 60, max: 2 };

    await checkRateLimit(kv, 'ip:2.2.2.2', opts);
    await checkRateLimit(kv, 'ip:2.2.2.2', opts);
    const blocked = await checkRateLimit(kv, 'ip:2.2.2.2', opts);

    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
    expect(blocked.retryAfterSec).toBeLessThanOrEqual(60);
  });

  it('別identityは独立してカウントされる', async () => {
    const kv = createMemoryKV();
    const opts = { windowSec: 60, max: 1 };

    const a = await checkRateLimit(kv, 'ip:a', opts);
    const b = await checkRateLimit(kv, 'ip:b', opts);

    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
  });

  it('prefix違いは別カウンタになる', async () => {
    const kv = createMemoryKV();

    const a = await checkRateLimit(kv, 'ip:x', { windowSec: 60, max: 1, prefix: 'ocr' });
    const b = await checkRateLimit(kv, 'ip:x', { windowSec: 60, max: 1, prefix: 'chat' });

    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
  });
});

describe('limitByIp', () => {
  function reqWithIp(ip: string): Request {
    return new Request('https://example.com/api/ai/test', {
      headers: { 'cf-connecting-ip': ip },
    });
  }

  it('分間上限を超えると 429 (perMin が先に効く)', async () => {
    const kv = createMemoryKV();
    const profile = { endpoint: 'ocr', perMin: 2, perDay: 100 };

    await limitByIp(kv, reqWithIp('1.1.1.1'), profile);
    await limitByIp(kv, reqWithIp('1.1.1.1'), profile);
    const blocked = await limitByIp(kv, reqWithIp('1.1.1.1'), profile);

    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeLessThanOrEqual(60);
  });

  it('日次上限を超えると 429 (perDay が効く)', async () => {
    const kv = createMemoryKV();
    const profile = { endpoint: 'ocr', perMin: 1000, perDay: 2 };

    await limitByIp(kv, reqWithIp('2.2.2.2'), profile);
    await limitByIp(kv, reqWithIp('2.2.2.2'), profile);
    const blocked = await limitByIp(kv, reqWithIp('2.2.2.2'), profile);

    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(60);
  });

  it('別endpointは別カウンタ', async () => {
    const kv = createMemoryKV();
    const ocr = { endpoint: 'ocr', perMin: 1, perDay: 1 };
    const chat = { endpoint: 'chat', perMin: 1, perDay: 1 };

    const a = await limitByIp(kv, reqWithIp('3.3.3.3'), ocr);
    const b = await limitByIp(kv, reqWithIp('3.3.3.3'), chat);

    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
  });

  it('別IPは独立', async () => {
    const kv = createMemoryKV();
    const profile = { endpoint: 'ocr', perMin: 1, perDay: 1 };

    const a = await limitByIp(kv, reqWithIp('4.4.4.4'), profile);
    const b = await limitByIp(kv, reqWithIp('5.5.5.5'), profile);

    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
  });
});
