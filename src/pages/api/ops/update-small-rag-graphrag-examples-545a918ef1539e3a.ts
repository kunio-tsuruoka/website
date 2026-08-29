import type { APIRoute } from 'astro';
import {
  type MicrocmsMcpEnv,
  handleMicrocmsMcpRequest,
} from '../../../../workers/microcms-mcp/src/index';
import {
  GRAPH_RAG_EXAMPLES_HEADING,
  upsertGraphRagExamplesSection,
} from '../../../lib/content-updates/graph-rag-examples.mjs';

export const prerender = false;

// One-time, fixed and idempotent content update. Remove this route after publication is verified.
const LOCAL_MCP_BEARER_TOKEN = 'one-time-small-rag-graphrag-updater';
const CONTENT_ID = 'small-internal-rag-without-vector-db';
const EXPECTED_EXISTING_TEXT = '質問は「未対応は何件？」なのに、検索基盤だけ宇宙開発になる。';
const EXPECTED_PRODUCT_TEXT = '不良部品の製造番号';
const EXPECTED_REGULATION_TEXT = '法改正から、直すべき規程・画面・研修資料までたどる';
const EXPECTED_FRAUD_TEXT = '一件ずつ見ると普通な不正利用を、つながりで見つける';
const EXPECTED_BOUNDARY_TEXT = '関係を一覧で返すだけなら';
const GRAPH_RAG_BOUNDARY_ANCHOR = '<p>データが多いから必要になるわけではありません。';
const GRAPH_RAG_BOUNDARY_NOTE = `<p>ここで、グラフ型データベースとGraphRAGは分けた方がいいです。部品から製品、製品から顧客まで、決まった関係をたどって一覧を返すだけなら、通常のデータベース検索やグラフ検索で足ります。生成AIまで呼ぶ必要はありません。</p>

<p>GraphRAGが必要になるのは、規程、会議記録、障害報告、契約書のような文章と、顧客・製品・作業の関係をまたぎ、質問ごとに違う経路を選び、集めた根拠を人が読める説明へまとめるときです。全部をグラフにすればよいわけではありません。</p>`;

type RuntimeEnv = {
  MICROCMS_SERVICE_DOMAIN?: string;
  MICROCMS_API_KEY?: string;
};

type JsonRpcEnvelope = {
  result?: {
    content?: Array<{ type?: string; text?: string }>;
    isError?: boolean;
  };
  error?: { message?: string };
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

function addGraphRagBoundaryNote(content: string): string {
  if (content.includes(EXPECTED_BOUNDARY_TEXT)) return content;

  const anchorIndex = content.indexOf(GRAPH_RAG_BOUNDARY_ANCHOR);
  if (anchorIndex < 0) throw new Error('GraphRAG boundary insertion anchor was not found');

  return `${content.slice(0, anchorIndex)}${GRAPH_RAG_BOUNDARY_NOTE}\n\n${content.slice(anchorIndex)}`;
}

function getVerification(content: string) {
  return {
    headingCount: content.split(GRAPH_RAG_EXAMPLES_HEADING).length - 1,
    productExampleVerified: content.includes(EXPECTED_PRODUCT_TEXT),
    regulationExampleVerified: content.includes(EXPECTED_REGULATION_TEXT),
    fraudExampleVerified: content.includes(EXPECTED_FRAUD_TEXT),
    boundaryVerified: content.includes(EXPECTED_BOUNDARY_TEXT),
    pmOnRailsVerified: content.includes('PM on Railsでは、検索より関係の方が難しい'),
  };
}

function isVerified(
  verification: ReturnType<typeof getVerification>,
  publishedAt: unknown
): boolean {
  return Boolean(
    publishedAt &&
      verification.headingCount === 1 &&
      verification.productExampleVerified &&
      verification.regulationExampleVerified &&
      verification.fraudExampleVerified &&
      verification.boundaryVerified &&
      verification.pmOnRailsVerified
  );
}

async function callMcpTool(
  name: string,
  args: Record<string, unknown>,
  env: MicrocmsMcpEnv,
  id: number
): Promise<Record<string, unknown>> {
  const response = await handleMicrocmsMcpRequest(
    new Request('https://beekle.jp/mcp', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${LOCAL_MCP_BEARER_TOKEN}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id,
        method: 'tools/call',
        params: { name, arguments: args },
      }),
    }),
    env
  );

  const envelope = (await response.json()) as JsonRpcEnvelope;
  const text = envelope.result?.content?.find((item) => item.type === 'text')?.text;

  if (!response.ok || envelope.error || envelope.result?.isError || !text) {
    throw new Error(
      envelope.error?.message ?? text ?? `MCP tool ${name} failed with HTTP ${response.status}`
    );
  }

  return JSON.parse(text) as Record<string, unknown>;
}

