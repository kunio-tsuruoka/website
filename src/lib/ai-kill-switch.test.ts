import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  checkBudget,
  estimateCost,
  monthBucket,
  notifyBudgetExceeded,
  recordCost,
} from './ai-kill-switch';

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

describe('monthBucket', () => {
  it('UTC基準でYYYY-MMを返す', () => {
    expect(monthBucket(new Date('2026-05-02T12:00:00Z'))).toBe('2026-05');
    expect(monthBucket(new Date('2026-01-01T00:00:00Z'))).toBe('2026-01');
    expect(monthBucket(new Date('2026-12-31T23:59:59Z'))).toBe('2026-12');
  });
});

describe('checkBudget / recordCost', () => {
  it('未使用なら ok=true で spentUsd=0', async () => {
    const kv = memKV();
    const r = await checkBudget(kv, 10);
    expect(r.ok).toBe(true);
    expect(r.spentUsd).toBe(0);
  });

  it('recordCost 後に spentUsd が累積する', async () => {
    const kv = memKV();
    await recordCost(kv, 1.5);
    await recordCost(kv, 2.25);
    const r = await checkBudget(kv, 10);
    expect(r.spentUsd).toBeCloseTo(3.75, 5);
    expect(r.ok).toBe(true);
  });

  it('予算超過で ok=false', async () => {
    const kv = memKV();
    await recordCost(kv, 9.99);
    const r1 = await checkBudget(kv, 10);
    expect(r1.ok).toBe(true);

    await recordCost(kv, 0.02);
    const r2 = await checkBudget(kv, 10);
    expect(r2.ok).toBe(false);
    expect(r2.spentUsd).toBeCloseTo(10.01, 5);
  });

  it('月が変わると別バケットで集計', async () => {
    const kv = memKV();
    await recordCost(kv, 5, new Date('2026-05-15T00:00:00Z'));
    const may = await checkBudget(kv, 10, new Date('2026-05-20T00:00:00Z'));
    const jun = await checkBudget(kv, 10, new Date('2026-06-01T00:00:00Z'));

    expect(may.spentUsd).toBe(5);
    expect(jun.spentUsd).toBe(0);
    expect(jun.bucket).toBe('2026-06');
  });

  it('負/NaN/0 の cost は無視', async () => {
    const kv = memKV();
    await recordCost(kv, -1);
    await recordCost(kv, Number.NaN);
    await recordCost(kv, 0);
    const r = await checkBudget(kv, 10);
    expect(r.spentUsd).toBe(0);
  });
});

describe('notifyBudgetExceeded', () => {
  const originalFetch = globalThis.fetch;
  beforeEach(() => {
    globalThis.fetch = vi.fn(async () => new Response('ok', { status: 200 })) as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('webhookUrl 未設定なら何もしない', async () => {
    const kv = memKV();
    await notifyBudgetExceeded(kv, undefined, {
      ok: false,
      spentUsd: 11,
      budgetUsd: 10,
      bucket: '2026-05',
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('1日1回しか飛ばさない（同月の2回目はスキップ）', async () => {
    const kv = memKV();
    const status = { ok: false, spentUsd: 11, budgetUsd: 10, bucket: '2026-05' };
    await notifyBudgetExceeded(kv, 'https://hooks.example/x', status);
    await notifyBudgetExceeded(kv, 'https://hooks.example/x', status);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(kv._store.get('kill:alert:2026-05')).toBe('1');
  });

  it('Slack 側エラーでも例外を投げない', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('network');
    }) as typeof fetch;
    const kv = memKV();
    await expect(
      notifyBudgetExceeded(kv, 'https://hooks.example/x', {
        ok: false,
        spentUsd: 11,
        budgetUsd: 10,
        bucket: '2026-06',
      })
    ).resolves.toBeUndefined();
  });
});

describe('estimateCost', () => {
  it('入出力トークンと単価から費用を計算', () => {
    const pricing = { inputPerMtok: 0.1, outputPerMtok: 0.4 };
    expect(estimateCost(pricing, 1_000_000, 0)).toBeCloseTo(0.1, 6);
    expect(estimateCost(pricing, 0, 1_000_000)).toBeCloseTo(0.4, 6);
    expect(estimateCost(pricing, 500, 300)).toBeCloseTo(0.1 * 0.0005 + 0.4 * 0.0003, 9);
  });
});
