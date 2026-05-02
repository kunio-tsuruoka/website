type KVNamespaceLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
};

const KEY_PREFIX = 'kill:cost:';
const TTL_SEC = 60 * 60 * 24 * 70;
const ALERT_KEY_PREFIX = 'kill:alert:';
const ALERT_TTL_SEC = 60 * 60 * 24;

export function monthBucket(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export type BudgetStatus = {
  ok: boolean;
  spentUsd: number;
  budgetUsd: number;
  bucket: string;
};

export async function checkBudget(
  kv: KVNamespaceLike,
  budgetUsd: number,
  now: Date = new Date()
): Promise<BudgetStatus> {
  const bucket = monthBucket(now);
  const raw = await kv.get(KEY_PREFIX + bucket);
  const spentUsd = raw ? Number.parseFloat(raw) : 0;
  return { ok: spentUsd < budgetUsd, spentUsd, budgetUsd, bucket };
}

export async function recordCost(
  kv: KVNamespaceLike,
  costUsd: number,
  now: Date = new Date()
): Promise<number> {
  if (costUsd <= 0 || !Number.isFinite(costUsd)) return 0;
  const bucket = monthBucket(now);
  const key = KEY_PREFIX + bucket;
  const raw = await kv.get(key);
  const prev = raw ? Number.parseFloat(raw) : 0;
  const next = prev + costUsd;
  await kv.put(key, next.toFixed(6), { expirationTtl: TTL_SEC });
  return next;
}

export function budgetExceededResponse(status: BudgetStatus): Response {
  return new Response(
    JSON.stringify({
      error: 'budget_exceeded',
      message: '月次予算上限に達しました。来月以降にお試しください。',
      bucket: status.bucket,
    }),
    { status: 503, headers: { 'content-type': 'application/json' } }
  );
}

export type ModelPricing = {
  inputPerMtok: number;
  outputPerMtok: number;
};

export function estimateCost(
  pricing: ModelPricing,
  inputTokens: number,
  outputTokens: number
): number {
  return (
    (inputTokens / 1_000_000) * pricing.inputPerMtok +
    (outputTokens / 1_000_000) * pricing.outputPerMtok
  );
}

export async function notifyBudgetExceeded(
  kv: KVNamespaceLike,
  webhookUrl: string | undefined,
  status: BudgetStatus,
  now: Date = new Date()
): Promise<void> {
  if (!webhookUrl) return;
  const alertKey = ALERT_KEY_PREFIX + status.bucket;
  const already = await kv.get(alertKey);
  if (already) return;
  await kv.put(alertKey, '1', { expirationTtl: ALERT_TTL_SEC });

  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const ts = `${jstNow.getUTCFullYear()}-${String(jstNow.getUTCMonth() + 1).padStart(2, '0')}-${String(jstNow.getUTCDate()).padStart(2, '0')} ${String(jstNow.getUTCHours()).padStart(2, '0')}:${String(jstNow.getUTCMinutes()).padStart(2, '0')} JST`;

  const payload = {
    text: `:warning: AIデモ 月次予算超過 (${status.bucket})`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: ':warning: AIデモが月次予算を超過しました' },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*月:*\n${status.bucket}` },
          { type: 'mrkdwn', text: `*予算:*\n$${status.budgetUsd.toFixed(2)}` },
          { type: 'mrkdwn', text: `*累計:*\n$${status.spentUsd.toFixed(4)}` },
          { type: 'mrkdwn', text: `*検知時刻:*\n${ts}` },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*影響:* `/api/ai/*` が 503 で停止中。\n*対応:* Cloudflare Pages の環境変数 `AI_MONTHLY_BUDGET_USD` を引き上げる、または月初まで待つ。',
        },
      },
      { type: 'divider' },
    ],
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch (err) {
    console.error('[ai-kill-switch] slack notify failed:', err);
  }
}
