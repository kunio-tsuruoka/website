import type { FlowDiagram } from '@/features/flow-mapper/types';
import { OpenRouterError, chatCompletionWithBudget } from '@/lib/openrouter';
import { classifyUpstreamError, notifyOpsAlert } from '@/lib/ops-alert';
import { z } from 'zod';
import { formatDuration } from './format';
import type { FlowSuggestion } from './suggest';

type KVNamespaceLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
};

const UserStorySchema = z.object({
  role: z.string(), // 誰が（As a）
  want: z.string(), // 何をしたい（I want）
  benefit: z.string(), // なぜ（So that）
  acceptance: z.array(z.string()).default([]), // 受け入れ条件
});

const RfpSchema = z.object({
  title: z.string(),
  background: z.string(),
  asIsSummary: z.string(),
  toBeSummary: z.string(),
  userStories: z.array(UserStorySchema).min(1).max(10),
  nonFunctional: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  proposalRequests: z.array(z.string()).default([]),
});

export type FlowRfp = z.infer<typeof RfpSchema>;

export type RfpEnv = {
  RATE_LIMIT: KVNamespaceLike;
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL_CHAT?: string;
  OPENROUTER_MODEL_HEARING?: string;
  SLACK_WEBHOOK_URL?: string;
};

const SYSTEM_PROMPT = `あなたはBeekle株式会社の発注支援AIです。
渡された「現状業務フロー（As-Is）」と「改善案（To-Be）」をもとに、システム開発の発注に使えるRFP（提案依頼書）のドラフトを作ります。要件はユーザーストーリー形式で書きます。

【方針】
- 発注者（非エンジニア）がそのままベンダーに渡せる、平易で具体的な日本語
- ユーザーストーリーは「誰が(role)／何をしたい(want)／なぜ(benefit)」の3点 + 受け入れ条件(acceptance)
- 現状フローと改善案に出てきた作業・困りごとに紐づける。一般論や誇張を避ける
- ユーザーストーリーは3〜7件に絞る。優先度の高い順
- 非機能要件・制約・提案依頼事項は、分かる範囲で簡潔に。不明な点は「要相談」と書く

【出力形式 — 絶対厳守】
有効な JSON オブジェクト1つだけ。前置き・コードフェンス・説明文を含めない。先頭 { 末尾 }。
スキーマ:
{
  "title": "RFPのタイトル（業務名を含む）",
  "background": "背景・目的（なぜ刷新/開発するか。2〜4文）",
  "asIsSummary": "現状業務の要約（2〜3文）",
  "toBeSummary": "目指す姿の要約（2〜3文）",
  "userStories": [
    { "role": "誰が", "want": "何をしたい", "benefit": "なぜ", "acceptance": ["受け入れ条件1", "条件2"] }
  ],
  "nonFunctional": ["非機能要件（性能/セキュリティ/可用性 等、分かる範囲で）"],
  "constraints": ["制約・前提（既存システム/予算感/時期 等、不明なら要相談）"],
  "proposalRequests": ["ベンダーに提案してほしい事項"]
}`;

