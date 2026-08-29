import type { APIRoute } from 'astro';
import {
  handleMicrocmsMcpRequest,
  type MicrocmsMcpEnv,
} from '../../../../workers/microcms-mcp/src/index';

export const prerender = false;

const EXPECTED_TOKEN_SHA256 = '023f070d32c8728daedd504017331f425202dfa82b5960c3dc665046440cd91a';
const LOCAL_MCP_BEARER_TOKEN = 'one-time-blog-language-rewriter';
const ENDPOINT = 'blogs';
const CONTENT_ID = 'ai-agent-gherkin-evidence';
const TARGET_TITLE = 'AIエージェントに「証拠は？」と詰めよう';
const TARGET_DESCRIPTION =
  'AIエージェントがプルリクエストを作っただけでは、要求された機能が本当に動くかは分かりません。Figma MCPで画面設計を参照し、画面上の利用場面と業務上のルールを分けてGherkinを設計。実装後に証拠付きで検証するAI開発フローを解説します。';

const FORBIDDEN_PROSE_TERMS = [
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
  ['AIエージェントがPRを作っただけでは', 'AIエージェントがプルリクエストを作っただけでは'],
  ['PRができたところ', 'プルリクエストができたところ'],
  ['PRの本数', 'プルリクエストの本数'],
  ['PRは実装の入口', 'プルリクエストは実装の入口'],
  ['Evidenceの品質は、Gherkinの品質で決まる', '検証の証拠は、Gherkinの品質で決まる'],
  ['UIシナリオとビジネスロジックを分ける', '画面上の利用場面と業務上のルールを分ける'],
  ['ビジネスロジックのScenario', '業務上のルールの検証項目'],
  ['UIのScenario', '画面上の利用場面'],
  ['UIの細部はFigma、振る舞いはGherkin', '画面の細部はFigma、振る舞いはGherkin'],
  ['EvidenceもUIとビジネスロジックで分ける', '検証記録も、画面側と業務上のルール側で分ける'],
  ['UI ScenarioのEvidence', '画面上の利用場面の検証記録'],
  ['ビジネスロジックのEvidence', '業務上のルールの検証記録'],
  ['PM on RailsではScenarioとEvidenceをすでにつなげている', 'PM on Railsでは検証項目と証拠をすでにつなげている'],
  ['「UIシナリオを書くな」は、AI時代にもそのまま正しいのか', '「画面操作をGherkinへ書くな」は、AI時代にもそのまま正しいのか'],
  ['UI ScenarioはBusiness Scenarioを参照し', '画面上の利用場面は業務上のルールの検証項目を参照し'],
  ['UI Scenarioは、対応するBusiness Scenarioを参照します。', '画面上の利用場面は、対応する業務上のルールの検証項目を参照します。'],
  ['UIとビジネスロジックの両方がPASSして', '画面側と業務上のルール側の両方が合格して'],
  ['GherkinのThenから逆算できます。', 'Gherkinの「Then（結果）」から逆算できます。'],
  ['Figmaは、どのように見せるかの正本。', 'Figmaは、どのように見せるかを決める正本。'],
  ['Evidenceは、実際に成立したことの記録。', '検証記録は、実際に成立したことの証拠。'],
  ['AIエージェントが実装と検証を行うための構造化されたインターフェース', 'AIエージェントが実装と検証を行うための共通の指示形式'],
  ['UIをBusiness Scenarioへ混ぜない代わりに、UI Scenarioとして分離して持つ', '画面上の振る舞いを業務上のルールへ混ぜず、別の検証項目として持つ'],
  ['Business Scenarioは、画面が変わっても残る業務ルールを書く。<br>UI Scenarioは、Figmaを前提に、利用者がどのようにそのルールを確認できるかを書く。', '業務上のルールの検証項目には、画面が変わっても残るルールを書く。<br>画面上の利用場面には、Figmaを前提に、利用者がそのルールをどう確認できるかを書く。'],
  ['AIがScenarioの作成、実行、Evidenceの取得を支援できるため', 'AIが検証項目の作成と実行、証拠の取得を支援できるため'],
  ['UI Scenarioを捨てず、Business Scenarioから分離して、実装とEvidenceへつなぐ。', '画面上の利用場面を捨てず、業務上のルールから分離して、実装と証拠へつなぐ。'],
  ['どの画面をEvidenceとして残すか', 'どの画面を証拠として残すか'],
  ['顧客がTest URLから', '顧客が検証用URLから'],
  ['Scenarioの作成、実行', '検証項目の作成と実行'],
  ['Scenarioの実行結果', '検証項目の実行結果'],
  ['Scenarioのテスト結果', '検証項目の実行結果'],
  ['Scenarioを維持する', '検証項目を維持する'],
  ['Scenarioを実行し', '検証項目を実行し'],
  ['Scenarioなのか', '検証項目なのか'],
  ['Cursor AgentなどのAIエージェント', 'CursorなどのAIエージェント'],
  ['Cursor Agent', 'CursorなどのAIエージェント'],
  ['APIが403を返す', 'サーバーが403を返す'],
  ['API経由になっても', '画面以外から操作しても'],
  ['APIリクエストとレスポンス', 'サーバーとの送受信内容'],
  ['APIレスポンス', 'サーバーからの応答'],
  ['UI Scenario', '画面上の利用場面'],
  ['Business Scenario', '業務上のルールの検証項目'],
  ['Scenario Test Run', '検証項目を実行'],
  ['Test URL', '検証用URL'],
  ['PASS / FAIL', '合格 / 不合格'],
  ['Living Documentation', '常に更新される仕様書'],
  ['Implementation Task', '実装作業'],
  ['Pull Request', 'プルリクエスト'],
  ['User Story', 'ユーザーストーリー'],
  ['Demand', '要求'],
  ['Networkログ', '通信ログ'],
  ['対象のCommitやDeploy', '対象のコミットや公開版'],
  ['このCommitがデプロイされた環境', 'このコミットが反映された環境'],
  ['Evidence付き', '証拠付き'],
  ['Evidence', '証拠'],
  ['Scenario', '検証項目'],
  ['PASS', '合格'],
  ['FAIL', '不合格'],
  ['ビジネスロジック', '業務上のルール'],
  ['ブラウザコンソール', 'ブラウザの開発者画面'],
  ['ステータスコード', '応答コード'],
  ['発行されたイベント', '発行された処理通知'],
  ['ジョブの実行結果', '非同期処理の実行結果'],
  ['ユニットテストやプロパティベーステスト', '部品単位の自動テストや、値の組み合わせを自動生成するテスト'],
  ['レイヤー', '層'],
] as const;

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

