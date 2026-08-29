import type { APIRoute } from 'astro';
import {
  type MicrocmsMcpEnv,
  handleMicrocmsMcpRequest,
} from '../../../../workers/microcms-mcp/src/index';

export const prerender = false;

const EXPECTED_TOKEN_SHA256 = '5587a9f409fef1d228b4ffdd9a01bad4c0f459aca23ac7c704c23400fe0b114b';
const INTERNAL_BEARER_TOKEN = 'yjv-P66VhEBiO_UPCB9sP_5PkUquATL_UOB2SKUGWws';
const EXPECTED_PHRASE = "本の原則を、AIエージェントが実装とテストを行う現在の開発環境に合わせて拡張";

const UPDATE_ARGS = {
  "endpoint": "columns",
  "contentId": "ai-agent-gherkin-evidence",
  "status": "published",
  "fields": {
    "title": "AIエージェントに実装を任せるなら、「できました」ではなく証拠を返させる",
    "content": "<p>AIエージェントに開発を任せると、コードを書いてプルリクエストを作るところまでは、かなり速くなりました。</p>\n<p>既存コードを読み、変更し、自動テストを実行してPRを作る。以前なら人間が数時間かけていた作業を、短い時間で終わらせることもあります。</p>\n<p>ただ、実際の開発では、PRができたところで仕事が終わるわけではありません。</p>\n<blockquote>\n<p>コードが変更されたことと、要求された機能が本当に利用できることは同じではありません。</p>\n</blockquote>\n<p>自動テストが通っていても、検証環境で操作すると動かないことがあります。画面は正しく見えていても、裏側では意図しないデータが保存されていることもあります。</p>\n<p>AIエージェント時代の完了条件は、「PRができた」ではなく、<strong>要求されたScenarioを実行し、その結果を証拠付きで確認できること</strong>へ変える必要があるんだと思います。</p>\n<p>ただし、AIエージェントにスクリーンショットやログを返させれば、それだけでよいわけでもありません。</p>\n<p>Evidenceを集める前に、何をもってPASSとするのかをGherkinで作り込む必要があります。</p>\n<h2>Evidenceの品質は、Gherkinの品質で決まる</h2>\n<p>例えば、Scenarioに次のようにしか書かれていなかったとします。</p>\n<pre><code>Scenario: メール未確認ユーザーを制限する\n  Given メールアドレスが未確認である\n  When 認証が必要な機能を利用する\n  Then 利用できない</code></pre>\n<p>このScenarioでは、何を実装し、何を確認すればよいのかが十分に定まりません。</p>\n<p>「利用できない」とは、ボタンを非表示にすることなのか、操作後にエラーを表示することなのか、APIが403を返すことなのか、データを保存しないことなのか。どれも「利用できない」と表現できます。</p>\n<p>このままAIエージェントにEvidenceを提出させても、都合のよい画面を一枚撮って「PASS」と判定できてしまいます。</p>\n<p>Evidenceは、要求を具体化するものではありません。<strong>すでに具体化された要求が成立したことを証明するもの</strong>です。</p>\n<p>だから、Evidenceを管理する仕組みより前に、検証可能なGherkinを作る必要があります。</p>\n<h2>Figma MCPだけでも、Gherkinだけでも足りない</h2>\n<p>UIを実装する場合、AIエージェントにはFigma MCPを接続して、対象の画面やコンポーネントを直接参照させます。</p>\n<p>Figma MCPを使えば、対象フレーム、コンポーネント構造、表示文言、レイアウト、画面状態、プロトタイプ上の遷移などを、スクリーンショットだけを渡すより正確に取得できます。</p>\n<p>ただし、Figmaから読み取れるのは、主に画面の構造とインタラクションです。</p>\n<p>Figma上に送信ボタンが置かれていても、誰が押せるのか、どの状態なら押せるのか、押した結果どのデータが変わるのか、二重送信をどう防ぐのかまでは、必ずしも確定しません。</p>\n<p>Figmaは重要ですが、Figmaだけでは業務仕様にならないんですよね。</p>\n<p>そこで、Figma MCPで画面設計を確認したうえで、PM on Rails上にGherkinを作り込みます。</p>\n<ul>\n<li><strong>Figma</strong>：どのように見せるかの正本</li>\n<li><strong>Gherkin</strong>：何が起きるべきかの正本</li>\n<li><strong>コード</strong>：その振る舞いを実現する実装</li>\n<li><strong>Evidence</strong>：実際に成立したことの記録</li>\n</ul>\n<p>この4つを一本につなげることが、AIエージェントへ開発を任せるうえで重要です。</p>\n<h2>ポイントは、UI ScenarioとBusiness Scenarioを分けること</h2>\n<p>Gherkinを作るうえで、私が特に重要だと考えているのが、<strong>UI上のScenarioと、ビジネスロジックを表すScenarioを分けること</strong>です。</p>\n<p>一つのScenarioに、画面操作、表示文言、権限判定、データ更新、通知処理まで全部書いてしまうと、仕様が読みにくくなります。</p>\n<p>それだけでなく、UIを少し変更しただけで、安定しているビジネスルールのScenarioまで修正しなければならなくなります。</p>\n<p>例えば、メール未確認の回答者は回答を確定できないというルールがあるとします。</p>\n<p>まず、ビジネスロジックを表すScenarioを作ります。</p>\n<pre><code>Feature: 回答送信の可否\n\n  Rule: メール未確認の回答者は回答を確定できない\n\n    Scenario: メール未確認の回答者による回答送信を拒否する\n      Given メール未確認の回答者が回答可能な案件を持っている\n      When 回答者が案件への回答を確定しようとする\n      Then 回答は登録されない\n      And 案件の回答状態は変更されない\n      And メール確認が必要であることを示す結果を返す</code></pre>\n<p>ここでは、UI上でどのボタンを押すかは書きません。</p>\n<p>定義しているのは、メール未確認なら回答を登録しない、案件の状態も変えない、メール確認が必要であることを呼び出し元へ返す、というシステムとして守るべきルールです。</p>\n<p>画面が変わっても、API経由になっても、このルールは変わりません。</p>\n<p>一方で、UI Scenarioは別に作ります。</p>\n<pre><code>Feature: 回答画面でのメール確認案内\n\n  Scenario: メール未確認の回答者に確認導線を表示する\n    Given メール未確認の回答者が案件回答画面を表示している\n    And 必須項目への入力が完了している\n    When 回答者が「回答を送信する」を実行する\n    Then 回答完了とは表示されない\n    And メールアドレスの確認が必要であることを表示する\n    And 確認メールを再送できる導線を表示する</code></pre>\n<p>こちらは、利用者から観測できる振る舞いを表しています。</p>\n<p>どの画面で、どの操作を行い、利用者が何を確認できるのか。見た目やコンポーネントの詳細はFigmaを参照しつつ、利用者にとって意味のある振る舞いをGherkinへ記述します。</p>\n<p>APIの契約を明示的に検証する必要がある場合は、さらにAPIや結合レイヤーのScenarioを分けます。</p>\n<pre><code>Scenario: メール未確認の回答送信要求に識別可能なエラーを返す\n  Given メール未確認の回答者による有効な回答送信要求である\n  When 回答送信APIが要求を受け付ける\n  Then APIは要求を拒否する\n  And 呼び出し元がメール未確認を識別できるエラーを返す\n  And 回答データは作成されない</code></pre>\n<p>HTTP 403や422といった具体的な契約が確定しているなら、API Scenario側で記述します。ただし、画面表示とデータ不変条件を一つの長いScenarioへ詰め込まないことが重要です。</p>\n<h2>本には「UIをGherkinに書くな」とある</h2>\n<p>Kamil Niciejaの『Writing Great Specifications: Using Specification by Example and Gherkin』では、ボタンや入力欄のようなUI操作ではなく、利用者の意図と業務上の結果を書くことが推奨されています。</p>\n<p>UI変更のたびにScenarioが壊れるのを避け、Gherkinをビジネス側にも読める仕様として保つためです。</p>\n<p>同書は、一般的な文字列や日付のバリデーション、膨大な入力組み合わせ、データベース都合のセットアップまでGherkinへ持ち込むことにも否定的です。</p>\n<p>Gherkinですべてのテストを置き換えようとすると、仕様書が読めなくなるからです。</p>\n<p>この指摘は、今でも正しいと思っています。</p>\n<p>ボタンの位置、余白、色、データベースのテーブル構造、文字列の全組み合わせまでGherkinに書く必要はありません。</p>\n<p>そうした詳細はFigmaや下位レイヤーの自動テスト、自動化コードへ置くべきです。</p>\n<h2>実際にAIエージェントで運用して、私はこう考える</h2>\n<p>一方で、この本は2018年に出版されたものです。</p>\n<p>私は実際にPM on RailsでGherkinを作り、Cursor AgentなどのAIエージェントへ実装と検証を任せる運用を試してきました。</p>\n<p>その結果、<strong>UI ScenarioをGherkinからなくしてしまうのも違う</strong>と考えるようになりました。</p>\n<p>以前のGherkinは、主に人間同士が要求を確認するためのLiving Documentationでした。</p>\n<p>現在はそれに加えて、AIエージェントが次の作業を行うための入力にもなっています。</p>\n<ul>\n<li>どの画面を実装するのか理解する</li>\n<li>どの操作を実行するのか判断する</li>\n<li>どの状態をPASSとするのか確認する</li>\n<li>どの画面をスクリーンショットとして残すのか決める</li>\n<li>どのTest URLで顧客に確認してもらうのか記録する</li>\n</ul>\n<p>つまり、Gherkinの読者は人間だけではなくなっています。</p>\n<p>また、以前はScenarioを増やすほど、人間が書き、保守し、自動化コードを整備する負担も増えました。</p>\n<p>今はAIがFigmaや既存要求を読み、Scenario候補を作り、実装後にはScenarioを実行してEvidenceまで集められます。もちろん人間によるレビューは必要ですが、Scenarioを維持する限界費用は以前より下がっています。</p>\n<p>だから私は、本の原則をそのまま捨てるのではなく、次のように拡張するのがよいと考えています。</p>\n<blockquote>\n<p>UIをBusiness Scenarioへ混ぜない。ただし、利用者が観測する振る舞いはUI Scenarioとして分離し、Figma、実装、Test URL、Evidenceへつなぐ。</p>\n</blockquote>\n<p>これは、本の内容を否定しているわけではありません。</p>\n<p><strong>本の原則を、AIエージェントが実装とテストを行う現在の開発環境に合わせて拡張している</strong>という方が近いんだと思います。</p>\n<h3>異常系も、抽象化して一件に潰さない</h3>\n<p>例えば、利用できない形式のプロフィール画像が選択された場合を考えます。</p>\n<p>Business Scenarioでは、未対応形式の画像が保存されないことを確認します。</p>\n<pre><code>Scenario: 利用できない形式のプロフィール画像を拒否する\n  Given 調査者が利用できない形式の画像を選択している\n  When 調査者がその画像をプロフィールに使用しようとする\n  Then システムは画像を受理しない\n  And プロフィール画像は変更されない\n  And 利用可能な形式が示される</code></pre>\n<p>UI Scenarioでは、利用者が理由を理解して修正できることを確認します。</p>\n<pre><code>Scenario: 利用できない形式の画像を選んだ項目を画面上で確認できる\n  Given 調査者がプロフィール編集画面を表示している\n  And 利用できない形式の画像を選択している\n  When 調査者がプロフィールを保存する\n  Then 利用できない形式であることを示すメッセージが表示される\n  And プロフィール画像の入力欄がエラー状態として示される\n  And 調査者は別の画像を選択できる</code></pre>\n<p>ここで、全ファイル形式や全文字コードの組み合わせまでGherkinに並べる必要はありません。それは下位レイヤーの自動テストで網羅します。</p>\n<p>しかし、利用者がエラーの理由を理解し、問題箇所を確認し、修正できるという業務上重要な異常系まで「一般的なバリデーションだから」と消してはいけません。</p>\n<p>AI時代には、重要な異常系をGherkinで明示したうえで、Business、API、UIのどのレイヤーで何を保証するかを分ける方が合理的です。</p>\n<h2>分けるが、切り離さない</h2>\n<p>UI ScenarioとBusiness Scenarioを分けるといっても、別々に管理して関係が分からなくなっては意味がありません。</p>\n<p>重要なのは、<strong>分離したうえで追跡可能につなぐこと</strong>です。</p>\n<pre><code>User Story\n  ├─ Business Scenario\n  │    └─ メール未確認なら回答を登録しない\n  │\n  ├─ API Scenario\n  │    └─ 呼び出し元が理由を識別できるエラーを返す\n  │\n  └─ UI Scenario\n       └─ 回答画面で確認案内と再送導線を表示する</code></pre>\n<p>これにより、画面上の表示だけは正しいのに、裏側では回答が保存されてしまっている不具合を防ぎやすくなります。</p>\n<p>反対に、バックエンドでは正しく拒否しているものの、画面上では何の説明もなく操作が失敗する状態も検出できます。</p>\n<p>UIとビジネスロジックの両方がPASSして、初めて利用者へ提供できる機能になります。</p>\n<h2>実装時と検証時に、同じGherkinを使う</h2>\n<p>Gherkinを作り込んだら、AIエージェントへFigmaとScenarioを渡して実装させます。</p>\n<pre><code>Demand\n  ↓\nUser Story\n  ↓\nFigmaによる画面設計\n  ↓ Figma MCPで参照\nBusiness / API / UI Scenario\n  ↓ 人間によるGherkinレビュー\nImplementation Task\n  ↓ AIエージェントが実装\nPull Request\n  ↓ Preview / Stagingへデプロイ\nScenario Test Run\n  ↓\nEvidence\n  ↓\nPASS / FAIL</code></pre>\n<p>重要なのは、実装時に参照したScenarioと、検証時に実行するScenarioが同じであることです。</p>\n<p>実装用の指示と受け入れテストが別々に書かれていると、途中で解釈がずれます。</p>\n<p>Gherkinを実装と検証の両方に使うことで、何を作るよう依頼し、何を実装し、何を確認してPASSとしたのかを一つの線で追えるようになります。</p>\n<h2>Evidenceもレイヤーごとに変える</h2>\n<p>Scenarioを分けると、必要なEvidenceも明確になります。</p>\n<h3>UI ScenarioのEvidence</h3>\n<ul>\n<li>操作前後のスクリーンショット</li>\n<li>一連の操作を記録した動画</li>\n<li>Test URL</li>\n<li>ブラウザコンソール</li>\n<li>Networkログ</li>\n<li>表示された文言や画面状態</li>\n</ul>\n<h3>Business ScenarioのEvidence</h3>\n<ul>\n<li>実行前後のデータ</li>\n<li>状態遷移</li>\n<li>監査ログ</li>\n<li>発行されたイベント</li>\n<li>データが作成されなかったことの確認</li>\n</ul>\n<h3>API ScenarioのEvidence</h3>\n<ul>\n<li>リクエストとレスポンス</li>\n<li>ステータスコード</li>\n<li>エラーコード</li>\n<li>アプリケーションログ</li>\n</ul>\n<p>例えば、エラーメッセージが表示されたスクリーンショットは、UI ScenarioのEvidenceにはなります。</p>\n<p>しかし、「回答が登録されなかった」というBusiness ScenarioのEvidenceには、それだけでは不十分です。</p>\n<p>どのEvidenceが必要かは、GherkinのThenから逆算できます。</p>\n<h2>PM on Railsでは、ScenarioとEvidenceをすでにつなげている</h2>\n<p>私たちは、PM on RailsというAIエージェント型の開発管理システムを、実際の開発で使っています。</p>\n<p>PM on Railsでは、要求からUser Story、GherkinのScenario、Task、実装、テストまでをつなげています。</p>\n<p>Scenarioのテスト結果には、次の情報を登録できます。</p>\n<ul>\n<li>検証環境</li>\n<li>Test URL</li>\n<li>PASS / FAIL</li>\n<li>スクリーンショット、動画、ログ</li>\n<li>実行者</li>\n<li>実行日時</li>\n<li>対象のCommitやDeploy</li>\n</ul>\n<p>Cursor AgentなどのAIエージェントからも、コードだけではなく、Scenarioの実行結果とEvidenceを登録できるようにしました。</p>\n<p>AIエージェントの仕事を、コードを変更してPRを作るところで終わらせず、対象Scenarioを実行し、期待した結果になったことをEvidence付きで登録するところまで広げています。</p>\n<p>ただし、この仕組みが有効に働くかどうかは、最初に作るGherkinにかかっています。</p>\n<p>曖昧なScenarioからは、曖昧な実装と曖昧なEvidenceしか生まれません。</p>\n<h2>「できました」から「この証拠で確認できます」へ</h2>\n<p>AIエージェントは、これからさらに多くのコードを書くようになると思います。</p>\n<p>そのとき、PRの本数や変更行数だけを見ても、開発が進んでいるかは判断できません。</p>\n<p>確認すべきなのは、要求された振る舞いが、対象環境と対象バージョンで成立したかです。</p>\n<p>そのためには、まずFigma MCPで画面設計を正確に参照する。</p>\n<p>次に、Business Scenario、API Scenario、UI Scenarioを分けてGherkinを作り込む。</p>\n<p>人間がそのGherkinを確認してから、AIエージェントへ実装を任せる。</p>\n<p>最後に、同じScenarioを対象環境で実行し、スクリーンショット、動画、ログ、APIレスポンス、データの状態をEvidenceとして残す。</p>\n<p>AIエージェント時代の完了報告は、</p>\n<blockquote>\n<p>実装できました。</p>\n</blockquote>\n<p>ではなく、</p>\n<blockquote>\n<p>このGherkinを、このCommitがデプロイされた環境で実行し、このEvidenceによってPASSを確認できます。</p>\n</blockquote>\n<p>へ変わっていくんだと思います。</p>\n<p>PRは実装の入口です。</p>\n<p>作り込まれたGherkinと、それに対応するEvidenceが揃って、初めて完了を判断できます。</p>\n<h2>参考にした書籍</h2>\n<p>Kamil Nicieja, <em>Writing Great Specifications: Using Specification by Example and Gherkin</em>, Manning Publications, 2018.</p>",
    "description": "AIエージェントがPRを作っただけでは要求を満たしたとは限りません。Figma MCP、UIとビジネスロジックを分けたGherkin、EvidenceをつなぐAI開発の完了条件を、実運用から解説します。",
    "category": "ai-development"
  }
} as const;

