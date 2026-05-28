import {
  type HearingProfile,
  HearingProfileSchema,
  type Message,
  completenessScore,
} from '@/features/ai-hearing/types';
import { OpenRouterError, chatCompletionWithBudget } from '@/lib/openrouter';
import { classifyUpstreamError, notifyOpsAlert } from '@/lib/ops-alert';
import { z } from 'zod';

type KVNamespaceLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
};

const SYSTEM_PROMPT = `あなたはBeekle株式会社のシステム発注ヒアリング担当AIです。
発注を検討している企業の担当者に、自然な会話で業務課題と発注要件を整理してもらうのが役目です。

【あなたのキャラクター】
- 落ち着いた、聞き上手な相談員
- 専門用語は避ける、相手の言葉で受け止める
- 提案・営業はしない。聞き役に徹する

【ヒアリング項目（優先順）】
1. 業務課題 (painPoints): 何で困っているか。具体的な作業内容と頻度。最優先で深掘り
2. 影響 (impact): その困りごとの規模感 (月N時間、人数、コスト等)
3. 業種 (industry) と 規模 (companySize: 1-10/11-50/51-200/201-500/500+)
4. フェーズ (phase): discovery(課題はあるが未定) / rfp_prep(RFP準備) / comparing(比較中) / budgeting(予算化中) / decided(発注先内定)
5. 期日感 (timeline): 1_3m / 3_6m / 6_12m / over_12m / unknown
6. 予算感 (budgetRange): under_100 (100万未満) / 100_500 / 500_2000 / over_2000 / unknown
7. 既存システム (existingSystems): 関連するツール名 (Excel, kintone, freee 等)
8. 過去の試み (priorAttempts): 過去にやって失敗したこと

【会話ルール — 厳守】
- 1ターンに聞くのは1問だけ。並べて聞かない
- ユーザーが1発言で複数項目を埋めたら、その分は触れず次の未充足項目へ
- 「予算」「金額」を最初に聞かない。課題→規模→制約 の順で温度を上げる
- 相手が「わからない」「未定」「特に無し」「あまり」等の曖昧回答を返したら、その項目はそれ以上掘らず即座に別の未充足項目へ移る
- 同じ項目を3往復以上掘らない。例えば painPoints の頻度→影響→詳細と3問続けたら、次は別カテゴリ (業種/規模/フェーズ/タイムライン 等) へ
- 1ターンの質問文は60〜120文字、自然な日本語で
- 既に painPoints に1つでも入っていて、まだ industry / companySize / phase が空なら、それらを優先的に聞く

【プロファイル抽出ルール】
- ユーザー発言から該当項目を抽出して profileUpdate に入れる
- 配列項目 (painPoints/existingSystems等) は既存配列に追加する分だけ返す (差分)
- 不明な項目は null や省略のままにする (推測で埋めない)
- 連絡先 (contactEmail/contactName/contactCompany) はユーザーが明示的に伝えた場合のみ

【出力形式 — 絶対厳守】
出力は **有効な JSON オブジェクト1つだけ**。前置き・後置き・改行・コードフェンス・説明文 一切禁止。
JSON 以外の文字を1文字でも出力すると壊れる。先頭は必ず { で始まり末尾は } で終わる。

スキーマ:
{
  "profileUpdate": { ...対応する項目だけ。空なら {} },
  "nextQuestion": "次に聞く質問1問（自然な日本語、60〜120文字）",
  "isReady": false,
  "summary": null
}

- isReady=true は十分情報が集まった時のみ。その時は summary に300〜500文字で状況サマリを書き、nextQuestion は「以上で大丈夫そうですが、何か追加で伝えたいことはありますか?」のような確認文にする
- profileUpdate に入れる値の型 (enum, 配列, null) は仕様に従う。型が違うと無効
`;

const ResponseSchema = z.object({
  profileUpdate: z
    .object({
      industry: z.string().nullable().optional(),
      companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).nullable().optional(),
      phase: z
        .enum(['discovery', 'rfp_prep', 'comparing', 'budgeting', 'decided'])
        .nullable()
        .optional(),
      painPoints: z.array(z.string()).optional(),
      currentWorkaround: z.string().nullable().optional(),
      impact: z.string().nullable().optional(),
      existingSystems: z.array(z.string()).optional(),
      dataSources: z.array(z.string()).optional(),
      budgetRange: z
        .enum(['unknown', 'under_100', '100_500', '500_2000', 'over_2000'])
        .nullable()
        .optional(),
      timeline: z.enum(['unknown', '1_3m', '3_6m', '6_12m', 'over_12m']).nullable().optional(),
      decisionMakers: z.array(z.string()).optional(),
      priorAttempts: z.array(z.string()).optional(),
      successCriteria: z.array(z.string()).optional(),
      contactEmail: z.string().nullable().optional(),
      contactName: z.string().nullable().optional(),
      contactCompany: z.string().nullable().optional(),
    })
    .default({}),
  nextQuestion: z.string(),
  isReady: z.boolean().default(false),
  summary: z.string().nullable().default(null),
});

