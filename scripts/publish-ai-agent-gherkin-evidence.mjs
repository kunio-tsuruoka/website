import { createClient } from 'microcms-js-sdk';

const APPLY = process.argv.includes('--apply');
const SLUG = 'ai-agent-gherkin-evidence';
const CATEGORY = 'ai-development';
const TITLE = 'AIエージェントに実装を任せるなら、「できました」ではなく証拠を返させる';
const DESCRIPTION =
  'AIエージェントがPRを作っただけでは、要求を満たしたとは限りません。Figma MCP、UIとビジネスロジックを分けたGherkin、EvidenceをつなぐAI開発の完了条件を解説します。';

const CONTENT = `
<p>AIエージェントに開発を任せると、コードを書いてプルリクエストを作るところまでは、かなり速くなりました。</p>
<p>既存コードを読み、必要な変更を加え、自動テストを実行してPRを作る。以前なら人間が数時間かけていた作業を、短時間で終わらせられることもあります。</p>
<p>ただ、実際の開発では、PRができたところで仕事が終わるわけではありません。</p>
<blockquote><p>コードが変更されたことと、要求された機能が本当に利用できることは同じではありません。</p></blockquote>
<p>自動テストが通っていても、検証環境で操作すると動かないことがあります。画面は正しく見えていても、裏側ではデータが保存されている、あるいは保存されていないこともあります。</p>
<p>AIエージェント時代の完了条件は、「PRができた」ではなく、<strong>要求されたScenarioを実行し、その結果を証拠付きで確認できること</strong>へ変える必要があるんだと思います。</p>
<p>ただし、AIエージェントにスクリーンショットやログを返させれば、それだけでよいわけでもありません。Evidenceを集める前に、何をもってPASSとするのかをGherkinで作り込む必要があります。</p>

<h2>Evidenceの品質は、Gherkinの品質で決まる</h2>
<p>例えば、Scenarioに次のようにしか書かれていなかったとします。</p>
<pre><code>Scenario: メール未確認ユーザーを制限する
  Given メールアドレスが未確認である
  When 認証が必要な機能を利用する
  Then 利用できない</code></pre>
<p>このScenarioでは、何を実装し、何を確認すればよいのかが十分に定まりません。</p>
<p>「利用できない」とは、ボタンを非表示にすることなのか、操作後にエラーを表示することなのか、APIが403を返すことなのか、データを保存しないことなのか。どれも「利用できない」と表現できます。</p>
<p>このままAIエージェントにEvidenceを提出させても、都合のよい画面を一枚撮って「PASS」と判定できてしまいます。</p>
<p>Evidenceは要求を具体化するものではありません。<strong>すでに具体化された要求が成立したことを証明するもの</strong>です。</p>
<p>そのため、Evidenceを管理する仕組みより前に、検証可能なGherkinを作る必要があります。Gherkinの基本的な考え方は、<a href="/column/gherkin-bdd-introduction">Gherkin入門</a>でも解説しています。</p>

<h2>Figma MCPで画面設計を正確に参照する</h2>
<p>UIを実装する場合、AIエージェントにはFigma MCPを接続して、対象の画面やコンポーネントを直接参照させます。</p>
<p>スクリーンショットだけを渡すよりも、Figma MCPを使った方が、対象フレーム、コンポーネント構造、表示文言、レイアウト、画面状態、プロトタイプ上の遷移などを正確に取得できます。</p>
<p>ただし、Figmaから読み取れるのは、主に画面の構造とインタラクションです。</p>
<p>Figma上に送信ボタンが置かれていても、誰が押せるのか、どの状態なら押せるのか、押した結果どのデータが変わるのか、二重送信をどう防ぐのかまでは、必ずしも確定しません。</p>
<p>つまり、Figmaは重要ですが、Figmaだけでは業務仕様にならないんですよね。</p>
<p>そこで、Figma MCPで画面設計を参照したうえで、PM on Rails上にGherkinを作り込みます。</p>

<h2>UIシナリオとビジネスロジックを分ける</h2>
<p>Gherkinを作るうえで重要なのが、<strong>UI上のScenarioと、ビジネスロジックのScenarioを分けること</strong>です。</p>
<p>一つのScenarioに、画面操作、表示文言、権限判定、データ更新、通知処理まで全部書いてしまうと、仕様が読みにくくなります。それだけでなく、UIを少し変更しただけで、ビジネスルールのScenarioまで修正しなければならなくなります。</p>
<p>例えば、メール未確認の回答者が回答を送信できないというルールがあるとします。このルール自体は、画面上のボタンが右側にあるか、下部にあるか、モーダルを使うか、別画面へ遷移するかとは関係ありません。</p>
<p>まず、ビジネスロジックを表すScenarioを作ります。</p>
<pre><code>Feature: 回答送信の可否

  Rule: メール未確認の回答者は回答を確定できない

    Scenario: メール未確認の回答者による回答送信を拒否する
      Given 回答者としてログイン済みである
      And 回答者の email_verified_at が未設定である
      And 回答可能な案件が存在する
      When 回答者が案件への回答を送信する
      Then 回答は登録されない
      And 案件の回答状態は変更されない
      And メール確認が必要であることを示す結果を返す</code></pre>
<p>ここでは、UI上でどのボタンを押すかは書いていません。</p>
<p>定義しているのは、メール未確認なら回答を登録しない、案件の状態も変えない、メール確認が必要であることを呼び出し元へ返す、というシステムとして守るべきルールです。</p>
<p>画面が変わっても、API経由になっても、このルールは変わりません。</p>
<p>一方で、UIのScenarioは別に作ります。</p>
<pre><code>Feature: 回答画面でのメール確認案内

  Scenario: メール未確認の回答者に確認導線を表示する
    Given メール未確認の回答者としてログイン済みである
    And 回答者が案件回答画面を表示している
    And 必須項目への入力が完了している
    When 回答者が「回答を送信する」を実行する
    Then 回答は完了状態として表示されない
    And メールアドレスの確認が必要であることを画面上に表示する
    And 確認メールを再送できる導線を表示する</code></pre>
<p>こちらは、利用者から観測できる振る舞いを表しています。</p>
<p>どの画面で、どの操作を行い、何が表示されるのか。見た目やコンポーネントの詳細はFigmaを参照しつつ、利用者が達成できること、確認できることをGherkinへ記述します。</p>

<h2>分けるが、切り離さない</h2>
<p>UI Scenarioとビジネスロジックを分けるといっても、別々に管理して関係が分からなくなっては意味がありません。</p>
<p>重要なのは、<strong>分離したうえで追跡可能につなぐこと</strong>です。</p>
<pre><code>User Story
  ├─ Business Scenario
  │    └─ メール未確認の場合、回答を登録しない
  │
  └─ UI Scenario
       └─ 回答画面でメール確認の案内と再送導線を表示する</code></pre>
<p>UI Scenarioは、対応するBusiness Scenarioを参照します。</p>
<p>これにより、画面上の表示だけは正しいのに、裏側では回答が保存されてしまっているような不具合を防ぎやすくなります。</p>
<p>反対に、バックエンドでは正しく拒否しているものの、画面上では何の説明もなく操作が失敗する、といった状態も検出できます。</p>
<p>UIとビジネスロジックの両方がPASSして、初めて利用者に提供できる機能になります。</p>

<h2>UIの細部はFigma、振る舞いはGherkin</h2>
<p>UI Scenarioを詳しく書くことと、Figma上の見た目をすべてGherkinへ転記することは違います。</p>
<p>例えば、次のような記述は避けた方がよいと思います。</p>
<pre><code>Then 画面右上から24pxの位置に赤色のモーダルを表示する</code></pre>
<p>余白や色、フォント、コンポーネントの形状までGherkinに書くと、デザイン変更のたびにScenarioを修正することになります。</p>
<p>Gherkinには、利用者から見た意味を書きます。</p>
<pre><code>Then メール確認が必要であることを画面上に表示する
And 確認メールを再送できる導線を表示する</code></pre>
<p>その表示をモーダルにするのか、インラインメッセージにするのか。どのコンポーネントを使い、どの位置に表示するのかはFigmaを参照します。</p>
<ul>
<li><strong>Figma</strong>：どのように見せるかの正本</li>
<li><strong>Gherkin</strong>：何が起きるべきかの正本</li>
<li><strong>コード</strong>：それを実現する実装</li>
<li><strong>Evidence</strong>：実際に成立したことの記録</li>
</ul>
<p>この役割分担がかなり重要です。</p>

<h2>AIエージェントへ渡す前に、人間がGherkinを確認する</h2>
<p>FigmaからGherkinを生成する作業にも、AIを使えます。</p>
<p>AIにFigma MCPと既存の要求を読ませれば、画面ごとの正常系、異常系、権限差分、状態遷移の候補をかなりの速度で洗い出せます。</p>
<p>ただし、生成されたGherkinをそのまま実装へ渡すのは危険です。Gherkinは単なる実装指示ではなく、何をもって開発完了とするかを決める契約だからです。</p>
<p>実装前に人間が、少なくとも次の点を確認します。</p>
<ul>
<li>アクターは正しいか</li>
<li>前提状態が不足していないか</li>
<li>操作が曖昧ではないか</li>
<li>結果が観測可能になっているか</li>
<li>UIとビジネスルールが混ざっていないか</li>
<li>データが変更される場合、変更後の状態が書かれているか</li>
<li>失敗時に変更されないものも定義されているか</li>
<li>権限、重複操作、期限切れなどの例外が漏れていないか</li>
</ul>
<p>ここを作り込まずにAIエージェントへ実装を任せると、実装速度は上がっても、確認と手戻りが増えてしまいます。</p>
<p>AI開発では、コードを書く前のGherkin設計が、以前より重要になるんですよね。</p>

<h2>実装後は、同じGherkinで検証する</h2>
<p>Gherkinを作り込んだら、AIエージェントへFigmaとScenarioを渡して実装させます。</p>
<pre><code>Demand
  ↓
User Story
  ↓
Figmaによる画面設計
  ↓ Figma MCPで参照
Business Scenario / UI Scenario
  ↓ 人間によるGherkinレビュー
Implementation Task
  ↓ AIエージェントが実装
Pull Request
  ↓ Preview / Stagingへデプロイ
Scenario Test Run
  ↓
Evidence
  ↓
PASS / FAIL</code></pre>
<p>重要なのは、実装時に参照したScenarioと、検証時に実行するScenarioが同じであることです。</p>
<p>実装用の指示と受け入れテストが別々に書かれていると、途中で解釈がずれます。</p>
<p>Gherkinを実装と検証の両方に使うことで、何を作るように依頼したのか、何が作られたのか、何を確認してPASSとしたのかを一つの線で追えるようになります。</p>

<h2>EvidenceもUIとビジネスロジックで分ける</h2>
<p>Scenarioを分けると、必要なEvidenceも明確になります。</p>
<p>UI Scenarioに対しては、次のようなEvidenceが中心になります。</p>
<ul>
<li>操作前後のスクリーンショット</li>
<li>一連の操作を記録した動画</li>
<li>Test URL</li>
<li>ブラウザコンソール</li>
<li>Networkログ</li>
<li>表示された文言や画面状態</li>
</ul>
<p>ビジネスロジックのScenarioに対しては、別のEvidenceが必要です。</p>
<ul>
<li>APIリクエストとレスポンス</li>
<li>ステータスコード</li>
<li>実行前後のデータ</li>
<li>状態遷移</li>
<li>アプリケーションログ</li>
<li>発行されたイベント</li>
<li>ジョブの実行結果</li>
<li>データが作成されなかったことの確認</li>
</ul>
<p>例えば、エラーメッセージが表示されたスクリーンショットは、UI ScenarioのEvidenceにはなります。</p>
<p>しかし、「回答が登録されなかった」というビジネスルールのEvidenceには、それだけでは不十分です。データの状態、APIレスポンス、監査ログなども確認する必要があります。</p>
<p>どのEvidenceが必要かは、GherkinのThenから逆算できます。</p>

<h2>PM on RailsではScenarioとEvidenceをつなげている</h2>
<p>私たちは、<a href="https://pmonrails.com">PM on Rails</a>というAIエージェント型の開発管理システムを、実際の開発で使っています。</p>
<p>PM on Railsでは、要求からUser Story、GherkinのScenario、Task、実装、テストまでをつなげています。</p>
<p>Scenarioのテスト結果には、次の情報を登録できます。</p>
<ul>
<li>検証環境</li>
<li>Test URL</li>
<li>PASS / FAIL</li>
<li>スクリーンショット、動画、ログ</li>
<li>実行者</li>
<li>実行日時</li>
<li>対象のCommitやDeploy</li>
</ul>
<p>Cursor AgentなどのAIエージェントからも、コードだけではなく、Scenarioの実行結果とEvidenceを登録できるようにしました。</p>
<p>そのため、AIエージェントの仕事を「コードを変更してPRを作る」ところで終わらせず、<strong>対象のScenarioを実行し、期待された結果になったことをEvidence付きで登録する</strong>ところまで広げられます。</p>
<p>ただし、この仕組みが有効に働くかどうかは、最初に作るGherkinにかかっています。</p>
<p>曖昧なScenarioからは、曖昧な実装と曖昧なEvidenceしか生まれません。</p>

<h2>「できました」から「この証拠で確認できます」へ</h2>
<p>AIエージェントは、これからさらに多くのコードを書くようになると思います。</p>
<p>そのとき、PRの本数や変更行数だけを見ても、開発が進んでいるかは判断できません。確認すべきなのは、要求された振る舞いが、対象環境と対象バージョンで成立したかです。</p>
<p>まずFigma MCPで画面設計を正確に参照する。次に、UI Scenarioとビジネスロジックを分けてGherkinを作り込む。人間がそのGherkinを確認してから、AIエージェントへ実装を任せる。</p>
<p>最後に、同じScenarioを対象環境で実行し、スクリーンショット、動画、ログ、APIレスポンス、データの状態をEvidenceとして残します。</p>
<p>AIエージェント時代の完了報告は、「実装できました」ではなく、次の形へ変わっていくんだと思います。</p>
<blockquote><p>このGherkinを、このCommitがデプロイされた環境で実行し、このEvidenceによってPASSを確認できます。</p></blockquote>
<p>PRは実装の入口です。</p>
<p>作り込まれたGherkinと、それに対応するEvidenceが揃って、初めて完了を判断できます。</p>

{{CONTACT_CTA}}
`.trim();