function redirectToArticle() {
  return new Response(null, {
    status: 302,
    headers: {
      location: `/blog/${CONTENT_ID}`,
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

function splitPreBlocks(html: string): { prose: string; blocks: string[] } {
  const blocks: string[] = [];
  const prose = html.replace(/<pre\b[\s\S]*?<\/pre>/gi, (block) => {
    const token = `@@PRESERVED_PRE_BLOCK_${blocks.length}@@`;
    blocks.push(block);
    return token;
  });
  return { prose, blocks };
}

function restorePreBlocks(prose: string, blocks: string[]): string {
  return prose.replace(
    /@@PRESERVED_PRE_BLOCK_(\d+)@@/g,
    (_match, index: string) => blocks[Number(index)] ?? ''
  );
}

function findForbiddenProseTerms(html: string): string[] {
  const { prose } = splitPreBlocks(html);
  return FORBIDDEN_PROSE_TERMS.filter((term) => prose.includes(term));
}

function transformArticleHtml(html: string): string {
  if (!html || html.length < 4000) throw new Error('Existing article validation failed');
  if (/&lt;\/?(?:p|h[1-6]|ul|ol|li|blockquote|pre|code)\b/i.test(html)) {
    throw new Error('Escaped HTML remains in article content');
  }

  const { prose: originalProse, blocks } = splitPreBlocks(html);
  let prose = originalProse;
  for (const [from, to] of REPLACEMENTS) prose = prose.split(from).join(to);
  prose = prose.replace(/\bUI\b/g, '画面');
  prose = prose.replace(/\bPR\b/g, 'プルリクエスト');

  const output = restorePreBlocks(prose, blocks);
  const forbidden = findForbiddenProseTerms(output);
  if (forbidden.length > 0) {
    throw new Error(`English prose terms remain: ${forbidden.join(', ')}`);
  }
  if (output.length < html.length * 0.85) throw new Error('Article content shrank unexpectedly');

  const preservedCode = splitPreBlocks(output).blocks.join('\n');
  if (!preservedCode.includes('Scenario:') || !preservedCode.includes('Given ')) {
    throw new Error('Gherkin syntax was not preserved');
  }
  return output;
}

export const GET: APIRoute = async ({ locals, url }) => {
  const token = url.searchParams.get('token') ?? '';
  if (!token || (await sha256Hex(token)) !== EXPECTED_TOKEN_SHA256) {
    return json({ ok: false, error: 'not_found' }, 404);
  }

  const runtime = (locals as { runtime?: { env?: RuntimeEnv } }).runtime;
  const runtimeEnv = runtime?.env ?? {};
  const serviceDomain = runtimeEnv.MICROCMS_SERVICE_DOMAIN ?? '';
  const apiKey = runtimeEnv.MICROCMS_API_KEY ?? '';
  if (!serviceDomain || !apiKey) {
    return json({ ok: false, error: 'microcms_credentials_unavailable' }, 503);
  }

  const mcpEnv: MicrocmsMcpEnv = {
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
      mcpEnv,
      1
    );

    const currentContent = typeof current.content === 'string' ? current.content : '';
    const nextContent = transformArticleHtml(currentContent);

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
      mcpEnv,
      2
    );

    const verified = await callMcpTool(
      'microcms_get_content',
      {
        endpoint: ENDPOINT,
        contentId: CONTENT_ID,
        fields: 'id,title,description,publishedAt,updatedAt,content',
      },
      mcpEnv,
      3
    );

    const verifiedContent = typeof verified.content === 'string' ? verified.content : '';
    const forbidden = findForbiddenProseTerms(verifiedContent);
    const escapedHtml = /&lt;\/?(?:p|h[1-6]|ul|ol|li|blockquote|pre|code)\b/i.test(
      verifiedContent
    );
    const preservedCode = splitPreBlocks(verifiedContent).blocks.join('\n');

    if (
      verified.id !== CONTENT_ID ||
      verified.title !== TARGET_TITLE ||
      verified.description !== TARGET_DESCRIPTION ||
      !verified.publishedAt ||
      forbidden.length > 0 ||
      escapedHtml ||
      !preservedCode.includes('Scenario:') ||
      !preservedCode.includes('Given ')
    ) {
      throw new Error('Updated article verification failed');
    }

    return redirectToArticle();
  } catch (error) {
    return json(
      { ok: false, error: error instanceof Error ? error.message : 'unknown_error' },
      500
    );
  }
};
