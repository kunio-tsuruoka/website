import { createClient } from 'microcms-js-sdk';

const APPLY = process.argv.includes('--apply');
const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

if (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY) {
  throw new Error('MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY are required');
}

const STANDARD_FLOW = '要求（Why） → User Story → 具体例 → Gherkin → レビュー → 実装・検証';

function esc(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceSection(content, startHeading, endHeading, replacement, changes, label) {
  const re = new RegExp(
    `<h2(?:\\s[^>]*)?>\\s*${esc(startHeading)}\\s*</h2>[\\s\\S]*?(?=<h2(?:\\s[^>]*)?>\\s*${esc(endHeading)}\\s*</h2>)`,
    'm'
  );
  if (!re.test(content)) return content;
  changes.push(label);
  return content.replace(re, replacement.trim());
}

function replaceRegex(content, re, replacement, changes, label) {
  if (!re.test(content)) return content;
  changes.push(label);
  return content.replace(re, replacement);
}

function removeWorkflowLinks(content, changes) {
  const before = content;
  content = content.replace(/<li[^>]*>[\s\S]*?href=["']\/column\/ears-gherkin-workflow["'][\s\S]*?<\/li>/gi, '');
  content = content.replace(/<a[^>]*href=["']\/column\/ears-gherkin-workflow["'][^>]*>[\s\S]*?<\/a>/gi, '');
  if (content !== before) changes.push('旧EARS×Gherkin主要導線を削除');
  return content;
}

const gherkinExampleSection = `
<h2>Gherkinは「具体例」から書く</h2>
<p>Beekleでは、User Storyを書いたあとに別の記法へ機械的に変換するのではなく、まず<strong>具体例</strong>を出します。User Storyは「誰が・何を・なぜ」を共有するためのものですが、それだけでは完成条件までは決まりません。</p>
<p>実装前に、少なくとも次の観点で「実際に何が起きれば完成なのか」を確認します。</p>
<ul>
<li>正常系：期待どおり使えた場合</li>
<li>異常系：入力不備、権限不足、外部サービス障害など</li>
<li>境界値：0件、上限値、期限直前など</li>
<li>再送・二重操作：同じ操作を繰り返した場合</li>
<li>業務上の例外：現場で起こる特殊ケース</li>
</ul>
<p>関係者で合意できた具体例だけをGiven / When / Thenへ落とします。これにより、Gherkinは「それらしい仕様文」ではなく、<strong>これが動けば完成と判断できるExecutable Specification</strong>になります。</p>
<p>EARSは、条件付きの要件文を短く揃えたい案件では補助的に使える記法です。ただし、<strong>Beekleの標準工程では必須の中間成果物ではありません</strong>。標準は「${STANDARD_FLOW}」です。</p>
`;

const gherkinStepsSection = `
<h2>Gherkinを導入するステップ</h2>
<h3>Step 1: User Storyで「誰が・何を・なぜ」を揃える</h3>
<p>機能名ではなく、利用者が達成したいことと、その理由を明確にします。</p>
<h3>Step 2: 正常系・異常系・境界値の具体例を出す</h3>
<p>いきなりGherkinを書かず、「この場合はどうなる？」を先に出します。答えが決まっていない例は、未確定事項として残します。</p>
<h3>Step 3: 決まった具体例だけをGherkinにする</h3>
<p>1 Scenario = 1つの検証可能な振る舞いを原則に、Given / When / Thenで完成条件を固定します。</p>
<h3>Step 4: 実装前にGherkinをレビューする</h3>
<p>正常系しかない、境界値が抜けている、Scenario同士が矛盾している、ThenがUser Storyの価値とつながっていない、といった問題をAIと人間の両方で確認します。</p>
<h3>Step 5: ステップ定義を実装する</h3>
<p>Cucumber、Behave、pytest-bdd、Playwright BDDなどでGherkinを実行可能なテストへ接続します。UI selectorや関数名などの実装詳細はGherkinへ書かず、ステップ定義側へ閉じ込めます。</p>
<h3>Step 6: CIで継続実行する</h3>
<p>毎回のpush / PRでScenarioを実行します。仕様変更時はUser Story・具体例・Gherkin・実装を同じ変更として更新し、仕様とテストの乖離を防ぎます。</p>
`;

const gherkinSummary = `
<h2>まとめ</h2>
<p>Gherkinは、ビジネスサイドが読める自然言語と、自動実行できる受入テストをつなぐための記法です。Beekleでは、Gherkin単体ではなく、<strong>${STANDARD_FLOW}</strong>という流れの中で使います。</p>
<ul>
<li>User Story：誰が・何を・なぜ必要としているか</li>
<li>具体例：正常系・異常系・境界値で完成条件を具体化する</li>
<li>Gherkin：合意した具体例をGiven / When / Thenで固定する</li>
<li>レビュー：抜け漏れ・矛盾・未確定事項を実装前に潰す</li>
<li>CI：Scenarioを受入テスト・回帰テストとして継続実行する</li>
</ul>
<p>EARSは案件によって補助的に使えますが、Beekle標準工程の必須ステップではありません。</p>
`;

const projectStep5 = `
<h2>STEP 5: User Story → 具体例 → Gherkinで「作る」要件を仕様化する</h2>
<p>FMで「作る」と判定された要求だけを詳細化します。先に書式を埋めるのではなく、<strong>User Storyで目的を揃え、具体例で完成条件を詰め、決まった例をGherkinにする</strong>のがポイントです。</p>
<h3>User Storyで「誰が・何を・なぜ」を揃える</h3>
<p>「As a 〜 / I want to 〜 / So that 〜」で、利用者・達成したいこと・価値を1つにまとめます。書き方は<a href="/column/user-story-template-examples">ユーザーストーリーの書き方完全ガイド</a>を参照してください。</p>
<h3>具体例を先に出す</h3>
<p>ストーリーごとに正常系だけでなく、異常系・境界値・権限差・再送・外部サービス障害などを確認します。「もしネットワークが切れたら？」「同じボタンを2回押したら？」「権限が違ったら？」のように、実際の業務で起きる例を先に出します。答えが決まっていないものは未確定事項として残し、勝手に仕様化しません。</p>
<h3>決まった具体例をGherkinで完成条件にする</h3>
<p>合意できた例をGiven / When / Thenへ落とします。Gherkinは仕様書として読めるだけでなく、受入デモと自動テストの共通ソースにできます。記法は<a href="/column/gherkin-bdd-introduction">Gherkin入門</a>を参照してください。</p>
<pre><code>Scenario: 在庫検索の応答時間
  Given 商品マスタが10万件登録されている
  When 店舗マネージャーがキーワード「冷凍」で検索する
  Then 検索結果は1秒以内に表示される</code></pre>
<h3>実装前にGherkinをレビューする</h3>
<p>実装へ渡す前に、正常系しか書かれていない、境界値が抜けている、Scenario同士が矛盾している、ThenがUser Storyの「なぜ」とつながっていない、といった問題をレビューします。ここで抜け漏れを潰してから実装へ進むことで、AIでコードを書く速度が上がっても手戻りが増えにくくなります。</p>
<h3>非機能要件・制約は別枠で明示する</h3>
<p>性能・セキュリティ・可用性・法務・外部サービス制約などは、User Storyだけに押し込まず明示的に管理します。観測可能な完成条件はGherkin Scenarioとして受入テストへ接続します。</p>
`;

const requirementsExamplesSection = `
<h2>User Storyを具体例と受け入れ条件へ落とす</h2>
<p>機能要件を曖昧さなくするために重要なのは、記法を先に選ぶことではなく、<strong>実際に起こる具体例を先に確認すること</strong>です。</p>
<ol>
<li>User Storyで「誰が・何を・なぜ」を揃える</li>
<li>正常系・異常系・境界値・権限差などの具体例を出す</li>
<li>決まっていない例は未確定事項として残す</li>
<li>合意できた例をGherkinのGiven / When / Thenで完成条件にする</li>
<li>実装前に抜け漏れと矛盾をレビューする</li>
</ol>
<pre><code>Scenario: 在庫がない商品を注文できない
  Given 商品Aの在庫が0件である
  When 顧客が商品Aをカートに追加する
  Then 「在庫がありません」と表示される
  And 注文データは作成されない</code></pre>
<p>この形なら、業務担当者が読める仕様と、実装後に自動実行する受入テストを同じScenarioでつなげられます。詳しくは<a href="/column/gherkin-bdd-introduction">Gherkin入門</a>を参照してください。</p>
<p>EARSは、条件付きの要件文を一定の構文で揃えたい場合に使える補助記法です。ただし、Beekle標準工程では必須ではありません。</p>
`;

const aiStep3 = `
<h2>STEP 3: 具体例をGherkinにして、実装前にレビューする</h2>
<p>FMで「作る」と判定されたUser Storyについて、まず正常系・異常系・境界値の具体例を出します。ここを飛ばしていきなりGherkinへ変換すると、形式は整っていても重要な例外が抜けた仕様になりがちです。</p>
<p>合意できた具体例だけをGiven / When / ThenのGherkinにします。Gherkinは3つの役割を1つの記述で兼ねられます。</p>
<ul>
<li>仕様書として業務担当者が読める</li>
<li>受入デモのシナリオとして確認できる</li>
<li>自動テストとしてCIで継続実行できる</li>
</ul>
<p>書いた後は実装前にレビューします。「正常系しかないか」「0件・上限・権限差などの境界が抜けていないか」「Scenario同士が矛盾していないか」「ThenがUser Storyの目的とつながっているか」を確認してからAI実装へ渡します。</p>
<p>書き方は<a href="/column/gherkin-bdd-introduction">Gherkin入門</a>、全体の流れは<a href="/column/requirements-definition-template">要件定義書テンプレート</a>を参照してください。</p>
`;

const requirementsTemplateExamples = `
<h2>具体例からGherkinで完成条件を作る</h2>
<p>User Storyで「誰が・何を・なぜ」を共有したら、次はそのストーリーが<strong>どんな場合にどう動けば完成なのか</strong>を具体例で確認します。</p>
<h3>先に具体例を出す</h3>
<ul>
<li>正常系：登録済みメールアドレスでパスワード再設定する</li>
<li>異常系：未登録メールアドレスを入力する</li>
<li>境界値：再設定リンクの有効期限を過ぎる</li>
<li>セキュリティ：登録有無を第三者に推測させない</li>
</ul>
<p>答えが決まっていない例は、この段階で未確定事項として残します。実装者や生成AIに推測で埋めさせないことが重要です。</p>
<h3>決まった例をGherkinにする</h3>
<pre><code>Feature: パスワード再設定
  Scenario: 登録済みメールアドレスへ再設定リンクを送る
    Given ユーザーのメールアドレスが登録済みである
    When ユーザーがパスワード再設定を申請する
    Then 1時間有効な再設定リンクがメールで送信される

  Scenario: 未登録メールアドレスでも登録有無を漏らさない
    Given 入力されたメールアドレスが未登録である
    When ユーザーがパスワード再設定を申請する
    Then 登録済みの場合と同じ完了メッセージが表示される</code></pre>
<p>Gherkinを書いたら実装前に、正常系だけに偏っていないか、境界値・権限差・再送・外部サービス障害が抜けていないかをレビューします。そのScenarioをstep definitionへ接続し、CIの受入・回帰テストとして継続実行します。</p>
<p><strong>EARSは補助記法です。</strong> 条件付きの要件文を一定の型で揃えたい案件では有効ですが、Beekle標準工程の必須成果物ではありません。標準は「${STANDARD_FLOW}」です。</p>
`;

const requirementsTemplateSummary = `
<h2>まとめ：要件定義は「Why → User Story → 具体例 → Gherkin」でつなぐ</h2>
<p>重要なのは、テンプレートを埋めること自体ではなく、要求の背景から完成条件までが一本につながっていることです。</p>
<ul>
<li>要求（Why）で、なぜ必要なのかを残す</li>
<li>User Storyで、誰が・何を・なぜを揃える</li>
<li>具体例で、正常系・異常系・境界値を確認する</li>
<li>Gherkinで、合意した具体例を実行可能な完成条件にする</li>
<li>実装前レビューで抜け漏れと矛盾を潰す</li>
</ul>
<p>この流れにすると、要件定義書・受入テスト・実装の間で情報が落ちにくくなります。</p>
`;

const legacyEarsContent = `
<h2>先に結論：EARSは補助記法で、Beekle標準の必須工程ではありません</h2>
<p>EARSとGherkinは併用できます。ただし、現在のBeekleでは<strong>EARSを必須の中間成果物にはしていません</strong>。標準の流れは「${STANDARD_FLOW}」です。</p>
<p>理由はシンプルで、要件を別の記法へ変換すること自体よりも、業務担当者と開発者が<strong>具体例を使って完成条件を発見すること</strong>の方が重要だからです。</p>

<h2>現在のBeekle標準フロー</h2>
<ol>
<li><strong>要求（Why）</strong>：背景、課題、期待する価値を確認する</li>
<li><strong>User Story</strong>：誰が・何を・なぜ必要としているかを揃える</li>
<li><strong>具体例</strong>：正常系・異常系・境界値・権限差・再送などを洗い出す</li>
<li><strong>Gherkin</strong>：合意した具体例をGiven / When / Thenで完成条件にする</li>
<li><strong>レビュー</strong>：抜け漏れ・矛盾・未確定事項を実装前に確認する</li>
<li><strong>実装・検証</strong>：step definitionへ接続し、CIで受入・回帰テストとして実行する</li>
</ol>

<h2>EARSを使うと有効な場面</h2>
<p>EARSは不要という意味ではありません。次のような場面では、要件文の補助記法として有効です。</p>
<ul>
<li>安全性・規制対応など、条件とシステムの振る舞いを厳密な一文で残したい</li>
<li>大量の機能要件を同じ文型でレビューしたい</li>
<li>非機能要件や例外条件を文章として監査可能に残したい</li>
<li>既存組織ですでにEARSが標準化されている</li>
</ul>
<p>この場合でも、EARSから機械的にGherkinへ変換して終わりにはしません。User Storyの目的と具体例を確認し、Gherkinは受入可能な振る舞いとしてレビューします。</p>

<h2>なぜ「EARS → Gherkin」を標準にしないのか</h2>
<ul>
<li>中間成果物が増えるほど、同じ仕様を二重管理しやすい</li>
<li>文型が整っていても、業務上の例外や境界値が見つかるとは限らない</li>
<li>生成AIは形式変換が得意なので、誤った前提まで綺麗に変換してしまう</li>
<li>受入テストで本当に必要なのは、関係者が合意した具体例である</li>
</ul>
<p>そのためBeekleでは、まず具体例を発見し、決まった例だけをExecutable Specificationへ変換する流れを採っています。</p>

<h2>例：パスワード再設定</h2>
<h3>User Story</h3>
<p>利用者として、パスワードを忘れたときに自分で再設定したい。なぜなら、問い合わせを待たずにログインを回復したいから。</p>
<h3>具体例</h3>
<ul>
<li>登録済みメールアドレスなら再設定リンクが届く</li>
<li>未登録メールアドレスでも登録有無を漏らさない</li>
<li>期限切れリンクは使用できない</li>
<li>同じリンクを再利用できない</li>
</ul>
<h3>Gherkin</h3>
<pre><code>Scenario: 未登録メールアドレスでも登録有無を漏らさない
  Given 入力されたメールアドレスが未登録である
  When パスワード再設定を申請する
  Then 登録済みの場合と同じ完了メッセージが表示される
  And 再設定メールは送信されない</code></pre>
<p>EARSを採用する案件であれば、この具体例の一部を条件付き要件文として併記できます。重要なのは、EARSの有無ではなく、User Story・具体例・Gherkin・テストの意味が一致していることです。</p>

<h2>Gherkinは実装前にレビューする</h2>
<p>Gherkinを書いたら、実装へ渡す前にAIと人間で敵対的にレビューします。正常系しかない、境界値がない、Scenario同士が矛盾している、ThenがUser Storyの価値とつながっていない、未確定事項を勝手に確定している、といった問題をここで潰します。</p>

<h2>まとめ</h2>
<p>EARSとGherkinは併用可能ですが、現在のBeekle標準はEARSを必須にしません。<strong>${STANDARD_FLOW}</strong>を一気通貫にし、Gherkinを受入テスト・回帰テストとしてCIで実行することを重視しています。</p>
<ul>
<li><a href="/column/requirements-definition-template">要件定義書テンプレート</a></li>
<li><a href="/column/user-story-template-examples">ユーザーストーリーの書き方</a></li>
<li><a href="/column/gherkin-bdd-introduction">Gherkin入門</a></li>
<li><a href="/column/ears-requirements-syntax-guide">EARS入門（補助記法として使う場合）</a></li>
</ul>
`;

function transformColumn(id, article) {
  let content = article.content;
  let title = article.title;
  const changes = [];

  if (id === 'gherkin-bdd-introduction') {
    content = replaceSection(content, 'Gherkin と EARS の関係', 'Gherkin を実行する：主要フレームワーク', gherkinExampleSection, changes, 'EARS変換節 → 具体例起点へ');
    content = replaceSection(content, 'Gherkin を導入するステップ', 'Gherkin を使う／使わない場面', gherkinStepsSection, changes, '導入ステップをBeekle標準へ');
    content = replaceSection(content, 'まとめ', '関連記事', gherkinSummary, changes, 'まとめをBeekle標準へ');
    content = removeWorkflowLinks(content, changes);
    content = replaceRegex(content, /EARS記法やGherkinを実際のプロジェクトで使うには/g, 'User StoryやGherkinを実際のプロジェクトで使うには', changes, 'CTAの旧EARS標準表現を修正');
  }

  if (id === 'project-management-complete-guide') {
    content = replaceSection(content, 'STEP 5: ユーザーストーリー＋EARS＋Gherkin で「作る」要件を仕様化する', 'STEP 6: Laravel + Inertia でプロトタイプを実装する', projectStep5, changes, 'STEP 5をBeekle標準へ');
    content = replaceRegex(content, /STEP 5 ユーザーストーリー＋EARS＋Gherkin/g, 'STEP 5 User Story → 具体例 → Gherkin → レビュー', changes, 'まとめのSTEP 5表記を修正');
    content = removeWorkflowLinks(content, changes);
  }

  if (id === 'requirements-definition-complete-guide') {
    content = replaceSection(content, '要件の書き方ルール：EARS記法', '要件定義のスコープ管理', requirementsExamplesSection, changes, 'EARS標準節 → 具体例/Gherkinへ');
  }

  if (id === 'ai-development-speed') {
    content = replaceSection(content, 'STEP 3: 残った要件を Gherkin に変換する', 'STEP 4: Laravel Inertia でプロトタイプを実装する', aiStep3, changes, 'STEP 3を具体例/Gherkinレビューへ');
    content = removeWorkflowLinks(content, changes);
  }

  if (id === 'user-story-template-examples') {
    content = replaceRegex(
      content,
      /<p>近年は、受入条件をさらに曖昧さなく書く構文として[\s\S]*?現代のベストプラクティスです。[\s\S]*?<\/p>/,
      '<p>受入条件を書いたら、正常系だけでなく異常系・境界値・権限差などの<strong>具体例</strong>を先に出します。合意できた例をGherkinのGiven / When / Thenにすると、「これが動けば完成」という受入条件をそのまま自動テストへ接続できます。EARSは条件付き要件文を一定の型で揃えたい場合に使える補助記法ですが、Beekle標準工程の必須ステップではありません。</p>',
      changes,
      '受入条件のEARS標準表現を修正'
    );
  }

  if (id === 'requirements-definition-template') {
    if (title?.includes('EARS記法とユーザーストーリー')) {
      title = '要件定義書のテンプレート・サンプル｜User Story・具体例・Gherkinの実例＋Word/Markdown無料DL';
      changes.push('タイトルを現行標準へ');
    }
    content = replaceRegex(content, /その書き方の核となる2つの記法（EARS／ユーザーストーリー）を、サンプル付きで公開します。/g, 'その書き方の核となる「User Story → 具体例 → Gherkin」の流れを、サンプル付きで公開します。', changes, '導入文を現行標準へ');
    content = replaceRegex(content, /4\. 機能要件（EARS記法）/g, '4. 具体例・受け入れ条件（Gherkin）', changes, 'テンプレート章立てを現行標準へ');
    content = replaceSection(content, 'EARS記法の5パターン（実例付き）', 'テンプレート無料ダウンロード', requirementsTemplateExamples, changes, 'EARS標準節 → 具体例/Gherkinへ');
    content = replaceRegex(content, /「作る」と判定した要求をユーザーストーリー化し、EARS記法で機能要件[^<]*/g, '「作る」と判定した要求をUser Story化し、正常系・異常系・境界値の具体例を出してGherkinで完成条件を固定する', changes, '進め方のSTEP 4を修正');
    content = replaceSection(content, 'まとめ：要件定義は「ストーリー＋EARS」で曖昧さを潰す', 'Beekleの進め方', requirementsTemplateSummary, changes, 'まとめを現行標準へ');
    content = replaceRegex(content, /Beekleでは、要件定義フェーズで[^<]*ユーザーストーリーとEARS要件を書き起こすワークショップ[^<]*。/g, `Beekleでは、要件定義フェーズで発注側と共同し、要求（Why）からUser Story、具体例、Gherkinまでをつなげてレビューするワークショップを行います。`, changes, 'Beekleの進め方を修正');
  }

  if (id === 'engineer-communication') {
    content = replaceRegex(content, /ユーザーストーリー＋EARS＋Gherkin/g, 'User Story → 具体例 → Gherkin', changes, '旧3層表記を修正');
    content = replaceRegex(content, /ユーザーストーリー＋EARS/g, 'User Story → 具体例', changes, '旧2層表記を修正');
    content = removeWorkflowLinks(content, changes);
  }

  if (id === 'ears-gherkin-workflow') {
    title = 'EARS×Gherkinの使い分け｜EARSは補助記法、具体例→GherkinがBeekle標準';
    content = legacyEarsContent;
    changes.push('旧標準ワークフロー記事を現行方針へ全面改稿');
  }

  return { title, content, changes };
}

const qaUpdates = {
  'requirements-8': {
    answer: '<p><strong>EARS（Easy Approach to Requirements Syntax）は、条件とシステムの振る舞いを一定の型で書くための要件記法です。</strong></p><p>安全性・規制対応などで要件文の形式を揃えたい場合や、大量の条件付き要件をレビューしたい場合には有効です。ただし、現在のBeekleではEARSを標準工程の必須ステップにはしていません。</p><p>Beekleの標準は「要求（Why） → User Story → 具体例 → Gherkin → レビュー → 実装・検証」です。EARSは必要な案件で補助的に使います。EARSそのものの5パターンと書き方は<a href="/column/ears-requirements-syntax-guide">EARS入門</a>を参照してください。</p>',
  },
  'requirements-9': {
    answer: '<p><strong>Gherkinは、関係者で合意した具体例をGiven / When / Thenで「これが動けば完成」という形に固定したい場面で使います。</strong></p><p>BeekleではUser Storyを書いた後、いきなりGherkinへ変換せず、正常系・異常系・境界値などの具体例を先に出します。決まった例だけをGherkinにし、実装前に抜け漏れ・矛盾をレビューします。</p><p>そのScenarioをCucumber、pytest-bdd、Playwright BDDなどのstep definitionへ接続すると、同じ記述を受入テスト・回帰テストとしてCIで継続実行できます。詳しくは<a href="/column/gherkin-bdd-introduction">Gherkin入門</a>と<a href="/column/requirements-definition-template">要件定義書テンプレート</a>を参照してください。</p>',
  },
  'requirements-14': {
    question: 'User StoryからGherkinへはどうつなげますか？',
    answer: '<p><strong>User Storyを書いたら、いきなりGherkinへ変換せず、まず具体例を出します。</strong></p><p>正常系・異常系・境界値について「実際に何が起きれば完成なのか」を業務担当者と確認し、決まった例だけをGiven / When / Thenへ落とします。Gherkinを書いた後は、実装前に抜け漏れ・矛盾・未確定事項をレビューします。</p><p>実装後はScenarioをstep definitionへ接続し、受入テスト・回帰テストとしてCIで継続実行します。流れは「要求（Why） → User Story → 具体例 → Gherkin → レビュー → 実装・検証」です。</p>',
  },
  'project-management-15': {
    answer: '<p><strong>要件定義は「ベンダー任せ」では失敗します。発注者が担うのは、文書を大量に書くことではなく、業務上のWhyと優先順位、完成条件の意思決定です。</strong></p><p>進め方は、(1) ステークホルダー特定 → (2) 業務目的とKPI → (3) As-Is / To-Be → (4) 要求をUser Storyへ整理 → (5) FM法で作る／後回し／作らないを決定 → (6) 正常系・異常系・境界値の具体例を出す → (7) Gherkinで完成条件を固定し、実装前レビュー → プロトタイプ／実装、という流れです。</p><p>記法を埋めることよりも、「誰が何のために使い、どの例が動けば受け入れられるか」を合意することが重要です。詳しくは<a href="/column/project-management-01">要件定義の進め方</a>を参照してください。</p>',
  },
  'project-management-16': {
    answer: '<p><strong>「今どの工程の話をしているか」を最初に揃え、そのうえで「もし◯◯が起きたら？」という具体例を聞くと抜け漏れが減ります。</strong></p><p>Beekleでは「アクター → As-Is / To-Be → 要求（Why） → User Story → 具体例 → Gherkin／レビュー → 実装」のどこを議論しているかを明示します。場所のない依頼は、仕様なのか要望なのか実装案なのかが混ざるためです。</p><p>具体例では「ネットが不安定だったら？」「権限が違ったら？」「0件だったら？」「同じ操作を2回したら？」「外部サービスが落ちたら？」などを確認します。すぐ答えが出ないものは未確定事項として残し、Gherkinへ勝手に埋めません。詳しくは<a href="/column/engineer-communication">エンジニアとのコミュニケーション基礎</a>と<a href="/column/gherkin-bdd-introduction">Gherkin入門</a>を参照してください。</p>',
  },
};

const columnIds = [
  'gherkin-bdd-introduction',
  'project-management-complete-guide',
  'requirements-definition-complete-guide',
  'ai-development-speed',
  'user-story-template-examples',
  'requirements-definition-template',
  'engineer-communication',
  'ears-gherkin-workflow',
];

const planned = [];
for (const id of columnIds) {
  const article = await client.get({ endpoint: 'columns', contentId: id, queries: { fields: 'id,title,content' } });
  const next = transformColumn(id, article);
  if (next.title !== article.title || next.content !== article.content) {
    planned.push({ endpoint: 'columns', id, content: { title: next.title, content: next.content }, changes: next.changes });
  }
}

for (const [id, patch] of Object.entries(qaUpdates)) {
  const qa = await client.get({ endpoint: 'qas', contentId: id, queries: { fields: 'id,question,answer' } });
  const content = {};
  if (patch.question && patch.question !== qa.question) content.question = patch.question;
  if (patch.answer && patch.answer !== qa.answer) content.answer = patch.answer;
  if (Object.keys(content).length) planned.push({ endpoint: 'qas', id, content, changes: ['QAを現行Beekle標準へ'] });
}

const forbiddenChecks = [
  ['gherkin-bdd-introduction', /ユーザーストーリーと\s*EARS\s*で要件を整える|EARS\s*と組み合わせることで/],
  ['project-management-complete-guide', /ユーザーストーリー＋EARS＋Gherkin|EARSで分解した受入条件/],
  ['requirements-definition-complete-guide', /要件の書き方ルール：EARS記法/],
  ['ai-development-speed', /EARS記法[^<]{0,80}ワンクッション/],
  ['user-story-template-examples', /EARS\s*で受入条件と非機能要件を書く[^<]{0,80}ベストプラクティス/],
  ['requirements-definition-template', /まとめ：要件定義は「ストーリー＋EARS」|共同でユーザーストーリーとEARS要件/],
];

for (const [id, re] of forbiddenChecks) {
  const candidate = planned.find((x) => x.endpoint === 'columns' && x.id === id);
  const content = candidate?.content?.content;
  if (content && re.test(content)) throw new Error(`preflight failed: old standard wording remains in ${id}: ${re}`);
}

console.log(`[mode] ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
console.log(`[standard] ${STANDARD_FLOW}`);
for (const item of planned) {
  console.log(`\n[${item.endpoint}] ${item.id}`);
  for (const change of item.changes) console.log(`  - ${change}`);
}
console.log(`\n[plan] ${planned.length} content items will change`);

if (!APPLY) process.exit(0);

for (const item of planned) {
  await client.update({ endpoint: item.endpoint, contentId: item.id, content: item.content });
  console.log(`[updated] ${item.endpoint}/${item.id}`);
}

for (const item of planned) {
  const fields = item.endpoint === 'columns' ? 'id,title,content' : 'id,question,answer';
  const verify = await client.get({ endpoint: item.endpoint, contentId: item.id, queries: { fields } });
  for (const [key, value] of Object.entries(item.content)) {
    if (verify[key] !== value) throw new Error(`verify failed: ${item.endpoint}/${item.id} field=${key}`);
  }
}

console.log(`\n[done] verified ${planned.length} MicroCMS updates`);