if (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY) {
  throw new Error('MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY are required');
}

if (!TITLE || !DESCRIPTION || CONTENT.length < 1000) {
  throw new Error('Article validation failed');
}

console.log(`mode     : ${APPLY ? 'APPLY (published)' : 'DRY-RUN'}`);
console.log(`slug     : ${SLUG}`);
console.log(`category : ${CATEGORY}`);
console.log(`title    : ${TITLE} (${TITLE.length} chars)`);
console.log(`desc     : ${DESCRIPTION} (${DESCRIPTION.length} chars)`);
console.log(`content  : ${CONTENT.length} chars`);

if (!APPLY) {
  process.exit(0);
}

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const article = {
  title: TITLE,
  content: CONTENT,
  category: CATEGORY,
  description: DESCRIPTION,
};

let existing = null;
try {
  existing = await client.get({ endpoint: 'columns', contentId: SLUG });
} catch (error) {
  const status = error?.response?.status ?? error?.status;
  if (status !== 404 && !String(error?.message ?? '').includes('404')) {
    throw error;
  }
}

if (existing) {
  await client.update({
    endpoint: 'columns',
    contentId: SLUG,
    content: article,
  });
  console.log(`[OK] updated: ${SLUG}`);
} else {
  await client.create({
    endpoint: 'columns',
    contentId: SLUG,
    content: article,
  });
  console.log(`[OK] created and published: ${SLUG}`);
}

const verified = await client.get({
  endpoint: 'columns',
  contentId: SLUG,
  queries: { fields: 'id,title,category,publishedAt,updatedAt' },
});

if (!verified.publishedAt || verified.title !== TITLE || verified.category?.id !== CATEGORY) {
  throw new Error(`Published article verification failed: ${JSON.stringify(verified)}`);
}

console.log(
  `[VERIFIED] id=${verified.id} category=${verified.category.id} publishedAt=${verified.publishedAt} updatedAt=${verified.updatedAt}`
);
