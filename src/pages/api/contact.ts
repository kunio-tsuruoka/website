import type { APIRoute } from 'astro';
import { z } from 'zod';
import { readSession } from '../../lib/flow-interview/session';
import { type LeadClassification, classifyInquiry } from '../../lib/lead-classifier';
import { verifyTurnstile } from '../../lib/turnstile';

export const prerender = false;

const TYPE_LABELS: Record<string, string> = {
  consultation: 'まずは相談したい',
  web: 'Webアプリ開発について',
  mobile: 'モバイルアプリ開発について',
  prototype: '15分で開発方針を整理したい',
  estimate: '見積もり妥当性・概算費用を聞きたい',
  requirements: '作りたいもの・依頼内容を整理したい',
  ai: '社内資料や業務データをAIで使いたい',
  cdp: '顧客データを整理・活用したい',
  dx: '業務改善・AI導入について',
  tech_review: '社内データ・既存システムの不安を相談したい',
  global: '海外向けサービス開発について',
  partner: '開発パートナー・協業のご相談（開発会社・SIer様）',
  other: 'その他',
  download_zero_start: '【資料DL】ゼロスタート開発サービスデック',
};

const ContactSchema = z.object({
  email: z.string().trim().email('メールアドレスを正しく入力してください'),
  message: z.string().trim().max(5000, 'お問い合わせ内容が長すぎます').optional().default(''),
  type: z.string().optional().default(''),
  name: z.string().trim().min(1, 'お名前を入力してください').max(255, 'お名前が長すぎます'),
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

const WEBHOOK_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;

async function postJsonWithRetry(
  url: string,
  payload: unknown,
  headers: Record<string, string>,
  serviceName: string
): Promise<void> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (response.ok) return;
      const text = await response.text().catch(() => '');
      lastError = new Error(`${serviceName} ${response.status}: ${text || 'no body'}`);
    } catch (err) {
      lastError = err;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function postToSlack(webhookUrl: string, payload: unknown): Promise<void> {
  return postJsonWithRetry(webhookUrl, payload, { 'Content-Type': 'application/json' }, 'Slack');
}

function postToCrm(
  webhookUrl: string,
  token: string,
  authHeaderName: string,
  payload: unknown
): Promise<void> {
  return postJsonWithRetry(
    webhookUrl,
    payload,
    {
      'Content-Type': 'application/json',
      [authHeaderName]: token,
    },
    'CRM'
  );
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const runtime = (
      locals as {
        runtime?: {
          env?: {
            SLACK_WEBHOOK_URL?: string;
            CRM_INQUIRY_WEBHOOK_URL?: string;
            CRM_INQUIRY_WEBHOOK_TOKEN?: string;
            CRM_INQUIRY_WEBHOOK_AUTH_HEADER?: string;
            TURNSTILE_SECRET_KEY?: string;
            OPENROUTER_API_KEY?: string;
            OPENROUTER_MODEL_LEAD_FILTER?: string;
            RATE_LIMIT?: { get(key: string): Promise<string | null> };
          };
        };
      }
    ).runtime;
    const webhookUrl = runtime?.env?.SLACK_WEBHOOK_URL;
    const crmWebhookUrl = runtime?.env?.CRM_INQUIRY_WEBHOOK_URL;
    const crmWebhookToken = runtime?.env?.CRM_INQUIRY_WEBHOOK_TOKEN;
    const crmWebhookAuthHeader = runtime?.env?.CRM_INQUIRY_WEBHOOK_AUTH_HEADER || 'X-Webhook-Token';
    const openrouterApiKey = runtime?.env?.OPENROUTER_API_KEY;
    const leadFilterModel = runtime?.env?.OPENROUTER_MODEL_LEAD_FILTER;
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
    const typeLabel = TYPE_LABELS[typeStr] || typeStr || '未選択';
    const displayMessage = message || '未記入';
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

    // 営業メールを CRM に入れないための LLM 判定。Slack には判定結果に関わらず全件通知する。
    // CRM 連携が無効なら判定自体を省く（無駄なコストを掛けない）。
    const crmConfigured = !!(crmWebhookUrl && crmWebhookToken);
    let classification: LeadClassification = { verdict: 'unknown', reason: 'AI判定は未実行' };
    if (crmConfigured) {
      if (openrouterApiKey) {
        classification = await classifyInquiry(
          openrouterApiKey,
          {
            name,
            company,
            email,
            phone,
            typeLabel,
            message: displayMessage,
            source,
            landingPage,
            referrer,
          },
          leadFilterModel ? { model: leadFilterModel } : undefined
        );
      } else {
        console.warn('[contact] OPENROUTER_API_KEY not configured; skipping lead classification');
      }
    }
    if (crmConfigured && classification.verdict === 'unknown') {
      console.warn('[contact] lead classification unavailable:', classification.reason);
    }
    // 判定不能（キー未設定・タイムアウト・パース失敗）は CRM に通す。
    // 営業を1件通す損失より、本物のリードを1件落とす損失の方が大きいため。
    const syncToCrm = crmConfigured && classification.verdict !== 'sales';
    const crmStatusText =
      classification.verdict === 'sales'
        ? `見送り（営業と判定: ${escapeSlack(classification.reason)}）`
        : classification.verdict === 'lead'
          ? '実施（問い合わせと判定）'
          : crmConfigured
            ? `実施（AI判定できず: ${escapeSlack(classification.reason)}）`
            : '未設定';

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
              text: `*種別:*\n${escapeSlack(typeLabel)}`,
            },
            { type: 'mrkdwn', text: `*メール:*\n${escapeSlack(email)}` },
            { type: 'mrkdwn', text: `*お名前:*\n${escapeSlack(name) || '未記入'}` },
            { type: 'mrkdwn', text: `*会社名:*\n${escapeSlack(company) || '未記入'}` },
            { type: 'mrkdwn', text: `*電話番号:*\n${escapeSlack(phone) || '未記入'}` },
          ],
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*お問い合わせ内容:*\n${escapeSlack(displayMessage)}` },
        },
        {
          type: 'context',
          elements: [{ type: 'mrkdwn', text: `*経由元:* ${provenanceText}` }],
        },
        {
          type: 'context',
          elements: [{ type: 'mrkdwn', text: `*流入:*\n${attributionLine}` }],
        },
        {
          type: 'context',
          elements: [{ type: 'mrkdwn', text: `*CRM連携:* ${crmStatusText}` }],
        },
        { type: 'divider' },
      ],
    };

    const crmPayload = {
      name,
      company: company || null,
      email,
      phone: phone || null,
      type: typeLabel,
      body: displayMessage,
      meta: {
        source: source || null,
        intent: intent || null,
        phase: phase || null,
        landing_page: landingPage || null,
        referrer: referrer || null,
        ga_cid: clientId || null,
        utm_source: utmSource || null,
        utm_medium: utmMedium || null,
        utm_campaign: utmCampaign || null,
        utm: [utmSource, utmMedium, utmCampaign].filter(Boolean).join(' / ') || null,
      },
    };

    const deliveries: Promise<void>[] = [postToSlack(webhookUrl, slackMessage)];
    if (syncToCrm && crmWebhookUrl && crmWebhookToken) {
      deliveries.push(postToCrm(crmWebhookUrl, crmWebhookToken, crmWebhookAuthHeader, crmPayload));
    } else if (crmConfigured) {
      console.info('[contact] CRM sync skipped as sales outreach:', classification.reason);
    } else if (crmWebhookUrl || crmWebhookToken) {
      console.warn('[contact] CRM webhook is partially configured; skipping CRM sync');
    }

    const [slackResult, crmResult] = await Promise.allSettled(deliveries);
    if (slackResult.status === 'rejected') throw slackResult.reason;
    if (crmResult?.status === 'rejected') {
      const detail =
        crmResult.reason instanceof Error ? crmResult.reason.message : crmResult.reason;
      console.error('[contact] CRM sync failed:', detail);
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
