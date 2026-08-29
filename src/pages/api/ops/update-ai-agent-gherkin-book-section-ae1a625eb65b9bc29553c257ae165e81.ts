import type { APIRoute } from 'astro';
import {
  handleMicrocmsMcpRequest,
  type MicrocmsMcpEnv,
} from '../../../../workers/microcms-mcp/src/index';

export const prerender = false;

const EXPECTED_TOKEN_SHA256 = 'a6164f0991287596c82064f6fccac962dfb7bb546d0c1386e73bfbaa9708706f';
const LOCAL_MCP_BEARER_TOKEN = 'one-time-article-updater';
const CONTENT_ID = 'ai-agent-gherkin-evidence';
const SECTION_HEADING = '<h2>「UIシナリオを書くな」は、AI時代にもそのまま正しいのか</h2>';
const INSERT_BEFORE = '<h2>分けるが、切り離さない</h2>';
const EXPECTED_BOOK_TEXT = '古い本だから間違っている、と言いたいわけではありません。';
const EXPECTED_METHOD_TEXT = 'UIをBusiness Scenarioへ混ぜない代わりに、UI Scenarioとして分離して持つ';
const UPDATED_DESCRIPTION = 'AIエージェントがPRを作っただけでは開発完了とは言えません。2018年のGherkin実践書を、Figma MCP・Business Scenario・UI Scenario・Evidenceまで実際に回した経験から読み替えます。';

const BOOK_SECTION = `
<h2>「UIシナリオを書くな」は、AI時代にもそのまま正しいのか</h2>

<p>Gherkinの書き方については、Kamil Niciejaの『Writing Great Specifications: Using Specification by Example and Gherkin』（2018年）がかなり参考になります。</p>

<p>同書では、ボタン、フォーム、リンクといったUI操作を書くよりも、利用者の意図と業務上の結果を書くことが勧められています。また、一般的な文字列・日付のバリデーション、膨大な入力の組み合わせ、データベースの構造をそのまま表したセットアップまでGherkinへ持ち込むと、仕様が読みにくくなり、Living Documentationとして機能しなくなると説明されています。</p>

<p>この指摘は、今でも基本的には正しいと思います。古い本だから間違っている、と言いたいわけではありません。</p>

<p>ただし、本が書かれた2018年と、AIエージェントがFigmaを読み、Scenarioを実行し、Evidenceまで登録できる現在では、Gherkinを作成・維持・実行するコストの前提が変わっています。そこで私は、本の原則をそのまま適用するのではなく、実際の開発で試した結果から適用範囲を読み替えています。</p>

<p>Business Scenarioの中に「このボタンを押す」「この入力欄へ値を入れる」と書き始めると、UIの変更だけで業務仕様まで変更されます。テーブルの構造や内部IDをGherkinへ並べても、顧客が読みたい仕様にはなりません。</p>

<p>ただ、2018年に書かれたこの本と、現在のAIエージェント中心の開発では、少し前提が変わっているとも感じています。</p>

<p>当時、Gherkinの主な読者は、顧客、プロダクト担当者、開発者、テスターでした。Scenarioを増やすほど、人間が書き、実装と同期し、テストコードを保守する負担も増えます。そのため、業務上重要な例へ絞り、可読性を優先するのは合理的でした。</p>

<p>一方、私たちがFigma MCP、PM on Rails、AIエージェントを実際に組み合わせて試したところ、Gherkinには別の役割も生まれました。</p>

<ul>
  <li>AIエージェントが実装内容を理解するための契約</li>
  <li>ブラウザを操作して検証するための実行指示</li>
  <li>どの画面をEvidenceとして残すかを決める基準</li>
  <li>顧客がTest URLから同じ動作を確認するための手順</li>
  <li>Figmaと実装の差分を見つけるための観測点</li>
</ul>

<p>つまり、現在のGherkinは、人間向けのLiving Documentationであると同時に、<strong>AIエージェントが実装と検証を行うための構造化されたインターフェース</strong>にもなっているんですよね。</p>

<p>この前提では、「UIをGherkinへ一切書かない」という結論にはしていません。</p>

<p>私たちが実際に試してよいと思っているのは、<strong>UIをBusiness Scenarioへ混ぜない代わりに、UI Scenarioとして分離して持つ</strong>方法です。</p>

<blockquote><p>Business Scenarioは、画面が変わっても残る業務ルールを書く。<br>UI Scenarioは、Figmaを前提に、利用者がどのようにそのルールを確認できるかを書く。</p></blockquote>

<p>たとえば、「JPGまたはPNG以外のプロフィール画像は受け付けない」というルールがあるとします。</p>

<p>Business Scenarioでは、未対応形式の画像が保存されず、受理されないことを定義します。</p>

<p>UI Scenarioでは、利用者が未対応形式の画像を選択してアップロードしたときに、プロフィール画像欄の下へ理由が表示され、対象の入力欄がエラー状態として識別できることを定義します。</p>

<p>このUI Scenarioは単なる見た目の説明ではありません。顧客が画面上で異常系を確認でき、AIエージェントがスクリーンショットをEvidenceとして取得できる、検証可能な受け入れ条件です。</p>

<p>もちろん、あらゆる文字列長、日付、文字コード、入力値の組み合わせを、人間が読むGherkinへ全部並べる必要はないと思います。組み合わせの網羅や純粋なモデル制約は、ユニットテストやプロパティベーステストなど、より低いレイヤーで検証できます。</p>

<p>ただし、利用者に見えるバリデーション、契約上重要な異常系、顧客が受け入れテストで確認する状態については、以前より積極的にUI Scenarioへする価値があります。AIがScenarioの作成、実行、Evidenceの取得を支援できるため、Scenarioを維持するコスト構造が変わったからです。</p>

<p>そのため、私たちの結論は「すべてのテストをGherkinに書く」でも、「UIをGherkinから排除する」でもありません。</p>

<blockquote><p>本の原則は維持する。<br>ただし、AI時代にはUI Scenarioを捨てず、Business Scenarioから分離して、実装とEvidenceへつなぐ。</p></blockquote>

<p>Gherkinを減らすこと自体を目的にするのではなく、誰が、何を判断し、どのレイヤーで何を保証するScenarioなのかを明確にすることが大事なんだと思います。</p>
`.trim();

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

