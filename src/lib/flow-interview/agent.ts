import type { Message } from '@/features/flow-interview/types';
import type { FlowDiagram } from '@/features/flow-mapper/types';
import { OpenRouterError, chatCompletionWithBudget } from '@/lib/openrouter';
import { classifyUpstreamError, notifyOpsAlert } from '@/lib/ops-alert';
import { z } from 'zod';
import { LlmDiagramSchema, normalizeToFlowDiagram } from './diagram-schema';
import { type FlowNode, nodeDirective, transition, userTurnCount, wantsToFinish } from './graph';

type KVNamespaceLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
};

const SYSTEM_PROMPT = `あなたはBeekle株式会社の業務ヒアリングAIです。
発注を検討している企業の担当者から、いまの業務の「現状の流れ（As-Is）」を会話で聞き取り、業務フロー図に起こすのが役目です。改善案（To-Be）は作りません。現状をありのまま図にします。

【あなたのキャラクター】
- 聞き上手な相談員。専門用語を避け、相手の言葉で受け止める
- 提案・営業・改善提案はしない。今どうやっているかを丁寧に聞く

【質問してよいのは「フロー」が不明なときだけ】
- 誰が関わるか（担当・部署＝レーン）
- どんな順序で進むか（開始→各作業→完了。分岐があれば条件も）

【質問してよい所要時間（duration ノードでのみ）】
- 各作業のだいたいの所要時間は、改善案(To-Be)のインパクト試算に必要なので、duration ノードで一度だけざっくり聞いてよい（既に本文で時間が分かっていれば聞かない）。回答は step の durationMin（分換算）に入れる

【質問してはいけない（本文から図に書き写すだけ）】
- ツール名（Excel/スプレッドシート/Word/メール/通帳 等）→ 出てきたら step の tool 欄に入れる。**絶対に聞き返さない**
- 件数・困りごと → 出てきたら pain 欄等に入れる。聞き返さない
- **ユーザーの発言に既に含まれている情報は、何があっても二度と質問しない**。図に反映するだけ

【会話ルール — 厳守】
- 1ターンに聞くのは1問だけ。並べて聞かない
- 相手が「わからない」「特に無い」「時間がかかる」など曖昧・短い回答をしたら、それ以上掘らず完成へ向かう
- **同じ趣旨の質問を繰り返さない**（直前と同じ観点の質問は禁止）
- 質問文は40〜100文字、自然な日本語

【完成させるタイミング — 重要】
- ユーザーが「そちらで考えて」「おまかせ」「これで作って」「適当に」「もういい」のように、これ以上の入力を望まない意思を示したら、**それ以上質問せず**、現時点の情報から妥当な順序を自分で推測して図を完成させ、isReady=true にする
- 開始から完了まで一通りの流れが見えたら、深掘りを続けず完成へ向かう
- 同じ質問でループしそうなときは、質問をやめて図を完成させる（isReady=true）
- isReady=true のとき assistantMessage は質問にせず、「現状の流れをまとめました。右の図を確認し、必要なら直接編集できます」のような確認文にする
- 複数の業務（例: 議事録作成と経理）が出てきたら、それぞれを別レーンまたは別フェーズとして1枚の図に整理する

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
  node: FlowNode; // 遷移後の次ノード（セッションに保存して次ターンへ）
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
  currentDiagram: FlowDiagram,
  node: FlowNode
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const turns = userTurnCount(history);
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

  const lastAssistant = [...history].reverse().find((m) => m.role === 'assistant')?.content;
  const repeatGuard = lastAssistant
    ? `\n【直前のあなたの質問】"${lastAssistant.slice(0, 80)}"\nこれと同じ趣旨の質問を繰り返さないこと。`
    : '';

  // ステートマシンのノードが「次に何をするか」を決める
  const directive =
    node === 'done'
      ? '\n\n【完成フェーズ】質問はせず、現時点の情報から妥当な順序を推測して図を完成させ、isReady=true、assistantMessage は確認文にすること。'
      : `\n\n【現在のノード: ${node}｜このノードでやること】${nodeDirective(node)}\nこの観点のみを1問、自然な日本語で聞く。既に分かっている観点・本文に出た情報は聞き返さない。`;

  const dynamicSystem = `【現在の図の状態】
ステップ数: ${currentDiagram.steps.length} / 担当数: ${currentDiagram.lanes.length} / ユーザー回答数: ${turns}
直近の図(参考): ${diagramJson}${repeatGuard}

【このターンの指示】
- 直前のユーザー発言を反映して図を最新化する（既存ステップは保持し、新情報を足す）${directive}`;

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
  currentDiagram: FlowDiagram,
  node: FlowNode
): Promise<FlowAgentResult> {
  const model = env.OPENROUTER_MODEL_HEARING ?? env.OPENROUTER_MODEL_CHAT ?? 'openai/gpt-4o-mini';
  const messages = buildMessages(history, currentDiagram, node);

  // 失敗時はノードも図も変えずに据え置き、再入力を促す
  const fallback: FlowAgentResult = {
    assistantMessage: FALLBACK_REPLY,
    diagram: currentDiagram,
    isReady: false,
    node,
  };

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
    return fallback;
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
      return fallback;
    }
    validated = parseAndValidate(retry.raw);
  }

  if (!validated) return fallback;

  const diagram = normalizeToFlowDiagram(validated.diagram, currentDiagram);
  // LLM が空図を返したら前回の図を維持（情報の後退を防ぐ）
  const finalDiagram = diagram.steps.length === 0 ? currentDiagram : diagram;

  // ステートマシンで次ノードを決定論的に算出（LLM の自己申告 isReady には依存しない）
  const nextNode = transition(node, finalDiagram, {
    finish: wantsToFinish(history),
    turns: userTurnCount(history),
  });
  const isReady = nextNode === 'done';

  // done に入ったのに質問のまま（文中どこかに ? / ？ がある）なら確認文へ差し替え
  const stillAsking = /[?？]/.test(validated.assistantMessage);
  const assistantMessage =
    isReady && stillAsking
      ? 'ここまでの内容で現状フローをまとめました。右の図を確認し、必要なら直接編集できます。改善案やRFPの作成にも進めます。'
      : validated.assistantMessage;

  return { assistantMessage, diagram: finalDiagram, isReady, node: nextNode };
}

function parseAndValidate(raw: string): z.infer<typeof ResponseSchema> | null {
  const parsed = tryParseJson(raw);
  if (!parsed) return null;
  const result = ResponseSchema.safeParse(parsed);
  return result.success ? result.data : null;
}