export type AgentTurnResult = {
  assistantMessage: string;
  profile: HearingProfile;
  isReady: boolean;
  summary: string | null;
};

export type AgentEnv = {
  RATE_LIMIT: KVNamespaceLike;
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL_CHAT?: string;
  OPENROUTER_MODEL_HEARING?: string;
  SLACK_WEBHOOK_URL?: string;
};

const FALLBACK_REPLY =
  '少し回線が混み合っているようです。もう一度送ってもらえますか? 数秒待ってからで大丈夫です。';

function buildMessagesForLLM(
  history: Message[],
  profile: HearingProfile
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const score = completenessScore(profile);

  // 動的に「次に聞くべき項目候補」を組み立てる。LLM が同じ軸を掘り続けるのを止める安全網
  const missingTargets: string[] = [];
  if (!profile.industry) missingTargets.push('industry (業種)');
  if (!profile.companySize)
    missingTargets.push('companySize (規模: 1-10 / 11-50 / 51-200 / 201-500 / 500+ から選ぶ)');
  if (!profile.phase)
    missingTargets.push(
      'phase (検討フェーズ: discovery / rfp_prep / comparing / budgeting / decided)'
    );
  if (!profile.timeline) missingTargets.push('timeline (期日感: 1_3m / 3_6m / 6_12m / over_12m)');
  if (!profile.budgetRange)
    missingTargets.push('budgetRange (予算感: under_100 / 100_500 / 500_2000 / over_2000)');
  if (profile.existingSystems.length === 0)
    missingTargets.push('existingSystems (既存ツール名: Excel, kintone, freee 等)');
  if (!profile.impact && profile.painPoints.length > 0)
    missingTargets.push('impact (困りごとの規模感: 月N時間、人数、コスト等)');

  const painCount = profile.painPoints.length;
  const painGuidance =
    painCount >= 3
      ? `painPoints は既に ${painCount} 件登録済み。これ以上 painPoints の深掘り質問は絶対禁止。必ず未充足項目から1問選ぶ。`
      : `painPoints は現在 ${painCount} 件。具体性が薄い時のみあと1問の深掘り可。3件超えたら必ず別カテゴリへ。`;

  const lastAssistantMessage = [...history].reverse().find((m) => m.role === 'assistant')?.content;
  const repeatGuard = lastAssistantMessage
    ? `\n\n【直前のあなたの質問】\n"${lastAssistantMessage.slice(0, 120)}"\n直前と同じ趣旨・同じ表現の質問を繰り返してはいけません。必ず別の角度の質問を出すこと。`
    : '';

  const nextTargetsSection =
    missingTargets.length > 0
      ? `\n\n【次質問で必ず選ぶ候補】 以下のうち1つを選んで質問する。これ以外の軸は禁止。\n${missingTargets.map((t) => `- ${t}`).join('\n')}\n\n推奨順序: industry → companySize → phase → impact → timeline → budgetRange → existingSystems`
      : '\n\n【充足完了】主要項目はほぼ揃った。isReady=true で summary を生成し、nextQuestion は「以上で大丈夫そうですが、何か追加で伝えたいことはありますか?」とする。';

  const profileSummary = JSON.stringify(profile, null, 2);

  // 動的ガイダンスを「会話の最後」に system role で投入する。
  // 先頭の SYSTEM_PROMPT (キャラクター・形式) と最後の動的指示 (次の行動) を分離。
  const dynamicSystem = `【ターン直前の状況確認】
現時点のプロファイル: ${profileSummary}
充足率: ${score.filled}/${score.total} (ready=${score.ready})

【painPoints ガイダンス】
${painGuidance}${repeatGuard}${nextTargetsSection}

【次の出力】
profileUpdate には今のユーザー発言から確実に読み取れる項目だけ入れる。推測で別項目に値を割り当てない (例: ユーザーが「5人くらい」と言った文脈が impact なら impact だけ、companySize と決めつけない)。
nextQuestion は上の候補リストから 1 つの軸を選んで、自然な日本語で 1 問だけ書く。`;

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'system', content: dynamicSystem },
  ];
}