function withBookSection(currentContent: string): string {
  let content = currentContent;
  const existingStart = content.indexOf(SECTION_HEADING);

  if (existingStart >= 0) {
    const existingEnd = content.indexOf('<h2>', existingStart + SECTION_HEADING.length);
    if (existingEnd < 0) throw new Error('Existing book section end was not found');
    content = `${content.slice(0, existingStart)}${content.slice(existingEnd)}`;
  }

  const insertAt = content.indexOf(INSERT_BEFORE);
  if (insertAt < 0) throw new Error('Insertion anchor was not found');

  return `${content.slice(0, insertAt).trimEnd()}

${BOOK_SECTION}

${content.slice(insertAt)}`;
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
    if (!currentContent.includes(INSERT_BEFORE) || currentContent.length < 4000) {
      throw new Error('Existing article validation failed');
    }

    const nextContent = withBookSection(currentContent);

    const updateResult = await callMcpTool(
      'microcms_update_content',
      {
        endpoint: 'columns',
        contentId: CONTENT_ID,
        status: 'published',
        fields: {
          content: nextContent,
          description: UPDATED_DESCRIPTION,
        },
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
    const headingCount = verifiedContent.split(SECTION_HEADING).length - 1;
    const bookSectionVerified = verifiedContent.includes(EXPECTED_BOOK_TEXT);
    const methodSectionVerified = verifiedContent.includes(EXPECTED_METHOD_TEXT);

    if (
      !verified.publishedAt ||
      headingCount !== 1 ||
      !bookSectionVerified ||
      !methodSectionVerified ||
      !verifiedContent.includes(INSERT_BEFORE)
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
        bookSectionVerified,
        methodSectionVerified,
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
