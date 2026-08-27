import { chatCompletion } from '@/lib/openrouter';
import { parseStorySpecJson } from '@/lib/story-spec';
import type { APIRoute } from 'astro';

export const prerender = false;

type RequestBody = {
  description?: string;
};

// recommend-system の UNDERSTAND_MODEL（中村選定）。OpenRouter スラッグは同リポ wrangler.toml の記載どおり
const DEFAULT_MODEL = 'qwen/qwen3-30b-a3b';

function buildPrompt(description: string): string {
  return `あなたは要件定義の専門家です。発注側の担当者が書いた「やりたいこと」から、PM on Rails と同じ粒度で要件を整理してください。

# 入力
${description}

# 整理の順番
1. 現状（As-Is）と目指す姿（To-Be）を分ける。入力に現状が薄くても、書かれている範囲だけ書く。一般論で埋めない
2. ユーザーストーリーは「登場人物の目標」単位。システム機能の一覧にしない。3〜6件
3. 各ストーリーにシナリオを付ける。正常系1〜2、異常系1、必要なら境界1。画面名やボタン名は業務シナリオ（normal / error / boundary）に書かない
4. シナリオは「前提 / 操作 / 結果」。操作は意図した行為を1つ。結果は業務上の帰結。現在形・三人称
5. 非機能・制約・提案依頼は分かる範囲だけ。不明なら空配列

# 出力
有効な JSON オブジェクト1つだけ。前置き・コードフェンス・説明は出さない。

{
  "title": "業務名を含むタイトル",
  "background": "なぜ今これを整理するか（2〜4文。入力に根拠があることだけ）",
  "asIs": {
    "summary": "いまどうやっているか（2〜3文）",
    "actors": ["登場人物"],
    "tools": ["使っているもの"],
    "pains": ["困りごと"]
  },
  "toBe": {
    "summary": "実現したい姿（2〜3文）",
    "outcomes": ["実現したいこと"]
  },
  "stories": [
    {
      "id": "US-01",
      "role": "誰が",
      "want": "何をしたいか",
      "benefit": "なぜか",
      "priority": "必須",
      "scenarios": [
        {
          "id": "SC-US-01-N1",
          "title": "短いタイトル",
          "type": "normal",
          "given": "前提（Given と書かない）",
          "when": "操作1つ（When と書かない）",
          "then": "結果。複数なら改行で続ける"
        }
      ]
    }
  ],
  "nonFunctional": ["分かる範囲の非機能"],
  "constraints": ["分かる範囲の制約"],
  "proposalRequests": ["ベンダーに聞いてほしいこと"]
}

# 禁止
- EARS 記法、REQ-ID、イベント駆動などの専門ラベル
- 画面名・ボタン名を normal / error / boundary に書くこと
- 入力にない数値・固有名詞の捏造
- 「自分が思う」「重要なポイントは」などの前置き`;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const runtime = (
      locals as {
        runtime?: { env?: { OPENROUTER_API_KEY?: string; OPENROUTER_MODEL_TOOLS?: string } };
      }
    ).runtime;
    const apiKey = runtime?.env?.OPENROUTER_API_KEY ?? import.meta.env.OPENROUTER_API_KEY;
    const model =
      runtime?.env?.OPENROUTER_MODEL_TOOLS ??
      import.meta.env.OPENROUTER_MODEL_TOOLS ??
      DEFAULT_MODEL;

    if (!apiKey) {
      return json(500, { success: false, error: 'OPENROUTER_API_KEY is not configured' });
    }

    const body = (await request.json()) as RequestBody;
    const description = body.description?.trim() ?? '';
    if (!description) {
      return json(400, { success: false, error: 'やりたいことを文章で書いてください' });
    }

    const result = await chatCompletion(
      apiKey,
      {
        model,
        max_tokens: 8000,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: buildPrompt(description) }],
      },
      { referer: 'https://beekle.jp', title: 'Beekle Story Spec' }
    );

    const spec = parseStorySpecJson(result.text);
    return json(200, { success: true, spec });
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
