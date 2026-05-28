type KVNamespaceLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
};

const ALERT_KEY_PREFIX = 'ops:alert:';
const ALERT_TTL_SEC = 60 * 60; // 1h: 同種アラートの連投抑止

export type OpsAlertType =
  | 'llm_auth_failed'
  | 'llm_credit_exhausted'
  | 'llm_rate_limited'
  | 'llm_upstream_error'
  | 'llm_unknown_error';

const ALERT_LABEL: Record<OpsAlertType, { emoji: string; label: string }> = {
  llm_auth_failed: { emoji: ':rotating_light:', label: 'LLM 認証エラー (APIキー失効/誤り)' },
  llm_credit_exhausted: { emoji: ':moneybag:', label: 'LLM クレジット切れ (残高不足)' },
  llm_rate_limited: { emoji: ':warning:', label: 'LLM レート制限 (短期間で多発)' },
  llm_upstream_error: { emoji: ':warning:', label: 'LLM 上流エラー (5xx 等)' },
  llm_unknown_error: { emoji: ':warning:', label: 'LLM 不明エラー' },
};

/**
 * HTTP ステータスから OpsAlertType を決定する。
 * OpenRouter / Anthropic 共通の典型:
 * - 401: APIキーが無効
 * - 402: クレジット切れ / 残高不足
 * - 429: rate limit
 * - 5xx: 上流エラー
 */
export function classifyUpstreamError(status: number): OpsAlertType {
  if (status === 401 || status === 403) return 'llm_auth_failed';
  if (status === 402) return 'llm_credit_exhausted';
  if (status === 429) return 'llm_rate_limited';
  if (status >= 500 && status < 600) return 'llm_upstream_error';
  return 'llm_unknown_error';
}

function formatJst(now: Date): string {
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const y = jstNow.getUTCFullYear();
  const m = String(jstNow.getUTCMonth() + 1).padStart(2, '0');
  const d = String(jstNow.getUTCDate()).padStart(2, '0');
  const hh = String(jstNow.getUTCHours()).padStart(2, '0');
  const mm = String(jstNow.getUTCMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm} JST`;
}

export type OpsAlertContext = {
  endpoint?: string;
  model?: string;
  upstreamStatus?: number;
  detail?: string;
};

/**
 * Slack に運用アラートを送る。
 *
 * 重複抑止: `ops:alert:{type}` キーを 1 時間 TTL で立て、同じ種別のアラートは 1 時間あたり 1 回まで。
 * KV 未注入時 / webhook URL 未設定時は静かにスキップ (ローカル開発で落ちないように)。
 */
export async function notifyOpsAlert(
  kv: KVNamespaceLike | undefined,
  webhookUrl: string | undefined,
  type: OpsAlertType,
  context: OpsAlertContext = {},
  now: Date = new Date()
): Promise<void> {
  if (!webhookUrl) return;

  if (kv) {
    const alertKey = ALERT_KEY_PREFIX + type;
    const already = await kv.get(alertKey);
    if (already) return;
    await kv.put(alertKey, '1', { expirationTtl: ALERT_TTL_SEC });
  }

  const meta = ALERT_LABEL[type];
  const fields: Array<{ type: 'mrkdwn'; text: string }> = [
    { type: 'mrkdwn', text: `*種別:*\n${meta.label}` },
    { type: 'mrkdwn', text: `*検知時刻:*\n${formatJst(now)}` },
  ];
  if (context.endpoint) fields.push({ type: 'mrkdwn', text: `*Endpoint:*\n${context.endpoint}` });
  if (context.model) fields.push({ type: 'mrkdwn', text: `*Model:*\n${context.model}` });
  if (context.upstreamStatus !== undefined) {
    fields.push({ type: 'mrkdwn', text: `*Upstream HTTP:*\n${context.upstreamStatus}` });
  }

  const actionHint = (() => {
    switch (type) {
      case 'llm_auth_failed':
        return '*対応:* Cloudflare Pages の `OPENROUTER_API_KEY` を確認・更新する。';
      case 'llm_credit_exhausted':
        return '*対応:* OpenRouter ダッシュボードでクレジット残高を確認、必要ならチャージする。';
      case 'llm_rate_limited':
        return '*対応:* 一時的な可能性が高い。継続するならモデル変更・レート制限見直しを検討。';
      case 'llm_upstream_error':
        return '*対応:* 上流側の一時障害の可能性。継続発生時は別モデル / フォールバックを検討。';
      default:
        return '*対応:* ログを確認のうえ、必要なら別モデルへの切替えを検討。';
    }
  })();

  const payload = {
    text: `${meta.emoji} AIデモ 運用アラート (${type})`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `${meta.emoji} AIデモ 運用アラート` },
      },
      { type: 'section', fields },
      ...(context.detail
        ? [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*詳細:*\n\`\`\`${context.detail.slice(0, 800)}\`\`\``,
              },
            },
          ]
        : []),
      {
        type: 'section',
        text: { type: 'mrkdwn', text: actionHint },
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
    console.error('[ops-alert] slack notify failed:', err);
  }
}

/**
 * ヒアリング完了 → Beekle にリード通知。
 * 重複抑止しない (毎件通知必須)。失敗時は呼び出し側で error を返すかどうか判断する。
 */
export async function notifyHearingLead(
  webhookUrl: string,
  payload: {
    sessionId: string;
    summary: string;
    profile: Record<string, unknown>;
    contact: { name?: string | null; email?: string | null; company?: string | null };
  },
  now: Date = new Date()
): Promise<void> {
  const fields: Array<{ type: 'mrkdwn'; text: string }> = [
    { type: 'mrkdwn', text: `*受付:*\n${formatJst(now)}` },
    { type: 'mrkdwn', text: `*Session:*\n\`${payload.sessionId}\`` },
  ];
  if (payload.contact.name)
    fields.push({ type: 'mrkdwn', text: `*名前:*\n${payload.contact.name}` });
  if (payload.contact.company)
    fields.push({ type: 'mrkdwn', text: `*会社:*\n${payload.contact.company}` });
  if (payload.contact.email)
    fields.push({ type: 'mrkdwn', text: `*メール:*\n${payload.contact.email}` });

  const body = {
    text: ':bee: AIヒアリングからのリード',
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: ':bee: AIヒアリングからのリード' },
      },
      { type: 'section', fields },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*サマリ:*\n${payload.summary.slice(0, 2800)}` },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*構造化データ:*\n\`\`\`${JSON.stringify(payload.profile, null, 2).slice(0, 2800)}\`\`\``,
        },
      },
      { type: 'divider' },
    ],
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
