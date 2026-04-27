import type { APIRoute } from 'astro';

export const prerender = false;

type RequestBody = {
  description?: string;
  unwantedCount?: number;
  happyCount?: number;
  boundaryCount?: number;
};

type EarsType = '常時' | 'イベント駆動' | '状態駆動' | 'オプション' | '異常系';
type Priority = '必須' | '推奨' | '任意';

type Requirement = {
  id: string;
  type: EarsType;
  priority: Priority;
  origin: string;
  text: string;
  category?: string;
};

type UseCase = {
  id: string;
  name: string;
  summary: string;
  actors: { main: string; related: string[] };
  businessValue: string[];
  preconditions: string[];
  happy: Requirement[];
  unwanted: Requirement[];
  boundary: Requirement[];
  ui: { element: string; content: string }[];
  notifications: string[];
  checklist: string[];
};

type ApiResult = {
  title: string;
  intro: string;
  story: {
    systemName: string;
    role: string;
    want: string;
    benefit: string;
  };
  usecase: UseCase;
};

const MODEL = 'anthropic/claude-3.5-haiku';
const DEFAULTS = { happy: 5, unwanted: 4, boundary: 2 };

function buildPrompt(body: RequestBody): string {
  const description = body.description?.trim() ?? '';
  const happyCount = clamp(body.happyCount ?? DEFAULTS.happy, 3, 8);
  const unwantedCount = clamp(body.unwantedCount ?? DEFAULTS.unwanted, 3, 8);
  const boundaryCount = clamp(body.boundaryCount ?? DEFAULTS.boundary, 1, 5);

  return `あなたは要件定義の専門家です。以下の自然文（やりたいことの説明）から、非エンジニアの経営者・現場リーダーが読んでレビューできる「ユーザーストーリー仕様書」を1ユースケース分だけ作成してください。

# 入力された説明文
${description}

# 出力ルール
- 必ず JSON のみを出力（前後に説明やコードブロックは不要）
- 各要求文は EARS（Easy Approach to Requirements Syntax）で記述
- 種別は次のいずれか: 常時 / イベント駆動 / 状態駆動 / オプション / 異常系
- 優先度は次のいずれか: 必須 / 推奨 / 任意
- ID 形式: REQ-{ユースケースID}-{連番3桁}
  - 正常系: 001〜
  - 異常系: 101〜
  - 境界値: 201〜
- ユースケースID は「業務ドメイン2〜3文字-連番」の形式（例: SA-1, OR-1, EX-1）
- 由来は「元仕様」「ヒアリング議事録」「運用要望」「AI推測」などから選択
- 業務上ありえないSF的シナリオは避け、現実的なケースに絞る

# 件数
- 正常系: ${happyCount}件（常時/イベント駆動/状態駆動 を散らす）
- 異常系: ${unwantedCount}件（入力検証/通信障害/競合状態/データ整合性/認証認可/セキュリティ/境界値 から散らす）
- 境界値: ${boundaryCount}件（数量・期間・文字数の境目）

# JSONスキーマ
{
  "title": "<システム名> ユーザーストーリー仕様書",
  "intro": "このドキュメントの目的を1〜2文で",
  "story": {
    "systemName": "対象システム名",
    "role": "メインアクター",
    "want": "やりたいこと（1文）",
    "benefit": "得たい価値（1文）"
  },
  "usecase": {
    "id": "SA-1",
    "name": "ユースケース名（短く）",
    "summary": "ユースケースの概要（2〜3文）",
    "actors": { "main": "主役", "related": ["関係者1", "関係者2"] },
    "businessValue": ["価値1（業務観点）", "価値2", "価値3"],
    "preconditions": ["前提1", "前提2"],
    "happy": [
      { "id": "REQ-SA-1-001", "type": "イベント駆動", "priority": "必須", "origin": "AI推測", "text": "EARS要求文" }
    ],
    "unwanted": [
      { "id": "REQ-SA-1-101", "type": "異常系", "priority": "必須", "origin": "AI推測", "category": "通信障害", "text": "もし<条件>の場合、<システム>は、<挙動>すること。" }
    ],
    "boundary": [
      { "id": "REQ-SA-1-201", "type": "イベント駆動", "priority": "必須", "origin": "AI推測", "text": "EARS要求文" }
    ],
    "ui": [
      { "element": "ページタイトル", "content": "..." },
      { "element": "ボタン", "content": "..." }
    ],
    "notifications": ["通知1の発火条件と本文要点"],
    "checklist": ["非エンジニアがOK判定するためのチェック1", "チェック2"]
  }
}`;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(Math.max(Math.floor(n), lo), hi);
}

function parse(text: string): ApiResult {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '');
  const parsed = JSON.parse(cleaned) as Partial<ApiResult>;

  const story = parsed.story ?? { systemName: '', role: '', want: '', benefit: '' };
  const usecase = parsed.usecase as Partial<UseCase> | undefined;

  return {
    title: parsed.title?.trim() || `${story.systemName || 'システム'} ユーザーストーリー仕様書`,
    intro: parsed.intro?.trim() || '',
    story: {
      systemName: story.systemName?.trim() || 'システム',
      role: story.role?.trim() || 'ユーザー',
      want: story.want?.trim() || '',
      benefit: story.benefit?.trim() || '',
    },
    usecase: {
      id: usecase?.id?.trim() || 'UC-1',
      name: usecase?.name?.trim() || 'ユースケース',
      summary: usecase?.summary?.trim() || '',
      actors: {
        main: usecase?.actors?.main?.trim() || story.role?.trim() || 'ユーザー',
        related: usecase?.actors?.related ?? [],
      },
      businessValue: usecase?.businessValue ?? [],
      preconditions: usecase?.preconditions ?? [],
      happy: normalizeReqs(usecase?.happy, 'イベント駆動'),
      unwanted: normalizeReqs(usecase?.unwanted, '異常系'),
      boundary: normalizeReqs(usecase?.boundary, 'イベント駆動'),
      ui: usecase?.ui ?? [],
      notifications: usecase?.notifications ?? [],
      checklist: usecase?.checklist ?? [],
    },
  };
}

function normalizeReqs(reqs: Requirement[] | undefined, defaultType: EarsType): Requirement[] {
  if (!Array.isArray(reqs)) return [];
  return reqs.map((r) => ({
    id: r.id?.trim() || '',
    type: (['常時', 'イベント駆動', '状態駆動', 'オプション', '異常系'] as EarsType[]).includes(
      r.type
    )
      ? r.type
      : defaultType,
    priority: (['必須', '推奨', '任意'] as Priority[]).includes(r.priority) ? r.priority : '推奨',
    origin: r.origin?.trim() || 'AI推測',
    text: r.text?.trim() || '',
    category: r.category?.trim(),
  }));
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const runtime = (locals as { runtime?: { env?: { OPENROUTER_API_KEY?: string } } }).runtime;
    const apiKey = runtime?.env?.OPENROUTER_API_KEY ?? import.meta.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return json(500, { success: false, error: 'OPENROUTER_API_KEY is not configured' });
    }

    const body = (await request.json()) as RequestBody;
    if (!body.description?.trim()) {
      return json(400, { success: false, error: '説明文を入力してください' });
    }

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: buildPrompt(body) }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return json(502, { success: false, error: 'OpenRouter API error', detail });
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = data.choices?.[0]?.message?.content ?? '';
    const result = parse(text);

    return json(200, { success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json(500, { success: false, error: 'Failed to generate', detail: message });
  }
};

function json(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