export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals as { runtime?: { env?: RuntimeEnv } }).runtime;
  const runtimeEnv = runtime?.env ?? {};
  const serviceDomain = runtimeEnv.MICROCMS_SERVICE_DOMAIN ?? '';
  const apiKey = runtimeEnv.MICROCMS_API_KEY ?? '';

  if (!serviceDomain || !apiKey) {
    return json(
      {
        ok: false,
        error: 'microcms_credentials_unavailable',
        hasServiceDomain: Boolean(serviceDomain),
        hasApiKey: Boolean(apiKey),
      },
      503
    );
  }

  const mcpEnv: MicrocmsMcpEnv = {
    MICROCMS_SERVICE_DOMAIN: serviceDomain,
    MICROCMS_API_KEY: apiKey,
    MCP_BEARER_TOKEN: LOCAL_MCP_BEARER_TOKEN,
    ALLOWED_ENDPOINTS: 'columns',
  };

  try {
    const current = await callMcpTool(
      'microcms_get_content',
      {
        endpoint: 'columns',
        contentId: CONTENT_ID,
        fields: 'id,title,description,category,publishedAt,updatedAt,content',
      },
      mcpEnv,
      1
    );

    const currentContent = typeof current.content === 'string' ? current.content : '';
    if (!currentContent.includes(EXPECTED_EXISTING_TEXT) || currentContent.length < 10_000) {
      throw new Error('Existing article validation failed');
    }

    const currentVerification = getVerification(currentContent);
    if (isVerified(currentVerification, current.publishedAt)) {
      return json(
        {
          ok: true,
          action: 'already_updated',
          id: current.id,
          slug: CONTENT_ID,
          title: current.title,
          publishedAt: current.publishedAt,
          updatedAt: current.updatedAt,
          contentLength: currentContent.length,
          ...currentVerification,
        },
        200
      );
    }

    const nextContent = addGraphRagBoundaryNote(upsertGraphRagExamplesSection(currentContent));

    const updateResult = await callMcpTool(
      'microcms_update_content',
      {
        endpoint: 'columns',
        contentId: CONTENT_ID,
        status: 'published',
        fields: { content: nextContent },
      },
      mcpEnv,
      2
    );

    const verified = await callMcpTool(
      'microcms_get_content',
      {
        endpoint: 'columns',
        contentId: CONTENT_ID,
        fields: 'id,title,description,category,publishedAt,updatedAt,content',
      },
      mcpEnv,
      3
    );

    const verifiedContent = typeof verified.content === 'string' ? verified.content : '';
    const verification = getVerification(verifiedContent);

    if (!isVerified(verification, verified.publishedAt)) {
      throw new Error('Updated article verification failed');
    }

    return json(
      {
        ok: true,
        action: 'updated',
        id: verified.id,
        slug: CONTENT_ID,
        title: verified.title,
        publishedAt: verified.publishedAt,
        updatedAt: verified.updatedAt,
        contentLength: verifiedContent.length,
        ...verification,
        mcpTool: 'microcms_update_content',
        updateResult,
      },
      200
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'unknown_error',
      },
      500
    );
  }
};
