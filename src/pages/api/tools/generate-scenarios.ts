import type { APIRoute } from 'astro';

export const prerender = false;

type RequestBody = {
  systemName?: string;
  story?: { role?: string; want?: string; benefit?: string };
  happyPath?: string[];
  count?: number;
};

type Scenario = {
  id: string;
  category: string;
  condition: string;
  expected: string;
  earsText: string;
};

const MODEL = 'anthropic/claude-3.5-haiku';
const MAX_COUNT = 12;
const DEFAULT_COUNT = 6;

function buildPrompt(body: RequestBody): string {
  const sys = body.systemName?.trim() || 'システム';
  const role = body.story?.role?.trim() || 'ユーザー';
  const want = body.story?.want?.trim() || '機能';
  const benefit = body.story?.benefit?.trim() || '価値を得る';
  const count = Math.min(Math.max(body.count ?? DEFAULT_COUNT, 1), MAX_COUNT);
  const happy = (body.happyPath ?? []).filter(Boolean).join('\n  - ');

  return `あなたは要件定義の専門家です。以下のユーザーストーリーから、見落としやすい異常系シナリオを${count}件生成してください。

# 対象システム
${sys}

# ユーザーストーリー
- ロール: ${role}
- やりたいこと: ${want}
- ねらい: ${benefit}

# 既存の正常系EARS要求文
  - ${happy || '（未指定）'}

# 出力ルール
- 必ず JSON のみを出力（前後に説明やコードブロックを付けない）
- スキーマ: { "scenarios": [ { "id": "REQ-UNW-XXX", "category": "入力検証 | 認証認可 | 通信障害 | データ整合性 | 競合状態 | 境界値 | セキュリティ | パフォーマンス | 運用障害 のいずれか", "condition": "発生条件（日本語）", "expected": "システムが取るべき挙動（日本語）", "earsText": "もし<条件>の場合、<システム名>は、<挙動>すること。" } ] }
- id は REQ-UNW-001 から連番
- 同じカテゴリで重複しないように観点を散らす
- 業務上ありえないSF的シナリオは避け、現実的な失敗ケースに絞る
- earsText は EARS の Unwanted パターン（「もし〜の場合、〜は、〜すること。」）に必ず従う`;
}

function parseScenarios(text: string): Scenario[] {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '');
  const parsed = JSON.parse(cleaned) as { scenarios?: Scenario[] };
  if (!Array.isArray(parsed.scenarios)) {
    throw new Error('Invalid response: scenarios array missing');
  }
  return parsed.scenarios.map((s, i) => ({
    id: s.id?.trim() || `REQ-UNW-${String(i + 1).padStart(3, '0')}`,
    category: s.category?.trim() || 'その他',
    condition: s.condition?.trim() || '',
    expected: s.expected?.trim() || '',
    earsText: s.earsText?.trim() || '',
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
    if (!body.story?.want?.trim()) {
      return json(400, { success: false, error: '「やりたいこと」は必須です' });
    }

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: buildPrompt(body) }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return json(502, { success: false, error: 'OpenRouter API error', detail });
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content ?? '';
    const scenarios = parseScenarios(text);

    return json(200, { success: true, scenarios });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json(500, { success: false, error: 'Failed to generate scenarios', detail: message });
  }
};

function json(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
