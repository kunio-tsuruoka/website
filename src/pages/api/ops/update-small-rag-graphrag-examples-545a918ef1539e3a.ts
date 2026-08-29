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

const EXPECTED_TOKEN_SHA256 = '545a918ef1539e3ae3e480a001ef5dd2faa710434a494b98cdb385a0e7189254';
const LOCAL_MCP_BEARER_TOKEN = 'one-time-small-rag-graphrag-updater';
const CONTENT_ID = 'small-internal-rag-without-vector-db';
const EXPECTED_EXISTING_TEXT = '質問は「未対応は何件？」なのに、検索基盤だけ宇宙開発になる。';
const EXPECTED_PRODUCT_TEXT = '不良部品の製造番号';
const EXPECTED_REGULATION_TEXT = '法改正から、直すべき規程・画面・研修資料までたどる';
const EXPECTED_FRAUD_TEXT = '一件ずつ見ると普通な不正利用を、つながりで見つける';

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

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
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

export const GET: APIRoute = async ({ locals, url }) => {
  const token = url.searchParams.get('token') ?? '';
  const confirmed = url.searchParams.get('confirm') === 'update';

  if (!confirmed || !token || (await sha256Hex(token)) !== EXPECTED_TOKEN_SHA256) {
    return json({ ok: false, error: 'not_found' }, 404);
  }

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

    const nextContent = upsertGraphRagExamplesSection(currentContent);

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
    const headingCount = verifiedContent.split(GRAPH_RAG_EXAMPLES_HEADING).length - 1;
    const productExampleVerified = verifiedContent.includes(EXPECTED_PRODUCT_TEXT);
    const regulationExampleVerified = verifiedContent.includes(EXPECTED_REGULATION_TEXT);
    const fraudExampleVerified = verifiedContent.includes(EXPECTED_FRAUD_TEXT);

    if (
      !verified.publishedAt ||
      headingCount !== 1 ||
      !productExampleVerified ||
      !regulationExampleVerified ||
      !fraudExampleVerified ||
      !verifiedContent.includes('PM on Railsでは、検索より関係の方が難しい')
    ) {
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
        headingCount,
        productExampleVerified,
        regulationExampleVerified,
        fraudExampleVerified,
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
