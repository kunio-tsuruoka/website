import type { APIRoute } from 'astro';
import { z } from 'zod';
import { readSession } from '../../lib/flow-interview/session';
import { syncLeadToHubSpot } from '../../lib/hubspot';
import { verifyTurnstile } from '../../lib/turnstile';

export const prerender = false;

const TYPE_LABELS: Record<string, string> = {
  consultation: 'まずは相談したい',
  web: 'Webアプリ開発について',
  mobile: 'モバイルアプリ開発について',
  prototype: 'プロトタイプ・POC作成について',
  ai: 'AI/AIエージェント開発について',
  global: '海外向けサービス開発について',
  partner: '開発パートナー・協業のご相談（開発会社・SIer様）',
  other: 'その他',
  download_zero_start: '【資料DL】ゼロスタート開発サービスデック',
};

const ContactSchema = z.object({
  email: z.string().trim().email('メールアドレスを正しく入力してください'),
  message: z
    .string()
    .trim()
    .min(1, 'お問い合わせ内容を入力してください')
    .max(5000, 'お問い合わせ内容が長すぎます'),
  type: z.string().optional().default(''),
  name: z.string().optional().default(''),
  company: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  source: z.string().optional().default(''),
  intent: z.string().optional().default(''),
  phase: z.string().optional().default(''),
  turnstileToken: z.string().optional().default(''),
  // flow-interview など、開始時に既に Turnstile を通したセッション経由の送信
  sessionId: z.string().optional().default(''),
  // 流入アトリビューション（src/lib/attribution.ts が付与）。クライアント由来なので長さ制限のみ。
  clientId: z.string().trim().max(120).optional().default(''),
  landingPage: z.string().trim().max(400).optional().default(''),
  referrer: z.string().trim().max(400).optional().default(''),
  utmSource: z.string().trim().max(120).optional().default(''),
  utmMedium: z.string().trim().max(120).optional().default(''),
  utmCampaign: z.string().trim().max(160).optional().default(''),
});

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
    const runtime = (
      locals as {
        runtime?: {
          env?: {
            SLACK_WEBHOOK_URL?: string;
            TURNSTILE_SECRET_KEY?: string;
            RATE_LIMIT?: { get(key: string): Promise<string | null> };
            HUBSPOT_ACCESS_TOKEN?: string;
            HUBSPOT_DEAL_PIPELINE?: string;
            HUBSPOT_DEAL_STAGE?: string;
          };
          ctx?: { waitUntil?: (promise: Promise<unknown>) => void };
        };
      }
    ).runtime;
    const webhookUrl = runtime?.env?.SLACK_WEBHOOK_URL;
    const turnstileSecret = runtime?.env?.TURNSTILE_SECRET_KEY;
    const rateLimitKv = runtime?.env?.RATE_LIMIT;

    if (!webhookUrl) {
      console.error('[contact] SLACK_WEBHOOK_URL is not configured');
      return jsonError(500, 'サーバー設定エラーが発生しました', 'webhook not configured');
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return jsonError(400, '不正なリクエスト形式です', 'invalid json');
    }

    const parsed = ContactSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return jsonError(
        400,
        first?.message ?? '入力内容を確認してください',
        first?.path.join('.') ?? 'validation'
      );
    }
    const {
      message,
      email,
      name,
      type,
      company,
      phone,
      source,
      intent,
      phase,
      turnstileToken,
      sessionId,
      clientId,
      landingPage,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
    } = parsed.data;

    // 既存の AI セッション（開始時に Turnstile 検証済み）からの送信は再検証を免除する。
    // セッションが KV に実在し active であることを確認し、なりすましを防ぐ。
    let sessionVerified = false;
    if (source === 'flow-interview' && sessionId && rateLimitKv) {
      const session = await readSession(rateLimitKv, sessionId);
      sessionVerified = !!session;
      if (!sessionVerified) {
        console.warn('[contact] flow-interview session not found/expired', sessionId.slice(0, 8));
      }
    }

    if (turnstileSecret && !sessionVerified) {
      const remoteIp =
        request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? '';
      const verify = await verifyTurnstile(turnstileSecret, turnstileToken, remoteIp);
      if (!verify.ok) {
        console.warn('[contact] turnstile failed', verify.errorCodes);
        return jsonError(
          403,
          'セキュリティチェックに失敗しました。ページを再読み込みして再度お試しください。',
          `turnstile: ${verify.errorCodes.join(',')}`
        );
      }
    } else if (!turnstileSecret) {
      console.warn('[contact] TURNSTILE_SECRET_KEY not configured; skipping verification');
    }

    const typeStr = type;
    // ユーザー由来の値は Slack mrkdwn の制御文字 (& < >) を無害化してから埋め込む。
    // これで <!channel>/<!here> の全員メンション、<url|偽装テキスト> のフィッシングリンク注入を防ぐ。
    const provenanceParts = [
      source ? `source: ${escapeSlack(source)}` : '',
      intent ? `intent: ${escapeSlack(intent)}` : '',
      phase ? `phase: ${escapeSlack(phase)}` : '',
    ].filter(Boolean);
    const provenanceText =
      provenanceParts.length > 0 ? provenanceParts.join(' / ') : '直接アクセス';

    // 流入アトリビューション（入口ページ・外部参照元・UTM・GA client_id）。
    // 参照元が空＝直接/ブックマーク/外部アプリ。client_id は GA4 探索での後追い照合用。
    const utmText = [utmSource, utmMedium, utmCampaign].filter(Boolean).join(' / ');
    const attributionLine = [
      `着地: ${landingPage ? escapeSlack(landingPage) : '不明'}`,
      `参照元: ${referrer ? escapeSlack(referrer) : '直接/なし'}`,
      utmText ? `UTM: ${escapeSlack(utmText)}` : '',
      clientId ? `GA cid: ${escapeSlack(clientId)}` : '',
    ]
      .filter(Boolean)
      .join('\n');
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
            {
              type: 'mrkdwn',
              text: `*種別:*\n${TYPE_LABELS[typeStr] || escapeSlack(typeStr) || '未選択'}`,
            },
            { type: 'mrkdwn', text: `*メール:*\n${escapeSlack(email)}` },
            { type: 'mrkdwn', text: `*お名前:*\n${escapeSlack(name) || '未記入'}` },
            { type: 'mrkdwn', text: `*会社名:*\n${escapeSlack(company) || '未記入'}` },
            { type: 'mrkdwn', text: `*電話番号:*\n${escapeSlack(phone) || '未記入'}` },
          ],
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*お問い合わせ内容:*\n${escapeSlack(message)}` },
        },
        {
          type: 'context',
          elements: [{ type: 'mrkdwn', text: `*経由元:* ${provenanceText}` }],
        },
        {
          type: 'context',
          elements: [{ type: 'mrkdwn', text: `*流入:*\n${attributionLine}` }],
        },
        { type: 'divider' },
      ],
    };

    await postToSlack(webhookUrl, slackMessage);

    // HubSpot CRM へベストエフォートで同期する。トークン未設定ならスキップ。
    // HubSpot 側が落ちても問い合わせ（= Slack 通知）は成功させる。過去の
    // SLACK_WEBHOOK_URL 単一障害点インシデントと同様、通知系を CRM に依存させない。
    const hubspotToken = runtime?.env?.HUBSPOT_ACCESS_TOKEN;
    if (hubspotToken) {
      const syncTask = syncLeadToHubSpot(
        hubspotToken,
        {
          email,
          name,
          company,
          phone,
          message,
          typeLabel: TYPE_LABELS[typeStr] || typeStr,
          source,
          intent,
          phase,
          landingPage,
          referrer,
          utm: utmText,
          clientId,
        },
        {
          HUBSPOT_DEAL_PIPELINE: runtime?.env?.HUBSPOT_DEAL_PIPELINE,
          HUBSPOT_DEAL_STAGE: runtime?.env?.HUBSPOT_DEAL_STAGE,
        }
      ).catch((err) => {
        console.error('[contact] hubspot sync threw:', err instanceof Error ? err.message : err);
      });

      // レスポンスを遅らせないよう waitUntil でバックグラウンド実行。
      // 無ければ（ローカル dev 等）応答前に await する。
      const waitUntil = runtime?.ctx?.waitUntil;
      if (waitUntil) waitUntil(syncTask);
      else await syncTask;
    }

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

// Slack mrkdwn のエスケープ（公式仕様: & < > のみ）。
// <!channel> / <!here> の全員メンションや <https://evil|テキスト> のリンク偽装を無害化する。
function escapeSlack(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