function buildUserContent(
  diagram: FlowDiagram,
  suggestions: FlowSuggestion[],
  summary: string | null
): string {
  const laneName = new Map(diagram.lanes.map((l) => [l.id, l.name]));
  const steps = diagram.steps
    .map((s, i) => {
      const lane = laneName.get(s.laneId) ?? '担当';
      const extra = [
        s.durationMin > 0 && `所要時間:${formatDuration(s.durationMin)}`,
        s.tool && `ツール:${s.tool}`,
        s.pain && `困りごと:${s.pain}`,
      ]
        .filter(Boolean)
        .join(' / ');
      return `${i + 1}. [${lane}] ${s.label}${extra ? ` (${extra})` : ''}`;
    })
    .join('\n');
  const totalMin = diagram.steps.reduce((sum, s) => sum + (s.durationMin || 0), 0);
  const totalLine = totalMin > 0 ? `\n1サイクルの合計作業時間: 約${formatDuration(totalMin)}` : '';

  const sug =
    suggestions.length > 0
      ? `\n\n【改善案（To-Be）】\n${summary ? `方針: ${summary}\n` : ''}${suggestions
          .map((s) => `- [${s.kind}] ${s.title}: ${s.detail}（効果: ${s.effect}）`)
          .join('\n')}`
      : '';

  return `【現状業務フロー（As-Is）】\n業務名: ${diagram.title}\n登場人物: ${diagram.lanes
    .map((l) => l.name)
    .join(
      ', '
    )}\n手順:\n${steps}${totalLine}${sug}\n\n※所要時間が分かる作業は、改善後の削減効果（時間・コスト）に必ず言及すること。`;
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

export async function runRfp(
  env: RfpEnv,
  diagram: FlowDiagram,
  suggestions: FlowSuggestion[],
  summary: string | null
): Promise<FlowRfp | null> {
  const model = env.OPENROUTER_MODEL_HEARING ?? env.OPENROUTER_MODEL_CHAT ?? 'openai/gpt-4o-mini';
  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'user' as const, content: buildUserContent(diagram, suggestions, summary) },
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
          max_tokens: 2000,
          temperature: 0.3,
          messages: finalMessages,
          response_format: { type: 'json_object' },
        },
        { referer: 'https://beekle.jp', title: 'Beekle Flow RFP' }
      );
      return result.text;
    } catch (err) {
      if (err instanceof OpenRouterError) {
        await notifyOpsAlert(
          env.RATE_LIMIT,
          env.SLACK_WEBHOOK_URL,
          classifyUpstreamError(err.status),
          {
            endpoint: '/api/flow/rfp',
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

function validate(raw: string): FlowRfp | null {
  const parsed = tryParseJson(raw);
  if (!parsed) return null;
  const result = RfpSchema.safeParse(parsed);
  return result.success ? result.data : null;
}

/** 構造化された RFP を決定論的に Markdown へ整形する（LLM に markdown を書かせない＝崩れ防止）。 */
export function formatRfpMarkdown(rfp: FlowRfp, diagram?: FlowDiagram): string {
  const lines: string[] = [];
  lines.push(`# ${rfp.title}`);
  lines.push('');
  lines.push('## 1. 背景・目的');
  lines.push('');
  lines.push(rfp.background);
  lines.push('');
  lines.push('## 2. 現状業務（As-Is）');
  lines.push('');
  lines.push(rfp.asIsSummary);
  lines.push('');
  // 会話で把握した現状フローを、担当・所要時間・ツール・困りごと付きで列挙する
  if (diagram && diagram.steps.length > 0) {
    const laneName = new Map(diagram.lanes.map((l) => [l.id, l.name]));
    lines.push('### 現状フロー（ステップ詳細）');
    lines.push('');
    diagram.steps.forEach((s, i) => {
      const lane = laneName.get(s.laneId) ?? '担当';
      const meta = [
        s.durationMin > 0 && `所要時間 ${formatDuration(s.durationMin)}`,
        s.tool && `ツール: ${s.tool}`,
        s.pain && `課題: ${s.pain}`,
      ].filter(Boolean);
      lines.push(`${i + 1}. **[${lane}]** ${s.label}`);
      if (meta.length > 0) lines.push(`   - ${meta.join(' / ')}`);
    });
    const totalMin = diagram.steps.reduce((sum, s) => sum + (s.durationMin || 0), 0);
    if (totalMin > 0) {
      lines.push('');
      lines.push(`> 1サイクルあたりの合計作業時間: 約${formatDuration(totalMin)}`);
    }
    lines.push('');
  }
  lines.push('## 3. 目指す姿（To-Be）');
  lines.push('');
  lines.push(rfp.toBeSummary);
  lines.push('');
  lines.push('## 4. 機能要件（ユーザーストーリー）');
  lines.push('');
  rfp.userStories.forEach((s, i) => {
    const id = `US-${String(i + 1).padStart(2, '0')}`;
    lines.push(`### ${id}`);
    lines.push('');
    lines.push(`- **誰が（As a）**: ${s.role}`);
    lines.push(`- **何をしたい（I want）**: ${s.want}`);
    lines.push(`- **なぜ（So that）**: ${s.benefit}`);
    if (s.acceptance.length > 0) {
      lines.push('- **受け入れ条件**:');
      for (const a of s.acceptance) lines.push(`  - ${a}`);
    }
    lines.push('');
  });

  const section = (title: string, items: string[]) => {
    lines.push(title);
    lines.push('');
    if (items.length > 0) {
      for (const it of items) lines.push(`- ${it}`);
    } else {
      lines.push('- 要相談');
    }
    lines.push('');
  };
  section('## 5. 非機能要件', rfp.nonFunctional);
  section('## 6. 制約・前提', rfp.constraints);
  section('## 7. ご提案いただきたい事項', rfp.proposalRequests);

  lines.push('---');
  lines.push('');
  lines.push(
    'このRFPドラフトは Beekle「話すだけ発注準備」で生成されました。内容のブラッシュアップや開発のご相談は https://beekle.jp/contact までお気軽に。'
  );
  return lines.join('\n');
}
