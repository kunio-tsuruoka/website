import type { APIRoute } from 'astro';

export const prerender = false;

const TYPE_LABELS: Record<string, string> = {
  consultation: 'まずは相談したい',
  web: 'Webアプリ開発について',
  mobile: 'モバイルアプリ開発について',
  prototype: 'プロトタイプ・POC作成について',
  ai: 'AI/AIエージェント開発について',
  global: '海外向けサービス開発について',
  other: 'その他',
  download_zero_start: '【資料DL】ゼロスタート開発サービスデック',
};

const SLACK_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;

async function postToSlack(webhookUrl: string, payload: unknown): Promise<void> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), SLACK_TIMEOUT_MS);
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (response.ok) return;
      const text = await response.text().catch(() => '');
      lastError = new Error(`Slack ${response.status}: ${text || 'no body'}`);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const runtime = (locals as { runtime?: { env?: { SLACK_WEBHOOK_URL?: string } } }).runtime;
    const webhookUrl = runtime?.env?.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('[contact] SLACK_WEBHOOK_URL is not configured');
      return jsonError(500, 'サーバー設定エラーが発生しました', 'webhook not configured');
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return jsonError(400, '不正なリクエスト形式です', 'invalid json');
    }

    const { message, email, name, type, company, phone, source, intent, phase } = body as Record<
      string,
      unknown
    >;

    if (typeof email !== 'string' || !email.includes('@')) {
      return jsonError(400, 'メールアドレスを正しく入力してください', 'invalid email');
    }
    if (typeof message !== 'string' || message.trim().length < 5) {
      return jsonError(400, 'お問い合わせ内容を入力してください', 'message too short');
    }

    const typeStr = typeof type === 'string' ? type : '';
    const provenanceParts = [
      typeof source === 'string' && source ? `source: ${source}` : '',
      typeof intent === 'string' && intent ? `intent: ${intent}` : '',
      typeof phase === 'string' && phase ? `phase: ${phase}` : '',
    ].filter(Boolean);
    const provenanceText =
      provenanceParts.length > 0 ? provenanceParts.join(' / ') : '直接アクセス';
    const slackMessage = {
      text: '新しいお問い合わせが届きました',
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '新しいお問い合わせ' },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*種別:*\n${TYPE_LABELS[typeStr] || typeStr || '未選択'}` },
            { type: 'mrkdwn', text: `*メール:*\n${email}` },
            {
              type: 'mrkdwn',
              text: `*お名前:*\n${typeof name === 'string' && name ? name : '未記入'}`,
            },
            {
              type: 'mrkdwn',
              text: `*会社名:*\n${typeof company === 'string' && company ? company : '未記入'}`,
            },
            {
              type: 'mrkdwn',
              text: `*電話番号:*\n${typeof phone === 'string' && phone ? phone : '未記入'}`,
            },
          ],
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*お問い合わせ内容:*\n${message}` },
        },
        {
          type: 'context',
          elements: [{ type: 'mrkdwn', text: `*経由元:* ${provenanceText}` }],
        },
        { type: 'divider' },
      ],
    };

    await postToSlack(webhookUrl, slackMessage);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown error';
    console.error('[contact] failed:', detail);
    return jsonError(500, '送信に失敗しました。時間をおいて再度お試しください。', detail);
  }
};

function jsonError(status: number, error: string, details: string) {
  return new Response(JSON.stringify({ success: false, error, details }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
