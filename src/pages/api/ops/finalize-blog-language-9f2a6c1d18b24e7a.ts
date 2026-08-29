import type { APIRoute } from 'astro';
import {
  handleMicrocmsMcpRequest,
  type MicrocmsMcpEnv,
} from '../../../../workers/microcms-mcp/src/index';

export const prerender = false;

const ENDPOINT = 'blogs';
const CONTENT_ID = 'ai-agent-gherkin-evidence';
const LOCAL_MCP_BEARER_TOKEN = 'one-time-blog-language-finalizer';
const TARGET_TITLE = 'AIエージェントに「証拠は？」と詰めよう';
const TARGET_DESCRIPTION =
  'AIエージェントがプルリクエストを作っただけでは、要求された機能が本当に動くかは分かりません。Figma MCPで画面設計を参照し、画面上の利用場面と業務上のルールを分けてGherkinを設計。実装後に証拠付きで検証するAI開発フローを解説します。';

const FORBIDDEN_OUTSIDE_GHERKIN = [
  'Business Scenario',
  'UI Scenario',
  'Scenario Test Run',
  'Test URL',
  'PASS / FAIL',
  'Evidence',
  'Scenario',
  'Living Documentation',
  'Implementation Task',
  'Pull Request',
  'User Story',
  'Demand',
  'Networkログ',
  'Cursor Agent',
  'Commit',
  'Deploy',
] as const;

const REPLACEMENTS: ReadonlyArray<readonly [string, string]> = [
  ['Business Scenario', '業務上のルールの検証項目'],
  ['UI Scenario', '画面上の利用場面'],
  ['Scenario Test Run', '検証項目を実行'],
  ['Test URL', '検証用URL'],
  ['PASS / FAIL', '合格 / 不合格'],
  ['Living Documentation', '常に更新される仕様書'],
  ['Implementation Task', '実装作業'],
  ['Pull Request', 'プルリクエスト'],
  ['User Story', 'ユーザーストーリー'],
  ['Demand', '要求'],
  ['Preview / Staging', 'プレビュー環境 / 検証環境'],
  ['Networkログ', '通信ログ'],
  ['Cursor Agent', 'CursorなどのAIエージェント'],
  ['Commit', 'コミット'],
  ['Deploy', '公開版'],
  ['Evidence', '証拠'],
  ['Scenario', '検証項目'],
  ['PASS', '合格'],
  ['FAIL', '不合格'],
] as const;

const GHERKIN_BLOCK_RE =
  /<pre\b[^>]*>\s*<code\b[^>]*class=(?:"[^"]*\blanguage-gherkin\b[^"]*"|'[^']*\blanguage-gherkin\b[^']*')[^>]*>[\s\S]*?<\/code>\s*<\/pre>/gi;

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

function splitGherkinBlocks(html: string): { prose: string; blocks: string[] } {
  const blocks: string[] = [];
  const prose = html.replace(GHERKIN_BLOCK_RE, (block) => {
    const token = `@@PRESERVED_GHERKIN_BLOCK_${blocks.length}@@`;
    blocks.push(block);
    return token;
  });
  return { prose, blocks };
}

function restoreGherkinBlocks(prose: string, blocks: string[]): string {
  return prose.replace(
    /@@PRESERVED_GHERKIN_BLOCK_(\d+)@@/g,
    (_match, index: string) => blocks[Number(index)] ?? ''
  );
}

function forbiddenTerms(html: string): string[] {
  const { prose } = splitGherkinBlocks(html);
  return FORBIDDEN_OUTSIDE_GHERKIN.filter((term) => prose.includes(term));
}

function transform(html: string): string {
  if (!html || html.length < 4000) throw new Error('Existing article validation failed');
  if (/&lt;\/?(?:p|h[1-6]|ul|ol|li|blockquote|pre|code)\b/i.test(html)) {
    throw new Error('Escaped HTML remains in article content');
  }

  const { prose: originalProse, blocks } = splitGherkinBlocks(html);
  let prose = originalProse;
  for (const [from, to] of REPLACEMENTS) prose = prose.split(from).join(to);
  const output = restoreGherkinBlocks(prose, blocks);

  const remaining = forbiddenTerms(output);
  if (remaining.length > 0) {
    throw new Error(`English explanatory terms remain: ${remaining.join(', ')}`);
  }
  return output;
}

export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals as { runtime?: { env?: RuntimeEnv } }).runtime;
  const serviceDomain = runtime?.env?.MICROCMS_SERVICE_DOMAIN ?? '';
  const apiKey = runtime?.env?.MICROCMS_API_KEY ?? '';
  if (!serviceDomain || !apiKey) {
    return json({ ok: false, error: 'microcms_credentials_unavailable' }, 503);
  }

  const env: MicrocmsMcpEnv = {
    MICROCMS_SERVICE_DOMAIN: serviceDomain,
    MICROCMS_API_KEY: apiKey,
    MCP_BEARER_TOKEN: LOCAL_MCP_BEARER_TOKEN,
    ALLOWED_ENDPOINTS: ENDPOINT,
  };

  try {
    const current = await callMcpTool(
      'microcms_get_content',
      {
        endpoint: ENDPOINT,
        contentId: CONTENT_ID,
        fields: 'id,title,description,publishedAt,updatedAt,content',
      },
      env,
      1
    );
    const currentContent = typeof current.content === 'string' ? current.content : '';
    const nextContent = transform(currentContent);

    await callMcpTool(
      'microcms_update_content',
      {
        endpoint: ENDPOINT,
        contentId: CONTENT_ID,
        status: 'published',
        fields: {
          title: TARGET_TITLE,
          description: TARGET_DESCRIPTION,
          content: nextContent,
        },
      },
      env,
      2
    );

    const verified = await callMcpTool(
      'microcms_get_content',
      {
        endpoint: ENDPOINT,
        contentId: CONTENT_ID,
        fields: 'id,title,description,publishedAt,updatedAt,content',
      },
      env,
      3
    );
    const verifiedContent = typeof verified.content === 'string' ? verified.content : '';
    const remaining = forbiddenTerms(verifiedContent);
    const escapedHtml = /&lt;\/?(?:p|h[1-6]|ul|ol|li|blockquote|pre|code)\b/i.test(
      verifiedContent
    );
    const gherkinBlocks = splitGherkinBlocks(verifiedContent).blocks;
    const gherkinCode = gherkinBlocks.join('\n');

    if (
      verified.id !== CONTENT_ID ||
      verified.title !== TARGET_TITLE ||
      verified.description !== TARGET_DESCRIPTION ||
      !verified.publishedAt ||
      remaining.length > 0 ||
      escapedHtml ||
      !gherkinCode.includes('Scenario:') ||
      !gherkinCode.includes('Given ')
    ) {
      throw new Error('Published article verification failed');
    }

    return json(
      {
        ok: true,
        id: verified.id,
        title: verified.title,
        publishedAt: verified.publishedAt,
        updatedAt: verified.updatedAt,
        contentLength: verifiedContent.length,
        forbiddenTermsOutsideGherkin: remaining,
        escapedHtml,
        gherkinSyntaxPreserved: true,
        gherkinBlockCount: gherkinBlocks.length,
        mcpTool: 'microcms_update_content',
      },
      200
    );
  } catch (error) {
    return json(
      { ok: false, error: error instanceof Error ? error.message : 'unknown_error' },
      500
    );
  }
};