function mergeProfile(
  base: HearingProfile,
  delta: z.infer<typeof ResponseSchema>['profileUpdate']
): HearingProfile {
  const next: HearingProfile = { ...base };
  if (delta.industry !== undefined) next.industry = delta.industry ?? next.industry;
  if (delta.companySize !== undefined) next.companySize = delta.companySize ?? next.companySize;
  if (delta.phase !== undefined) next.phase = delta.phase ?? next.phase;
  if (delta.currentWorkaround !== undefined)
    next.currentWorkaround = delta.currentWorkaround ?? next.currentWorkaround;
  if (delta.impact !== undefined) next.impact = delta.impact ?? next.impact;
  if (delta.budgetRange !== undefined) next.budgetRange = delta.budgetRange ?? next.budgetRange;
  if (delta.timeline !== undefined) next.timeline = delta.timeline ?? next.timeline;
  if (delta.contactEmail !== undefined) next.contactEmail = delta.contactEmail ?? next.contactEmail;
  if (delta.contactName !== undefined) next.contactName = delta.contactName ?? next.contactName;
  if (delta.contactCompany !== undefined)
    next.contactCompany = delta.contactCompany ?? next.contactCompany;

  const appendUnique = (cur: string[], add?: string[]): string[] => {
    if (!add || add.length === 0) return cur;
    const seen = new Set(cur);
    const out = [...cur];
    for (const v of add) {
      const trimmed = v.trim();
      if (!trimmed || seen.has(trimmed)) continue;
      out.push(trimmed);
      seen.add(trimmed);
    }
    return out;
  };

  next.painPoints = appendUnique(next.painPoints, delta.painPoints);
  next.existingSystems = appendUnique(next.existingSystems, delta.existingSystems);
  next.dataSources = appendUnique(next.dataSources, delta.dataSources);
  next.decisionMakers = appendUnique(next.decisionMakers, delta.decisionMakers);
  next.priorAttempts = appendUnique(next.priorAttempts, delta.priorAttempts);
  next.successCriteria = appendUnique(next.successCriteria, delta.successCriteria);

  // 最終 zod 検証で防御
  const result = HearingProfileSchema.safeParse(next);
  return result.success ? result.data : base;
}

function tryParseJson(text: string): unknown {
  // 余計な前置き・後置き、コードフェンスを許容して JSON 部分を切り出す
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
  env: AgentEnv,
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
        max_tokens: 900,
        temperature: 0.2,
        messages: finalMessages,
        response_format: { type: 'json_object' },
      },
      { referer: 'https://beekle.jp', title: 'Beekle AI Hearing' }
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
 * 1ターン分の対話を進める。
 * - JSON パース失敗時は1回だけリトライ (温度低下 + 強制プロンプト)
 * - LLM 上流エラー時 (4xx/5xx) は Slack に Ops アラート + FALLBACK_REPLY
 * - 2回ともパース失敗時は FALLBACK_REPLY、profile は変更しない
 */
export async function runAgentTurn(
  env: AgentEnv,
  history: Message[],
  profile: HearingProfile
): Promise<AgentTurnResult> {
  // ヒアリング専用モデルを優先 (JSON 出力厳守と instruction-following が必要)
  const model =
    env.OPENROUTER_MODEL_HEARING ??
    env.OPENROUTER_MODEL_CHAT ??
    'openai/gpt-4o-mini';
  const messages = buildMessagesForLLM(history, profile);

  // 1回目
  const attempt = await callLLMOnce(env, model, messages);
  if ('errorType' in attempt) {
    if (attempt.errorType === 'upstream') {
      const alertType = classifyUpstreamError(attempt.status);
      await notifyOpsAlert(env.RATE_LIMIT, env.SLACK_WEBHOOK_URL, alertType, {
        endpoint: '/api/hearing',
        model,
        upstreamStatus: attempt.status,
        detail: attempt.message,
      });
    } else {
      await notifyOpsAlert(env.RATE_LIMIT, env.SLACK_WEBHOOK_URL, 'llm_unknown_error', {
        endpoint: '/api/hearing',
        model,
        detail: attempt.detail,
      });
    }
    return { assistantMessage: FALLBACK_REPLY, profile, isReady: false, summary: null };
  }

  let parsed = tryParseJson(attempt.raw);
  let validated = parsed ? ResponseSchema.safeParse(parsed) : null;

  // JSON パース失敗 → 1回だけリトライ (強制プロンプト付き)
  if (!validated || !validated.success) {
    const retry = await callLLMOnce(env, model, messages, RETRY_HINT);
    if ('errorType' in retry) {
      // リトライで上流エラーになった場合のみ通知 (1回目成功なら通知しない)
      if (retry.errorType === 'upstream') {
        const alertType = classifyUpstreamError(retry.status);
        await notifyOpsAlert(env.RATE_LIMIT, env.SLACK_WEBHOOK_URL, alertType, {
          endpoint: '/api/hearing (retry)',
          model,
          upstreamStatus: retry.status,
          detail: retry.message,
        });
      }
      return { assistantMessage: FALLBACK_REPLY, profile, isReady: false, summary: null };
    }
    parsed = tryParseJson(retry.raw);
    validated = parsed ? ResponseSchema.safeParse(parsed) : null;
  }

  if (!validated || !validated.success) {
    return { assistantMessage: FALLBACK_REPLY, profile, isReady: false, summary: null };
  }

  const nextProfile = mergeProfile(profile, validated.data.profileUpdate);
  const score = completenessScore(nextProfile);

  return {
    assistantMessage: validated.data.nextQuestion,
    profile: nextProfile,
    isReady: validated.data.isReady || score.ready,
    summary: validated.data.summary,
  };
}

export const INITIAL_QUESTION =
  'はじめまして。Beekleの相談AIです。今日はどんなお悩みで来てくださいましたか? 業務で困っていること、ざっくりで構いません。';
