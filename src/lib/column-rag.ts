import embeddings from '@/data/column-embeddings.json';

export type ColumnRef = {
  id: string;
  title: string;
  url: string;
  excerpt: string;
};

type Record = ColumnRef & { vector: number[] };

type EmbeddingsFile = {
  model: string;
  builtAt: string;
  records: Record[];
};

type AiBinding = {
  run(model: string, input: { text: string[] }): Promise<{ data: number[][] }>;
};

type RestFallbackEnv = {
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
};

const data = embeddings as unknown as EmbeddingsFile;

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function embedViaRest(query: string, env: RestFallbackEnv): Promise<number[] | null> {
  const token = env.CLOUDFLARE_API_TOKEN;
  const account = env.CLOUDFLARE_ACCOUNT_ID;
  if (!token || !account) return null;
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${data.model}`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ text: [query] }),
    }
  );
  if (!res.ok) return null;
  const json = (await res.json()) as { success?: boolean; result?: { data?: number[][] } };
  if (!json.success) return null;
  return json.result?.data?.[0] ?? null;
}

/**
 * クエリ文字列を埋め込み、類似度上位 topK のコラムを返す。
 * 優先: Workers AI binding (`env.AI`)。
 * フォールバック: Workers AI REST API（`CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` が必要）。
 * どちらも使えない or インデックス空の場合は [] を返す。
 */
export async function findRelevantColumns(
  query: string,
  ai: AiBinding | undefined,
  env: RestFallbackEnv = {},
  topK = 3
): Promise<ColumnRef[]> {
  if (!data.records?.length) return [];

  let queryVec: number[] | null = null;
  if (ai) {
    try {
      const result = await ai.run(data.model, { text: [query] });
      queryVec = result.data?.[0] ?? null;
    } catch {
      queryVec = null;
    }
  }
  if (!queryVec) {
    queryVec = await embedViaRest(query, env);
  }
  if (!queryVec) return [];

  const scored = data.records.map((r) => ({
    ref: { id: r.id, title: r.title, url: r.url, excerpt: r.excerpt },
    score: cosine(queryVec, r.vector),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((s) => s.ref);
}

/**
 * 参考コラムをシステムプロンプトに差し込むためのテキストブロックを生成。
 */
export function formatColumnContext(refs: ColumnRef[]): string {
  if (!refs.length) return '';
  const lines = refs.map(
    (r, i) => `[${i + 1}] タイトル: ${r.title}\n   URL: ${r.url}\n   抜粋:\n${r.excerpt}`
  );
  return `\n\n[参考コラム — Beekleのナレッジベース]\n以下はBeekleが過去に発信したコラムの抜粋です。質問に対する答えは、まずこのコラムに書かれている具体的な手順・方法論・キーワードを軸に組み立ててください。一般論ではなく、コラム独自の切り口（手順の名前、フレーム、ステップ数、固有用語）をそのまま使い、自分の言葉で短く再構成してください。\n\n${lines.join(
    '\n\n'
  )}\n[参考コラム ここまで]\n\n【回答の組み立て方】\n- 質問への答えをいきなり始める。「○○は大切な工程です」のような前置きは書かない\n- 抜粋にある手順や用語（例: ヒアリング → ユーザーストーリー → FMで優先度づけ、5フェーズ、など）をそのまま使って「まず○○、次に××」と短く列挙する\n- 抜粋を超える具体的な数字・固有名詞は捏造しない\n- 略語の正式名称・英訳・由来も、抜粋に明示されていなければ推測で書かない（FMを「Future Mode」のように勝手な英訳をでっち上げるのは禁止。原語のまま使う）\n- 末尾に1件だけ「もう少し詳しい話は「タイトル」(URL) にまとまっていて、ここを読むとわかりやすいと思います」の形で関連の深いコラムを案内する（マークダウンリンクは使わず、URLはそのまま書く）\n- URLは上記リストに含まれるもの以外は絶対に書かない（捏造禁止）\n- 質問がコラム抜粋と無関係なら、無理に引用せず一般的に答えてOK`;
}
