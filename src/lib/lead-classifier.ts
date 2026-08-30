import { chatCompletion } from './openrouter';

// 問い合わせフォームには営業メール（取材企画・SEO代行・人材紹介など）や、
// 対等な協業・提携の打診が一定量届く。
// Slack には全件通知したいが、CRM には発注側の見込み客だけを入れたいので LLM で仕分ける。
//
// 設計方針:
// - CRM に載せるのは lead（Beekle に発注・相談する顧客）だけ。sales と partnership は載せない。
// - 顧客の相談か売り込みかで迷ったら lead（fail-open）。本物のリードを1件落とす損失の方が大きい。
//   ただし発注の意思が読み取れない協業・提携の話は lead ではなく partnership に寄せる。
// - API キー未設定・タイムアウト・パース失敗はすべて 'unknown' を返し、呼び出し側は CRM に流す。
// - コストは1件あたり $0.0002 程度。AI デモの月次 kill-switch とは別会計にしている
//   （問い合わせ判定がデモの予算を食って /api/ai/* を止める事故を避けるため）。

export type LeadVerdict = 'lead' | 'partnership' | 'sales' | 'unknown';

export type LeadClassification = {
  verdict: LeadVerdict;
  reason: string;
};

export type LeadInput = {
  name: string;
  company: string;
  email: string;
  phone: string;
  typeLabel: string;
  message: string;
  source: string;
  landingPage: string;
  referrer: string;
};

export const DEFAULT_LEAD_FILTER_MODEL = 'openai/gpt-4o-mini';

const TIMEOUT_MS = 6000;
const MAX_MESSAGE_CHARS = 2000;

const SYSTEM_PROMPT = `あなたは受託開発会社 Beekle の問い合わせフォームに届いた連絡を仕分ける分類器です。
JSON だけを出力してください。形式: {"verdict":"lead"|"partnership"|"sales","reason":"日本語60字以内の判定理由"}

lead = Beekle に発注・相談する側（顧客）からの連絡
- システム開発／生成AI・AI導入／データ活用の相談、見積もり依頼、要件整理の依頼
- サービス内容・費用・進め方の質問、資料請求、取引条件の確認
- 開発会社・SIer が「自社の案件を Beekle に外注したい」と発注先として打診している場合
- 内容が短い・具体性に欠けていても、自社の課題を Beekle に相談しているなら lead

partnership = 発注ではなく、組む・つなぐことが目的の連絡
- 協業、業務提携、アライアンス、共同プロジェクト、共同事業の打診
- 案件を紹介し合いたい、開発リソースを融通し合いたいという相互送客の提案
- 自社の技術・ツール・プロダクトの紹介、連携やインテグレーションの打診
- 発注の意思が示されず、対等な関係づくりが主眼のもの

sales = Beekle に何かを売り込む・勧誘する側からの連絡
- 取材、メディア掲載、特集記事、表彰、ランキング掲載の案内（無料掲載・限定枠をうたうものを含む）
- SEO、Web集客、広告運用、リスティング、SNS運用の代行提案
- 人材紹介、求人媒体、エンジニア紹介、オフショア要員の一方的な売り込み
- ツール・SaaS・システムの営業、セミナーや展示会の案内
- 融資、投資、保険、不動産、M&A の勧誘
- 商談日程調整URLや自社サイトへの誘導が主目的の定型文
- 参照元が営業代行ツール（sales-crowd.jp、biz-maps.com など）の場合は sales の強い根拠

判定の順序:
1. Beekle に「作ってほしい」「見積もってほしい」と依頼していれば lead
2. 依頼ではなく、組む話・つなぐ話が主眼なら partnership
3. 自社の商品・サービス・人材を売り込んでいるなら sales

協業の打診でも、自社の人材・単価表・サービスを一方的に紹介しているだけなら sales。
顧客の相談か売り込みかで迷う場合は lead を選んでください。
ただし発注の意思が読み取れない協業・提携の話は、lead ではなく partnership を選んでください。`;

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…（以下省略）`;
}

export function buildUserPrompt(input: LeadInput): string {
  const lines = [
    `種別: ${input.typeLabel || '未選択'}`,
    `お名前: ${input.name || '未記入'}`,
    `会社名: ${input.company || '未記入'}`,
    `メール: ${input.email || '未記入'}`,
    `電話番号: ${input.phone || '未記入'}`,
    `経由元: ${input.source || '不明'}`,
    `着地ページ: ${input.landingPage || '不明'}`,
    `参照元: ${input.referrer || '直接/なし'}`,
    '本文:',
    truncate(input.message || '（未記入）', MAX_MESSAGE_CHARS),
  ];
  return lines.join('\n');
}

// モデルが ```json フェンスや前置きを付けて返すことがあるので、最初の JSON オブジェクトを拾う。
export function parseClassification(text: string): LeadClassification {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    return { verdict: 'unknown', reason: 'AI応答をJSONとして解釈できませんでした' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    return { verdict: 'unknown', reason: 'AI応答をJSONとして解釈できませんでした' };
  }

  const obj = parsed as { verdict?: unknown; reason?: unknown };
  const verdict = typeof obj.verdict === 'string' ? obj.verdict.trim().toLowerCase() : '';
  const reason = typeof obj.reason === 'string' ? truncate(obj.reason.trim(), 200) : '';

  if (verdict === 'lead' || verdict === 'partnership' || verdict === 'sales') {
    return { verdict, reason: reason || '理由の記載なし' };
  }
  return { verdict: 'unknown', reason: `AIが未知の判定を返しました: ${verdict || '(空)'}` };
}

export async function classifyInquiry(
  apiKey: string,
  input: LeadInput,
  opts?: { model?: string; timeoutMs?: number }
): Promise<LeadClassification> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts?.timeoutMs ?? TIMEOUT_MS);
  try {
    const result = await chatCompletion(
      apiKey,
      {
        model: opts?.model || DEFAULT_LEAD_FILTER_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(input) },
        ],
        max_tokens: 200,
        temperature: 0,
        response_format: { type: 'json_object' },
      },
      { referer: 'https://beekle.jp', title: 'Beekle Lead Filter', signal: controller.signal }
    );
    return parseClassification(result.text);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return { verdict: 'unknown', reason: `AI判定に失敗しました: ${truncate(detail, 120)}` };
  } finally {
    clearTimeout(timeout);
  }
}
