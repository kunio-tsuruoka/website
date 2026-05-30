import type { FlowDiagram } from '@/features/flow-mapper/types';
import { OpenRouterError, chatCompletionWithBudget } from '@/lib/openrouter';
import { classifyUpstreamError, notifyOpsAlert } from '@/lib/ops-alert';
import { z } from 'zod';

type KVNamespaceLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
};

export const SUGGESTION_KINDS = [
  'automation', // RPA・スクリプトで自動化
  'ai', // AI/LLM で代替・支援
  'integration', // システム連携・データ統合で転記をなくす
  'eliminate', // 作業自体を廃止・統合
  'tool', // 適切なツール導入
  'standardize', // 標準化・テンプレ化
] as const;

const SuggestionSchema = z.object({
  kind: z.enum(SUGGESTION_KINDS),
  target: z.string(), // 対象の作業・領域
  title: z.string(), // 改善案の見出し
  effect: z.string(), // 期待できる効果（時間/コスト/品質）
  detail: z.string(), // 具体的にどうするか（2〜3文）
});

const SuggestResponseSchema = z.object({
  summary: z.string(),
  suggestions: z.array(SuggestionSchema).min(1).max(6),
});

export type FlowSuggestion = z.infer<typeof SuggestionSchema>;
export type FlowSuggestResult = z.infer<typeof SuggestResponseSchema>;

export type SuggestEnv = {
  RATE_LIMIT: KVNamespaceLike;
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL_CHAT?: string;
  OPENROUTER_MODEL_HEARING?: string;
  SLACK_WEBHOOK_URL?: string;
};

const SYSTEM_PROMPT = `あなたはBeekle株式会社の業務改善コンサルタントAIです。
渡された「現状業務フロー（As-Is）」をもとに、システム開発・自動化・AI活用で実現できる改善案（To-Be の方向性）を提案します。

【提案の方針】
- 現状フローの具体的な作業・困りごと・使用ツールに紐づけて提案する。一般論を避ける
- 各提案は「何を」「どう変えるか」「どんな効果か」を具体的に書く
- 効果は現実的に。「劇的」「完全自動化」のような誇張をしない。時間削減/転記ミス削減/属人化解消 など地に足のついた表現
- 3〜5件に絞る。優先度の高い順に並べる
- kind は automation(自動化) / ai(AI活用) / integration(システム連携) / eliminate(作業廃止) / tool(ツール導入) / standardize(標準化) から選ぶ

【出力形式 — 絶対厳守】
有効な JSON オブジェクト1つだけ。前置き・コードフェンス・説明文を含めない。先頭 { 末尾 }。
スキーマ:
{
  "summary": "全体の改善方針を1〜2文で",
  "suggestions": [
    { "kind": "automation|ai|integration|eliminate|tool|standardize",
      "target": "対象の作業や領域（現状フローの言葉で）",
      "title": "改善案の見出し（簡潔に）",
      "effect": "期待できる効果（時間/コスト/品質、現実的に）",
      "detail": "具体的にどう変えるか（2〜3文）" }
  ]
}`;

function diagramToText(d: FlowDiagram): string {
  const laneName = new Map(d.lanes.map((l) => [l.id, l.name]));
  const lines = d.steps.map((s, i) => {
    const lane = laneName.get(s.laneId) ?? '担当';
    const parts = [`${i + 1}. [${lane}] ${s.label}`];
    if (s.tool) parts.push(`ツール:${s.tool}`);
    if (s.durationMin) parts.push(`${s.durationMin}分`);
    if (s.pain) parts.push(`困りごと:${s.pain}`);
    return parts.join(' / ');
  });
  return `業務名: ${d.title}\n登場人物(レーン): ${d.lanes.map((l) => l.name).join(', ')}\n\n現状の作業手順:\n${lines.join('\n')}`;
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

/**
 * As-Is フロー図から改善提案（To-Be 方向性）を1回生成する。
 * JSON パース失敗時は1回リトライ。上流エラーは Ops アラート。失敗時は null。
 */
export async function runSuggest(
  env: SuggestEnv,
  diagram: FlowDiagram
): Promise<FlowSuggestResult | null> {
  const model = env.OPENROUTER_MODEL_HEARING ?? env.OPENROUTER_MODEL_CHAT ?? 'openai/gpt-4o-mini';
  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'user' as const, content: diagramToText(diagram) },
  ];

  const call = async (retryHint?: string): Promise<string | null> => {
    const finalMessages = retryHint
      ? [...messages, { role: 'system' as const, content: retryHint }]
      : messages;
    try {
      const result = await chatCompletionWithBudget(
        env.RATE_LIMIT,
        env.OPENROUTER_API_KEY,
        {
          model,
          max_tokens: 1400,
          temperature: 0.3,
          messages: finalMessages,
          response_format: { type: 'json_object' },
        },
        { referer: 'https://beekle.jp', title: 'Beekle Flow Suggest' }
      );
      return result.text;
    } catch (err) {
      if (err instanceof OpenRouterError) {
        await notifyOpsAlert(
          env.RATE_LIMIT,
          env.SLACK_WEBHOOK_URL,
          classifyUpstreamError(err.status),
          {
            endpoint: '/api/flow/suggest',
            model,
            upstreamStatus: err.status,
            detail: err.message,
          }
        );
      }
      return null;
    }
  };

  let raw = await call();
  let validated = raw ? validate(raw) : null;
  if (!validated) {
    raw = await call(
      '前回の応答は JSON として読み取れませんでした。次は { から } までの有効な JSON 1つだけを出力してください。'
    );
    validated = raw ? validate(raw) : null;
  }
  return validated;
}

function validate(raw: string): FlowSuggestResult | null {
  const parsed = tryParseJson(raw);
  if (!parsed) return null;
  const result = SuggestResponseSchema.safeParse(parsed);
  return result.success ? result.data : null;
}
