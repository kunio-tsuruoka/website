import type { Message } from '@/features/flow-interview/types';
import type { FlowDiagram } from '@/features/flow-mapper/types';
import { OpenRouterError, chatCompletionWithBudget } from '@/lib/openrouter';
import { classifyUpstreamError, notifyOpsAlert } from '@/lib/ops-alert';
import { z } from 'zod';
import { LlmDiagramSchema, normalizeToFlowDiagram } from './diagram-schema';

type KVNamespaceLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
};

const SYSTEM_PROMPT = `あなたはBeekle株式会社の業務ヒアリングAIです。
発注を検討している企業の担当者から、いまの業務の「現状の流れ（As-Is）」を会話で聞き取り、業務フロー図に起こすのが役目です。改善案（To-Be）は作りません。現状をありのまま図にします。

【あなたのキャラクター】
- 聞き上手な相談員。専門用語を避け、相手の言葉で受け止める
- 提案・営業・改善提案はしない。今どうやっているかを丁寧に聞く

【聞き取る観点（現状把握）】
1. その業務は誰が関わるか（担当・部署＝レーン）
2. どんな順序で進むか（開始→各作業→完了。分岐があれば条件も）
3. 各作業で使っているツール（Excel、メール、紙、kintone 等）
4. 時間がかかっている・面倒な箇所（pain）

【会話ルール — 厳守】
- 1ターンに聞くのは1問だけ。並べて聞かない
- まず業務全体をざっくり聞き、次に登場人物→順序→各ステップの詳細、と段階的に具体化する
- 相手が「わからない」「特に無い」と言ったらそれ以上掘らず次へ
- 質問文は40〜100文字、自然な日本語

【図の作り方】
- 毎ターン、これまでの会話から分かる範囲で「現状フロー図」を最新版に更新して出力する
- steps は業務の実際の順序で並べる。最初は type=start、最後は type=end を置く
- 分岐は type=decision。担当が変わるなら lane を分ける
- next は steps 配列の index で指定（省略すると自動で次のstepへ直列接続）。分岐や合流があるときだけ明示する
- 情報が薄い序盤は粗くてよい。会話が進むにつれ steps を増やし具体化する

【出力形式 — 絶対厳守】
出力は **有効な JSON オブジェクト1つだけ**。前置き・後置き・コードフェンス・説明文を一切含めない。先頭は { 末尾は }。

スキーマ:
{
  "diagram": {
    "title": "業務名（例: 月次請求業務）",
    "lanes": ["担当や部署名の配列。1人ならその役割名1つ"],
    "phases": ["大きな工程フェーズがあれば。無ければ1つでよい"],
    "steps": [
      { "label": "作業内容", "type": "start|task|decision|system|wait|end", "lane": "担当名", "phase": "フェーズ名", "durationMin": 所要分(任意), "tool": "使用ツール(任意)", "pain": "困りごと(任意)", "next": [次stepのindex配列(任意)] }
    ]
  },
  "assistantMessage": "次に聞く質問1問（自然な日本語、40〜100文字）",
  "isReady": false
}

- lane / phase の値は必ず lanes / phases 配列に含まれる名前にする
- isReady=true は開始から完了まで一通り流れが揃った時のみ。その時 assistantMessage は「ここまでで現状の流れはこんな形です。追加や修正したい点はありますか?」のような確認文にする`;

const ResponseSchema = z.object({
  diagram: LlmDiagramSchema,
  assistantMessage: z.string(),
  isReady: z.boolean().default(false),
});

export type FlowAgentResult = {
  assistantMessage: string;
  diagram: FlowDiagram;
  isReady: boolean;
};

export type FlowAgentEnv = {
  RATE_LIMIT: KVNamespaceLike;
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL_CHAT?: string;
  OPENROUTER_MODEL_HEARING?: string;
  SLACK_WEBHOOK_URL?: string;
};

const FALLBACK_REPLY =
  '少し回線が混み合っているようです。もう一度送ってもらえますか? 数秒待ってからで大丈夫です。';

export const INITIAL_QUESTION =
  'こんにちは。今の業務の流れを一緒に図にしていきます。まず、どんな業務を整理したいか教えてください。ざっくりで大丈夫です。';

