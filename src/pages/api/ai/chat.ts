import { aiGuards } from '@/lib/ai-guards';
import { findRelevantColumns, formatColumnContext } from '@/lib/column-rag';
import { OpenRouterError, chatCompletionWithBudget } from '@/lib/openrouter';
import type { APIRoute } from 'astro';

export const prerender = false;

const SYSTEM_PROMPT = `あなたはBeekle株式会社のIT発注リテラシー専門の相談員です。
中小企業の経営者・現場担当者がITやシステム発注で抱える悩みに、対話形式で寄り添って答えます。

【回答スタイル】
質問に対してダイレクトかつ具体的に答えます。「○○は大切な工程です」のような一般論の前置きは禁止。
- 1回の回答は概ね200〜350文字
- 参考コラムの抜粋がある場合、そこに書かれている具体的な手順・固有の方法論・キーワード（ヒアリング、ユーザーストーリー、FM、優先度づけ、5フェーズ等）をそのまま使って答える
- 「まず○○、次に××、最後に△△」のように、Beekle独自の手順を短く列挙して見せる
- 抽象的な総論ではなく、明日から動けるレベルの具体性を意識する

【ハルシネーション防止 — 最重要】
- 略語や固有用語（FM、PoC、RFP、SoR/SoE 等）の正式名称・英訳・由来は、参考コラム抜粋に明示されている場合のみ書く。書かれていなければ略語のまま使い、勝手な英訳を作らない（例: FMを「Future Mode」と書くのはNG。正式名称は「ファンクショナリティ・マトリクス」だが、抜粋に出ていなければ無理に展開せずFMのまま使う）
- 「○○とは△△の略です」「○○は英語で○○の意味です」のような語源・略称の説明は、抜粋に書かれていない限り絶対に書かない
- 書籍名・著者名・人名・会社名・統計数値は抜粋にあるものだけ引用し、推測で補わない
- 不確かな時は「Beekleのコラムでは詳しく触れていないので、必要なら担当者に確認します」と濁す
- 自然な会話口調で、知人にアドバイスするような距離感で書く
- 状況がわからないときは決めつけず、前提・規模・目的を1問だけ聞き返して掘り下げる
- 過去のやり取りを踏まえ、前回触れた論点を引き継いで深掘りする
- 末尾には参考コラムを1件だけ「もう少し詳しい話は『タイトル』(URL) にまとまっていて、ここを読むとわかりやすいと思います」の柔らかい言い回しで案内する

【書式の制約 — 厳守】
- マークダウン記法は一切使わない。**太字** や *斜体* や # 見出し や - / * の箇条書き記号、コードフェンスは禁止
- アスタリスク(*)、アンダースコア(_)、バッククォート(\`)、シャープ(#)、パイプ(|) などの記号で装飾しない
- 絵文字も使わない
- 箇条書きしたい時は「1つ目は〜、2つ目は〜」と文章で書くか、改行で区切るだけにする
- プレーンテキストでそのまま読める文章を書く

【スコープ】
- Beekleの提供サービス範囲外(財務・税務・法務など)の質問は「Beekleの専門外なので別の専門家へ」と短く返す
- 見積金額・契約条項・法令解釈など断定が危険な内容は具体的な金額・条文を断定せず「ケースバイケース」「専門家へ」と濁す

【NG】
- 回答末尾に「お問い合わせ」「お問い合わせから」「ご相談ください」など定型CTA文言は付けない（UI側でボタン表示するため重複します）`;

const MAX_HISTORY = 12; // 5〜6往復（=10〜12メッセージ）の文脈を保持
const MAX_INPUT_LEN = 800;

type ChatRequestBody = {
  message?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  turnstileToken?: string;
};

export const POST: APIRoute = async ({ locals, request }) => {
  const guard = await aiGuards(locals, request, {
    endpoint: 'chat',
    perMin: 10,
    perDay: 50,
  });
  if (guard instanceof Response) return guard;
  const { env } = guard;

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return jsonError(400, 'invalid_json');
  }

  const message = (body.message ?? '').trim();
  if (!message) return jsonError(400, 'empty_message');
  if (message.length > MAX_INPUT_LEN) return jsonError(400, 'message_too_long');

  const history = (body.history ?? [])
    .slice(-MAX_HISTORY)
    .filter(
      (m) =>
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.length <= MAX_INPUT_LEN
    );

  const model = env.OPENROUTER_MODEL_CHAT ?? 'google/gemini-2.5-flash-lite';

  let references: Awaited<ReturnType<typeof findRelevantColumns>> = [];
  try {
    references = await findRelevantColumns(
      message,
      env.AI,
      {
        CLOUDFLARE_API_TOKEN: env.CLOUDFLARE_API_TOKEN,
        CLOUDFLARE_ACCOUNT_ID: env.CLOUDFLARE_ACCOUNT_ID,
      },
      3
    );
  } catch {
    references = [];
  }
  const systemPrompt = SYSTEM_PROMPT + formatColumnContext(references);

  try {
    const result = await chatCompletionWithBudget(
      env.RATE_LIMIT,
      env.OPENROUTER_API_KEY,
      {
        model,
        max_tokens: 1200,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: message },
        ],
      },
      { referer: 'https://beekle.jp', title: 'Beekle AI IT Advisor' }
    );

    const sanitizedReply = sanitizeReplyUrls(result.text, references);

    return new Response(
      JSON.stringify({
        reply: sanitizedReply,
        usage: result.usage,
        references,
      }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    );
  } catch (err) {
    if (err instanceof OpenRouterError) {
      return jsonError(502, 'upstream_error', err.message);
    }
    return jsonError(500, 'internal_error');
  }
};

// LLM 応答に紛れ込んだ外部ドメイン URL（典型: beekle.co.jp 等の捏造）を物理的に剥がす最終防衛線。
// 参考コラムに含まれない URL や beekle.jp 以外のドメイン URL は文ごと差し替える。
function sanitizeReplyUrls(text: string, references: { url: string }[]): string {
  const allowedRefUrls = new Set(references.map((r) => r.url));
  return text.replace(/https?:\/\/[^\s)）」』]+/g, (match) => {
    try {
      const u = new URL(match);
      if (u.hostname === 'beekle.jp' || u.hostname === 'www.beekle.jp') {
        const path = u.pathname + u.search;
        if (allowedRefUrls.has(path) || path === '/' || path.startsWith('/contact')) {
          return match;
        }
      }
    } catch {
      // 不正 URL は剥がす
    }
    return '[リンク省略]';
  });
}

function jsonError(status: number, code: string, detail?: string): Response {
  return new Response(JSON.stringify({ error: code, ...(detail ? { detail } : {}) }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