function jsonResponse(body: unknown, status = 200) {
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
  env: MicrocmsMcpEnv,
  name: string,
  args: Record<string, unknown>,
  id: number
): Promise<unknown> {
  const request = new Request('https://internal.beekle.invalid/mcp', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${INTERNAL_BEARER_TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id,
      method: 'tools/call',
      params: {
        name,
        arguments: args,
      },
    }),
  });

  const response = await handleMicrocmsMcpRequest(request, env);
  const rpc = (await response.json()) as {
    error?: { message?: string };
    result?: {
      isError?: boolean;
      content?: Array<{ type: string; text?: string }>;
    };
  };

  if (!response.ok || rpc.error || rpc.result?.isError) {
    throw new Error(rpc.error?.message || 'Beekle MCP tool call failed');
  }

  const text = rpc.result?.content?.find((item) => item.type === 'text')?.text;
  return text ? JSON.parse(text) : null;
}

export const GET: APIRoute = async ({ locals, url }) => {
  const token = url.searchParams.get('token') ?? '';
  const confirmed = url.searchParams.get('confirm') === 'publish';

  if (!confirmed || !token || (await sha256Hex(token)) !== EXPECTED_TOKEN_SHA256) {
    return jsonResponse({ ok: false, error: 'not_found' }, 404);
  }

  const runtimeEnv = (locals as {
    runtime?: { env?: Partial<MicrocmsMcpEnv> };
  }).runtime?.env;

  if (!runtimeEnv?.MICROCMS_SERVICE_DOMAIN || !runtimeEnv.MICROCMS_API_KEY) {
    return jsonResponse(
      {
        ok: false,
        error: 'microcms_credentials_unavailable',
        hasServiceDomain: Boolean(runtimeEnv?.MICROCMS_SERVICE_DOMAIN),
        hasApiKey: Boolean(runtimeEnv?.MICROCMS_API_KEY),
      },
      503
    );
  }

  const env: MicrocmsMcpEnv = {
    ...runtimeEnv,
    MICROCMS_SERVICE_DOMAIN: runtimeEnv.MICROCMS_SERVICE_DOMAIN,
    MICROCMS_API_KEY: runtimeEnv.MICROCMS_API_KEY,
    MCP_BEARER_TOKEN: INTERNAL_BEARER_TOKEN,
  };

  try {
    const updated = await callMcpTool(
      env,
      'microcms_update_content',
      UPDATE_ARGS as unknown as Record<string, unknown>,
      1
    );

    const verified = (await callMcpTool(
      env,
      'microcms_get_content',
      {
        endpoint: UPDATE_ARGS.endpoint,
        contentId: UPDATE_ARGS.contentId,
        fields: 'id,title,description,category,content,publishedAt,updatedAt',
      },
      2
    )) as {
      id?: string;
      title?: string;
      category?: string | { id?: string };
      content?: string;
      publishedAt?: string;
      updatedAt?: string;
    };

    const categoryId =
      typeof verified.category === 'string' ? verified.category : verified.category?.id;

    if (
      verified.title !== UPDATE_ARGS.fields.title ||
      categoryId !== UPDATE_ARGS.fields.category ||
      !verified.content?.includes(EXPECTED_PHRASE) ||
      !verified.publishedAt
    ) {
      throw new Error('Updated article verification failed');
    }

    return jsonResponse({
      ok: true,
      via: 'beekle_micro_cms.microcms_update_content',
      updated,
      verified: {
        id: verified.id,
        title: verified.title,
        category: categoryId,
        publishedAt: verified.publishedAt,
        updatedAt: verified.updatedAt,
        expectedPhrasePresent: true,
      },
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'unknown_error',
      },
      500
    );
  }
};