function buildMessages(
  history: Message[],
  currentDiagram: FlowDiagram
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const stepCount = currentDiagram.steps.length;
  const diagramJson = JSON.stringify(
    {
      title: currentDiagram.title,
      lanes: currentDiagram.lanes.map((l) => l.name),
      phases: currentDiagram.phases.map((p) => p.name),
      steps: currentDiagram.steps.map((s) => ({ label: s.label, lane: s.laneId, type: s.type })),
    },
    null,
    0
  );

  const dynamicSystem = `【現在の図の状態】
現状ステップ数: ${stepCount}
直近の図(参考): ${diagramJson}

【このターンの指示】
- 直前のユーザー発言を反映して図を最新化する。既存ステップは保持しつつ、新たに分かった作業・担当・順序を足す
- まだ業務名や登場人物が曖昧なら、それを聞く質問を1つ出す
- 一通り流れが見えてきたら細部（ツール/所要時間/困りごと）を1問ずつ聞く
- assistantMessage は必ず1問だけ`;

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'system', content: dynamicSystem },
  ];
}

function tryParseJson(text: string): unknown {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function callLLMOnce(
  env: FlowAgentEnv,
  model: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  retryHint?: string
): Promise<
  | { raw: string }
  | { errorType: 'upstream'; status: number; message: string }
  | { errorType: 'unknown'; detail: string }
> {
  const finalMessages = retryHint
    ? [...messages, { role: 'system' as const, content: retryHint }]
    : messages;
  try {
    const result = await chatCompletionWithBudget(
      env.RATE_LIMIT,
      env.OPENROUTER_API_KEY,
      {
        model,
        max_tokens: 1500,
        temperature: 0.2,
        messages: finalMessages,
        response_format: { type: 'json_object' },
      },
      { referer: 'https://beekle.jp', title: 'Beekle Flow Interview' }
    );
    return { raw: result.text };
  } catch (err) {
    if (err instanceof OpenRouterError) {
      return { errorType: 'upstream', status: err.status, message: err.message };
    }
    return { errorType: 'unknown', detail: err instanceof Error ? err.message : String(err) };
  }
}

const RETRY_HINT =
  '前回の応答は JSON として読み取れませんでした。次の応答は { から } までの有効な JSON 1つだけ、前置き・コードフェンス・説明文を一切含めずに出力してください。';

/**
 * 1ターン分の対話を進め、現状フロー図を更新して返す。
 * JSON パース失敗時は1回だけリトライ。上流エラー時は Ops アラート + FALLBACK。
 * 失敗時は図を変更せず前回の図を維持する。
 */
export async function runFlowAgentTurn(
  env: FlowAgentEnv,
  history: Message[],
  currentDiagram: FlowDiagram
): Promise<FlowAgentResult> {
  const model = env.OPENROUTER_MODEL_HEARING ?? env.OPENROUTER_MODEL_CHAT ?? 'openai/gpt-4o-mini';
  const messages = buildMessages(history, currentDiagram);

  const attempt = await callLLMOnce(env, model, messages);
  if ('errorType' in attempt) {
    const alertType =
      attempt.errorType === 'upstream'
        ? classifyUpstreamError(attempt.status)
        : 'llm_unknown_error';
    await notifyOpsAlert(env.RATE_LIMIT, env.SLACK_WEBHOOK_URL, alertType, {
      endpoint: '/api/flow',
      model,
      ...(attempt.errorType === 'upstream'
        ? { upstreamStatus: attempt.status, detail: attempt.message }
        : { detail: attempt.detail }),
    });
    return { assistantMessage: FALLBACK_REPLY, diagram: currentDiagram, isReady: false };
  }

  let validated = parseAndValidate(attempt.raw);
  if (!validated) {
    const retry = await callLLMOnce(env, model, messages, RETRY_HINT);
    if ('errorType' in retry) {
      if (retry.errorType === 'upstream') {
        await notifyOpsAlert(
          env.RATE_LIMIT,
          env.SLACK_WEBHOOK_URL,
          classifyUpstreamError(retry.status),
          {
            endpoint: '/api/flow (retry)',
            model,
            upstreamStatus: retry.status,
            detail: retry.message,
          }
        );
      }
      return { assistantMessage: FALLBACK_REPLY, diagram: currentDiagram, isReady: false };
    }
    validated = parseAndValidate(retry.raw);
  }

  if (!validated) {
    return { assistantMessage: FALLBACK_REPLY, diagram: currentDiagram, isReady: false };
  }

  const diagram = normalizeToFlowDiagram(validated.diagram);
  // LLM が空図を返したら前回の図を維持（情報の後退を防ぐ）
  const finalDiagram = diagram.steps.length === 0 ? currentDiagram : diagram;

  return {
    assistantMessage: validated.assistantMessage,
    diagram: finalDiagram,
    isReady: validated.isReady,
  };
}

function parseAndValidate(raw: string): z.infer<typeof ResponseSchema> | null {
  const parsed = tryParseJson(raw);
  if (!parsed) return null;
  const result = ResponseSchema.safeParse(parsed);
  return result.success ? result.data : null;
}
