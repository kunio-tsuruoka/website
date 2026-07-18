// サーバーエラー（未捕捉例外・5xxレスポンス）のSlack通知。
// 設計原則（incident-2026-05-06 の教訓）:
// - 通知は本処理のクリティカルパスに入れない（throw しない・waitUntil でバックグラウンド送信）
// - SLACK_ERROR_WEBHOOK_URL 未設定なら何もしない（リード通知用 SLACK_WEBHOOK_URL とは分離）
// - KV で 5分デデュープし、エラーストームでSlackを埋めない

type KvNamespace = {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string, opts?: { expirationTtl?: number }) => Promise<void>;
};

export type ErrorNotifyLocals = {
  runtime?: {
    env?: {
      SLACK_ERROR_WEBHOOK_URL?: string;
      RATE_LIMIT?: KvNamespace;
    };
    ctx?: { waitUntil?: (p: Promise<unknown>) => void };
  };
};

const DEDUPE_TTL_SECONDS = 300;
const DETAIL_MAX_CHARS = 700;

export function notifyServerError(
  locals: ErrorNotifyLocals,
  request: Request,
  info: { status: number; detail?: string }
): void {
  try {
    const env = locals.runtime?.env;
    const webhookUrl =
      env?.SLACK_ERROR_WEBHOOK_URL ??
      (import.meta.env.SLACK_ERROR_WEBHOOK_URL as string | undefined);
    if (!webhookUrl) return;

    const url = new URL(request.url);
    const task = send(webhookUrl, env?.RATE_LIMIT, request, url, info).catch((err) => {
      console.warn('[error-notify] failed:', err instanceof Error ? err.message : err);
    });

    const waitUntil = locals.runtime?.ctx?.waitUntil;
    if (waitUntil) waitUntil(task);
    // waitUntil が無い環境（ローカルdev）では投げっぱなし（await しない）
  } catch (err) {
    console.warn('[error-notify] failed:', err instanceof Error ? err.message : err);
  }
}

async function send(
  webhookUrl: string,
  kv: KvNamespace | undefined,
  request: Request,
  url: URL,
  info: { status: number; detail?: string }
): Promise<void> {
  const dedupeKey = `errnotify:${info.status}:${request.method}:${url.pathname}`;
  if (kv) {
    try {
      if (await kv.get(dedupeKey)) return;
      await kv.put(dedupeKey, '1', { expirationTtl: DEDUPE_TTL_SECONDS });
    } catch {
      // KV 不調でも通知自体は続行
    }
  }

  const detail = (info.detail ?? '').slice(0, DETAIL_MAX_CHARS);
  const lines = [
    `サーバーエラー ${info.status}: ${request.method} ${url.pathname}`,
    `host: ${url.host}`,
    detail ? `detail: ${detail}` : null,
    `referer: ${request.headers.get('referer') ?? '-'}`,
    `ua: ${(request.headers.get('user-agent') ?? '-').slice(0, 120)}`,
    `time: ${new Date().toISOString()}`,
  ].filter(Boolean);

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: lines.join('\n') }),
  });
  if (!res.ok) {
    console.warn(`[error-notify] slack webhook returned ${res.status}`);
  }
}

// 5xxレスポンスのボディ先頭を安全に抜き出す（JSON/テキストのみ・本体ストリームは消費しない）
export async function safeBodyExcerpt(response: Response): Promise<string | undefined> {
  try {
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('json') && !contentType.includes('text')) return undefined;
    const text = await response.clone().text();
    return text.slice(0, DETAIL_MAX_CHARS);
  } catch {
    return undefined;
  }
}
