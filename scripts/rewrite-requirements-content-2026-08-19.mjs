import { createClient } from 'microcms-js-sdk';

/**
 * Beekle 要件定義系6記事の思想更新（2026-08-19）
 *
 * 目的:
 * - 既存の slug / title / description / category を変更しない
 * - 既存検索意図（要件定義 / Gherkin / EARS / process / template / RFP）を維持する
 * - 「一冊の要件定義書」「EARS→Gherkinの一本道」を終点にせず、要求→仕様→受入→実装→検証→変更を接続する
 * - Beekle / PM on Rails で得た一次情報を、製品宣伝ではなく実務知として反映する
 *
 * 実行:
 *   node --env-file=.env scripts/rewrite-requirements-content-2026-08-19.mjs
 *   node --env-file=.env scripts/rewrite-requirements-content-2026-08-19.mjs --apply
 *
 * dry-run では6記事を全件取得・変換・検証し、API書き込みは行わない。
 * --apply でも全件の変換・検証に成功してから PATCH を開始する。
 */

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const APPLY = process.argv.includes('--apply');
const SITE = 'https://beekle.jp';

const TARGETS = [
  'requirements-definition-complete-guide',
  'gherkin-bdd-introduction',
  'ears-requirements-syntax-guide',
  'requirements-definition-process',
  'requirements-definition-template',
  'how-to-write-rfp',
];

const REQUIRED_CLUSTER_LINKS = [
  '/column/requirements-definition-complete-guide',
  '/column/gherkin-bdd-introduction',
  '/column/ears-requirements-syntax-guide',
  '/column/requirements-definition-process',
  '/column/requirements-definition-template',
  '/column/how-to-write-rfp',
];

const htmlToText = (html) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

function headings(content, level) {
  const re = level
    ? new RegExp(`<h${level}\\b[^>]*>[\\s\\S]*?<\\/h${level}>`, 'gi')
    : /<h([23])\b[^>]*>[\s\S]*?<\/h\1>/gi;
  const result = [];
  for (const match of content.matchAll(re)) {
    const tag = match[0];
    const depth = level ?? Number(tag.match(/^<h([23])/i)?.[1]);
    result.push({
      depth,
      start: match.index,
      end: match.index + tag.length,
      tag,
      text: htmlToText(tag),
    });
  }
  return result;
}

function findHeading(content, level, needle) {
  const normalizedNeedle = htmlToText(needle);
  const nodes = headings(content, level);
  const exact = nodes.find((h) => h.text === normalizedNeedle);
  if (exact) return exact;
  const loose = nodes.find((h) => h.text.includes(normalizedNeedle));
  if (loose) return loose;
  throw new Error(`h${level}「${needle}」が見つかりません`);
}

function nextH2Start(content, after) {
  const node = headings(content, 2).find((h) => h.start >= after);
  return node ? node.start : content.length;
}

function replaceSectionBody(content, headingText, body) {
  const h = findHeading(content, 2, headingText);
  const end = nextH2Start(content, h.end);
  return `${content.slice(0, h.end)}\n${body.trim()}\n${content.slice(end)}`;
}

function replaceSection(content, headingText, replacement) {
  const h = findHeading(content, 2, headingText);
  const end = nextH2Start(content, h.end);
  return `${content.slice(0, h.start)}${replacement.trim()}\n${content.slice(end)}`;
}

function insertAfterHeading(content, level, headingText, html, uniqueText) {
  if (uniqueText && htmlToText(content).includes(uniqueText)) return content;
  const h = findHeading(content, level, headingText);
  return `${content.slice(0, h.end)}\n${html.trim()}\n${content.slice(h.end)}`;
}

function insertBeforeH2(content, headingText, html, uniqueText) {
  if (uniqueText && htmlToText(content).includes(uniqueText)) return content;
  const h = findHeading(content, 2, headingText);
  return `${content.slice(0, h.start)}${html.trim()}\n${content.slice(h.start)}`;
}

function insertBeforeNextH2(content, afterHeadingText, html, uniqueText) {
  if (uniqueText && htmlToText(content).includes(uniqueText)) return content;
  const h = findHeading(content, 2, afterHeadingText);
  const end = nextH2Start(content, h.end);
  return `${content.slice(0, end)}${html.trim()}\n${content.slice(end)}`;
}

function clusterNav(current) {
  const items = [
    ['requirements-definition-complete-guide', '要件定義 完全ガイド'],
    ['requirements-definition-process', '要件定義の進め方'],
    ['requirements-definition-template', '要件定義テンプレート'],
    ['ears-requirements-syntax-guide', 'EARS記法'],
    ['gherkin-bdd-introduction', 'Gherkin / BDD'],
    ['how-to-write-rfp', 'RFPの書き方'],
  ].filter(([slug]) => slug !== current);
  return `<p><strong>関連ガイド：</strong>${items
    .map(([slug, label]) => `<a href="/column/${slug}">${label}</a>`)
    .join(' ／ ')}</p>`;
}

const sharedLifecycle = `
<p><strong>要求 → 機能仕様 → 非機能要件・制約 → 受入仕様 → 設計 → 実装 → テスト → PR / CI → 顧客フィードバック → 不具合・変更 → 次の仕様・Regression</strong></p>
`;

function transformCompleteGuide(original) {
  let content = original;

  content = insertAfterHeading(
    content,
    2,
    '要件定義とは何か：目的と位置付け',
    `
<p><strong>要件定義とは、顧客・事業側の要求を、設計・実装・テストで判断可能な情報へ整理し、関係者が「何を作るか」「何を完成とするか」を合意できる状態をつくる活動です。</strong></p>
<p>要件定義書はそのための成果物の一つですが、要件定義の目的そのものではありません。要求工学では、事業上の要求、ユーザーが達成したいこと、機能的な振る舞い、非機能要件、制約などは役割の異なる情報として扱われます。Beekleでも現在は、一枚の文書へ全部を詰め込むより、役割ごとの正本を分け、その関係を追跡できることを重視しています。</p>
${sharedLifecycle}
<p>このつながりがあると、上流の要求が変わったときに、どの仕様・受入条件・設計・テストへ影響するかを確認できます。逆に、不具合や顧客フィードバックを次の仕様やRegression Testへ戻すこともできます。</p>
`,
    '要件定義書はそのための成果物の一つですが'
  );

  content = insertAfterHeading(
    content,
    2,
    '要件定義の5つのフェーズ',
    `
<p>以下の5フェーズは、開発前に情報を整理するための実務的な入口です。ただし、フェーズ5で要件定義書を作れば要件定義が永久に完了する、という意味ではありません。実装・テスト・顧客確認で得た事実は、必要に応じて上流へ戻します。</p>
`,
    'フェーズ5で要件定義書を作れば要件定義が永久に完了する'
  );

  content = replaceSectionBody(
    content,
    '要件の書き方ルール：EARS記法',
    `
<p><strong>EARS（Easy Approach to Requirements Syntax）は、曖昧になりやすい自然言語の要件を、一定の型に沿って明確に書くための記法です。</strong> Rolls-Royceで考案され、要求を「常時」「イベント駆動」「状態駆動」「不要機能」「複合」といったパターンで整理します。</p>
<p>たとえば「注文確定時に確認メールを送る」だけでは、いつ・誰に・何を送れば要件を満たしたと言えるかが曖昧です。EARSを使うと、トリガー、対象、期待する応答を明示しやすくなります。</p>
<pre><code>WHEN 注文が確定したとき、
THE SYSTEM SHALL 注文者の登録メールアドレスへ確認メールを送信する。</code></pre>
<p>一方で、EARSへ機能仕様・非機能要件・制約・受入仕様・設計判断・テストをすべて押し込む必要はありません。EARSは<strong>要件文の曖昧さを減らすための道具</strong>として使い、ユーザーが何をできるかはUser Story、完成判定はScenarioやAcceptance Criteria、設計判断は設計記録というように、情報の役割を分ける方が保守しやすくなります。</p>
<p>5パターンと実例は<a href="/column/ears-requirements-syntax-guide">EARS記法の詳しい解説</a>で紹介しています。受入可能な振る舞いをGiven / When / Thenで表現したい場合は<a href="/column/gherkin-bdd-introduction">Gherkin入門</a>も参照してください。両者は用途が異なり、必ずEARSからGherkinへ変換する必要はありません。</p>
`
  );

  content = replaceSectionBody(
    content,
    '要件定義の成果物チェックリスト',
    `
<p>成果物の名称より、「判断に必要な情報があるか」「正本が重複していないか」「実装と検証まで追えるか」を確認します。</p>
<ul>
<li>解決したい課題・要求が、実装方法とは分離して残っている</li>
<li>機能仕様が、ユーザーや業務主体が何をできるかという形で整理されている</li>
<li>性能・セキュリティ・可用性などの非機能要件が検証可能な表現になっている</li>
<li>法令、既存システム、技術選定、予算・納期などの制約が区別されている</li>
<li>正常系だけでなく、異常系・境界条件を含む受入条件がある</li>
<li>未決事項と、誰がいつ判断するかが残っている</li>
<li>重要な設計判断と、その理由が要求・要件から追える</li>
<li>上流情報を変更したとき、影響するStory・Scenario・Task・設計・テストを追跡できる</li>
<li>仕様そのものをTaskへコピーして、複数の正本を作っていない</li>
<li>受入条件に対するTestResult、PR、CIなどの検証結果まで接続できる</li>
</ul>
<p>具体的な項目例は<a href="/column/requirements-definition-template">要件定義テンプレート</a>、進め方は<a href="/column/requirements-definition-process">要件定義プロセス</a>を参照してください。</p>
`
  );

  content = insertBeforeH2(
    content,
    'よくある質問（FAQ）',
    `
<h2 id="requirements-in-ai-development">AI開発で要件定義はどう変わるか</h2>
<h3>変わるもの：実装の速度とコスト</h3>
<p>AIコーディングエージェントによって、コードを書く・修正案を作る・テストを追加するといった実装作業は速くなっています。ここは従来より短いサイクルで回せる領域です。</p>
<h3>変わらないもの：何を必要としているかを決める仕事</h3>
<p>顧客が何を必要としているか、何を完成とするか、例外時にどう動くか、誰が判断するか、どんな制約があるかは、実装速度が上がっても決める必要があります。</p>
<h3>むしろ重要になるもの：仕様と実装・検証の接続</h3>
<p>AIが高速にコードを書けるほど、曖昧な要求を高速に間違って実装することもできます。Beekleの実務では、仕様の量を増やすことより、要求から受入条件、実装、テスト、変更までの接続を切らさないことを重視しています。</p>
<p>たとえば、仕様をTaskへコピーすると同じ情報の正本が複数になり、上流変更時に片方だけ古い状態で残りやすくなります。また、顧客から曖昧点への回答を得たときも、AIが回答を直接正本へ上書きすると誤解を固定化する危険があります。そこで、<strong>顧客回答 → 変更案 → 人間による確認 → 正本へ反映</strong>という段階を置きます。</p>
<p>不具合も「修正して閉じる」だけでは再発防止になりません。重要な不具合は、原因を確認し、仕様不足があればScenarioやRegression Testへ戻し、次回のQuality Gateに反映します。</p>
${clusterNav('requirements-definition-complete-guide')}
`,
    'AI開発で要件定義はどう変わるか'
  );

  content = insertBeforeH2(
    content,
    'まとめ',
    `
<h2 id="requirements-engineering-sources">参考にした要求工学・仕様記述の考え方</h2>
<ul>
<li>Karl E. Wiegers / Joy Beatty, <em>Software Requirements, Third Edition</em> — 事業要求・ユーザー要求・機能要件・非機能要件の区別、受入条件、変更管理、設計・コード・テストへのトレーサビリティを参照しています。</li>
<li>Kamil Nicieja, <em>Writing Great Specifications: Using Specification by Example and Gherkin</em> — 仕様層と自動化層を分け、具体例・受入条件・継続的な検証へ接続する考え方を参照しています。</li>
</ul>
`,
    '参考にした要求工学・仕様記述の考え方'
  );

  content = replaceSectionBody(
    content,
    'まとめ',
    `
<p>要件定義の価値は、長い文書を完成させることではありません。要求、機能仕様、非機能要件・制約、受入条件を整理し、その後の設計・実装・テスト・変更まで同じ意図を保てるようにすることです。</p>
<p>従来の技法は今も用途によって有効です。EARSは自然言語要件の曖昧さを減らす、Gherkinは期待する振る舞いを検証可能にする、RFPは発注時点の課題・制約・未決事項を共有する、と役割を分けると使いやすくなります。</p>
<p>Beekleでは、この一連の接続を実際のAI開発とPM on Railsの開発を通じて検証しています。AI時代に重要なのは「仕様を大量に書くこと」ではなく、<strong>何を正本とし、何を完成条件とし、変更や不具合をどこへ戻すかを明確にすること</strong>です。</p>
${clusterNav('requirements-definition-complete-guide')}
`
  );

  return content;
}

function transformGherkin(original) {
  let content = original;

  content = replaceSectionBody(
    content,
    'Gherkinとは何か',
    `
<p><strong>Gherkinは、期待されるシステムの振る舞いを、具体的なScenarioとして人間が読める形で表現するための言語です。</strong> Cucumberなどでは、Feature / Scenario / Given / When / Thenといったキーワードで構造化したScenarioをテスト自動化へ接続できます。</p>
<p>ただし、Gherkinは「何を作るべきか」をゼロから決める万能な要件定義方法ではありません。事業上の要求やユーザーの目的、非機能要件、制約、設計判断までをすべてGiven / When / Thenへ変換する必要はありません。</p>
<p>実務で価値が出るのは、<strong>「この実装を何によって完成と判定するか」を、具体例で検証可能にする場面</strong>です。仕様の文章をGherkinにしただけでは品質は上がらず、Scenarioが実装・テスト結果・PR / CI・Regressionへ接続されていることが重要です。</p>
`
  );

  content = replaceSectionBody(
    content,
    'なぜ Gherkin が必要なのか',
    `
<p>「在庫管理機能を作る」のような機能名だけでは、開発者・AI・テスターがどこまで作れば完成なのか判断できません。Gherkinは、前提・操作・期待結果を具体例で示すことで、その曖昧さを減らします。</p>
<pre><code>Scenario: 在庫数を超える出庫は登録できない
  Given 在庫数が1個の商品が存在する
  When 2個の出庫を登録しようとする
  Then 出庫登録は拒否される
  And 在庫数は変更されない</code></pre>
<p>このScenarioなら、「拒否される」だけでなく「在庫数を変更しない」という副作用まで完成条件に含められます。正常系だけでなく、異常系・境界条件を具体例で考えることで、実装後に初めて見つかる仕様不足を減らせます。</p>
<p>Gherkinは仕様の<strong>specification layer（人間が読む振る舞いの記述）</strong>と、テストコードなどの<strong>automation layer</strong>を分けて考えると理解しやすくなります。Scenarioそのものがテストコードなのではなく、Scenarioに対応する自動検証を接続することで、実装とのずれを継続的に検出できます。</p>
`
  );

  content = replaceSectionBody(
    content,
    'Gherkin と EARS の関係',
    `
<p>EARSとGherkinは、どちらも曖昧さを減らす助けになりますが、用途が異なります。</p>
<table>
<thead><tr><th>観点</th><th>EARS</th><th>Gherkin</th></tr></thead>
<tbody>
<tr><td>主な目的</td><td>自然言語の要件文を一定の型で明確にする</td><td>期待する振る舞いを具体例・完成条件として表す</td></tr>
<tr><td>得意な情報</td><td>条件、イベント、状態、システム応答、制約</td><td>前提、操作、観測可能な結果</td></tr>
<tr><td>必ず相互変換するか</td><td colspan="2">いいえ。必要な情報に合う表現を選びます</td></tr>
</tbody>
</table>
<p>たとえば、性能や可用性のような非機能要件は、無理にGherkinへ変換するより、測定条件と閾値をRequirementとして管理した方が読みやすい場合があります。一方、ユーザー操作の例外処理や境界条件はGherkinが向いています。</p>
<p>EARSの5パターンと使い分けは<a href="/column/ears-requirements-syntax-guide">EARS記法の解説</a>を参照してください。</p>
`
  );

  content = insertBeforeH2(
    content,
    'Gherkin を実行する：対応フレームワーク',
    `
<h2 id="gherkin-as-acceptance">Gherkinの価値は「完成条件」を検証可能にすること</h2>
<p>悪いScenarioは、単に機能名をGiven / When / Thenへ分割しただけです。たとえば「在庫管理機能を作る」「在庫を更新する」といった抽象語だけでは、合否を判定できません。</p>
<p>良い方向性は、具体的な前提・操作・観測可能な結果を置くことです。CucumberのGherkin Referenceでも、Thenはユーザーや外部システムから観測できる結果を表し、Whenでは実装やUIの詳細へ寄りすぎないことが推奨されています。</p>
<p>Scenarioを書くときは、正常系だけでなく「同じWhenで違う結果になる前提はないか」「別のThenも守る必要はないか」を確認します。これにより、異常系・境界条件・副作用の抜けを見つけやすくなります。</p>
`,
    'Gherkinの価値は「完成条件」を検証可能にすること'
  );

  content = replaceSectionBody(
    content,
    'Gherkin を導入するステップ',
    `
<h3>Step 1：要求と機能仕様を先に理解する</h3>
<p>まず「誰が何を達成したいか」「なぜ必要か」を確認します。Gherkinから要件定義を始める必要はありません。</p>
<h3>Step 2：完成判定が必要な振る舞いを選ぶ</h3>
<p>重要な正常系、異常系、境界条件、副作用を、具体例として洗い出します。すべてのRequirementをScenarioへ変換しようとしないことがポイントです。</p>
<h3>Step 3：Given / When / Thenで受入Scenarioを書く</h3>
<p>Givenは前提、Whenは起きるイベントや操作、Thenは観測可能な結果にします。UIのボタン名や内部クラス名ではなく、業務上の意図と結果を優先します。</p>
<h3>Step 4：実装・TestResult・PR / CI・Regressionへ接続する</h3>
<p>Scenarioに対応するテストを実行し、結果を残します。仕様変更や不具合が起きたらScenarioとRegression Testを更新し、同じ事故を人間の記憶だけで防がないようにします。</p>
${sharedLifecycle}
`
  );

  content = insertBeforeH2(
    content,
    'Gherkin を実務で使うケース・使わないケース',
    `
<h2 id="gherkin-lifecycle">Gherkinを書いて終わりにしない：ScenarioからRegressionまで</h2>
<p>Beekleの開発では、Scenarioを「文章の完成物」ではなく、受入判定の起点として扱っています。重要なのは次の接続です。</p>
<p><strong>Scenario → 実装 → TestResult → PR / CI → Regression</strong></p>
<p>上流の要求やStoryが変わった場合は、影響するScenarioとテストを確認します。不具合が起きた場合も、Bugを直すだけで閉じず、仕様の不足だったのかを確認し、必要ならScenarioやRegression Testへ戻します。</p>
<p>また、仕様をTaskへ丸ごとコピーすると、Task側とScenario側のどちらが正しいか分からなくなります。Taskは実装作業として持ち、完成条件の正本はScenario側に残す方が変更に強くなります。</p>
`,
    'Gherkinを書いて終わりにしない'
  );

  content = replaceSectionBody(
    content,
    'まとめ',
    `
<p>Gherkinは、要件定義そのものの代替ではありません。<strong>期待する振る舞いを、具体例を使って検証可能な完成条件へ落とす表現方法</strong>です。</p>
<p>Given / When / Thenを正しく書くだけでなく、Scenarioを実装・テスト結果・PR / CI・Regressionへ接続して初めて、変更に強い仕様になります。事業要求、User Story、非機能要件、制約は、それぞれに適した形式で管理して構いません。</p>
${clusterNav('gherkin-bdd-introduction')}
`
  );

  // 既存の参考文献セクションがある場合は、一次・原典中心に更新する。
  try {
    content = replaceSectionBody(
      content,
      '参考文献・出典',
      `
<ul>
<li><a href="https://cucumber.io/docs/gherkin/reference">Cucumber Documentation — Gherkin Reference</a>（Feature / Scenario / Given / When / Thenの公式リファレンス）</li>
<li>Kamil Nicieja, <em>Writing Great Specifications: Using Specification by Example and Gherkin</em>, Manning, 2018（仕様層と自動化層、具体例、Scenarioの保守性に関する実践書）</li>
<li>Karl E. Wiegers / Joy Beatty, <em>Software Requirements, Third Edition</em>, Microsoft Press（要求の分類、検証、トレーサビリティに関する基礎）</li>
</ul>
`
    );
  } catch {
    // 現行記事に参考文献セクションがない場合は、まとめ直前に追加する。
    content = insertBeforeH2(
      content,
      'まとめ',
      `<h2 id="references">参考文献・出典</h2><ul><li><a href="https://cucumber.io/docs/gherkin/reference">Cucumber Documentation — Gherkin Reference</a></li><li>Kamil Nicieja, <em>Writing Great Specifications: Using Specification by Example and Gherkin</em>, Manning, 2018</li></ul>`,
      'Kamil Nicieja'
    );
  }

  return content;
}

function transformEars(original) {
  let content = original;

  content = replaceSectionBody(
    content,
    'EARSとは何か',
    `
<p><strong>EARS（Easy Approach to Requirements Syntax）は、自然言語で書く要件を少数の構文パターンへ当てはめ、曖昧さ・複雑さ・不明確さを減らすための記法です。</strong> Alistair MavinらがRolls-Royceでの実践をもとに整理し、2009年のIEEE Requirements Engineering Conferenceで発表しました。</p>
<p>EARSの利点は、自然言語を捨てずに「いつ」「どの状態で」「何が起きたら」「システムはどう応答するか」を明示しやすいことです。厳密な形式仕様ほど導入コストを上げず、レビュー時に読み手ごとの解釈差を見つけやすくできます。</p>
<p>一方、Beekleでは現在、EARSを全要件・全仕様へ適用する主方式とはしていません。EARSが得意な<strong>曖昧な自然言語要件の明確化</strong>に使い、機能仕様、受入仕様、設計判断などは役割に合う形式へ分けています。</p>
`
  );

  content = insertAfterHeading(
    content,
    2,
    'ユーザーストーリーと EARS を組み合わせた完成形',
    `
<p>ここで示す組み合わせは一つの実践例です。「User StoryとEARSだけですべての仕様情報を表現する」という意味ではありません。Storyはユーザーや業務主体が何をできるようになるか、EARSは必要な要件文を明確化する、と役割を限定すると扱いやすくなります。</p>
`,
    'ここで示す組み合わせは一つの実践例です'
  );

  content = insertBeforeH2(
    content,
    'EARSの導入ステップ',
    `
<h2 id="ears-limitations">EARSを実務で使う際の限界</h2>
<p>EARSは自然言語要件を明確にするには有効ですが、大規模・継続的なソフトウェア開発の情報をすべて一つの構文へ押し込む必要はありません。</p>
<ul>
<li><strong>機能仕様：</strong>ユーザーや業務主体が何をできるかはUser StoryやUse Caseが読みやすい場合があります。</li>
<li><strong>非機能要件・制約：</strong>性能、可用性、セキュリティ、法令、利用技術などはRequirementとして独立させる方が追跡しやすくなります。</li>
<li><strong>受入仕様：</strong>具体的な振る舞いの完成判定はAcceptance CriteriaやGherkin Scenarioが適しています。</li>
<li><strong>設計判断：</strong>「なぜその方式を選んだか」は設計記録として残し、要件文へ混ぜない方が変更理由を追えます。</li>
<li><strong>実装・テスト：</strong>EARS文をTaskへ複製するのではなく、要件から実装・テストへリンクして正本を一つに保ちます。</li>
</ul>
<p>重要なのは記法を統一することではなく、<strong>情報の役割を分離し、要求から受入・実装・検証までの関係を追跡できること</strong>です。</p>
<p>期待する振る舞いを具体例で検証可能にする方法は<a href="/column/gherkin-bdd-introduction">Gherkin入門</a>、全体の考え方は<a href="/column/requirements-definition-complete-guide">要件定義 完全ガイド</a>で解説しています。</p>
`,
    'EARSを実務で使う際の限界'
  );

  content = replaceSectionBody(
    content,
    'EARSの導入ステップ',
    `
<ol>
<li><strong>まず要求の役割を判定する：</strong>事業上の要求、機能仕様、非機能要件、制約、受入条件を混ぜないようにします。</li>
<li><strong>EARSが有効な要件だけを選ぶ：</strong>イベント、状態、条件とシステム応答の関係が曖昧な要件を優先します。</li>
<li><strong>5パターンへ当てはめ、主語・トリガー・応答を具体化する：</strong>「適切に」「迅速に」など、検証できない形容を残さないようにします。</li>
<li><strong>受入条件が必要なら具体例を別に持つ：</strong>EARS文そのものを万能なテスト仕様にせず、必要に応じてAcceptance CriteriaやScenarioへ接続します。</li>
<li><strong>変更時は影響範囲を追う：</strong>要件が変わったら、関連するStory、Scenario、設計、Task、テストを確認します。</li>
</ol>
<p>EARSを導入する目的は、EARS文の数を増やすことではありません。曖昧な要件を減らし、後工程で「解釈が違った」を起こしにくくすることです。</p>
`
  );

  content = replaceSectionBody(
    content,
    'まとめ',
    `
<p>EARSは時代遅れでも万能でもありません。<strong>自然言語要件の曖昧さを減らす</strong>という目的には、現在も実務的な選択肢です。</p>
<p>一方、継続的な開発では、機能仕様、非機能要件、制約、受入仕様、設計判断、実装、テストをすべてEARSへ変換する必要はありません。役割を分けたうえで相互に追跡できる方が、変更や不具合へ対応しやすくなります。</p>
<p>Beekleでは、EARSを必要な箇所へ使いながら、要求からScenario、実装、検証、変更までを切らさない管理方法を実際のAI開発で検証しています。</p>
${clusterNav('ears-requirements-syntax-guide')}
`
  );

  try {
    content = replaceSectionBody(
      content,
      '参考文献',
      `
<ul>
<li><a href="https://doi.org/10.1109/RE.2009.9">Alistair Mavin, Philip Wilkinson, Adrian Harwood, Mark Novak, “Easy Approach to Requirements Syntax (EARS),” IEEE RE 2009</a></li>
<li>ISO/IEC/IEEE 29148, Systems and software engineering — Life cycle processes — Requirements engineering</li>
<li>Karl E. Wiegers / Joy Beatty, <em>Software Requirements, Third Edition</em>, Microsoft Press（要求の分類、検証、変更管理・トレーサビリティ）</li>
</ul>
`
    );
  } catch {
    content = insertBeforeH2(
      content,
      'まとめ',
      `<h2 id="references">参考文献</h2><ul><li><a href="https://doi.org/10.1109/RE.2009.9">Mavin et al., “Easy Approach to Requirements Syntax (EARS),” IEEE RE 2009</a></li><li>Karl E. Wiegers / Joy Beatty, <em>Software Requirements, Third Edition</em></li></ul>`,
      'Easy Approach to Requirements Syntax (EARS),” IEEE RE 2009'
    );
  }

  return content;
}

function transformProcess(original) {
  let content = original;

  content = replaceSectionBody(
    content,
    '全体フロー：要件定義は工程ではなく対話',
    `
<p><strong>要件定義は「ヒアリング → 要件定義書 → 設計」で一方向に終わる工程ではありません。</strong> 開発前には大きく5つの整理を行い、その後の実装・検証で得た事実を上流へ戻します。</p>
<ol>
<li>ステークホルダーと業務ゴールを明確にする</li>
<li>現状（As-Is）と目標状態（To-Be）を理解する</li>
<li>課題・要求を集め、未決事項を質問として残す</li>
<li>機能仕様をStoryへ分解し、非機能要件・制約を明確にする</li>
<li>受入可能な振る舞いを定義し、実装へ渡せる状態にする</li>
</ol>
${sharedLifecycle}
<p>このため、5フェーズは「文書を完成させるまでのゲート」ではなく、次の実装単位を許容できるリスクで開始するための整理です。実装・テスト・顧客フィードバックで新しい事実が出れば、要求や仕様を更新します。</p>
`
  );

  content = insertAfterHeading(
    content,
    2,
    'フェーズ3：要件収集とユーザーストーリー作成',
    `
<p>ここでは、顧客や事業側の「何を実現したいか」をいきなり詳細仕様へ変換しません。まず要求を正本として残し、その要求から、ユーザーや業務主体が何をできるようになるかをUser Storyとして分解します。性能・セキュリティ・法令・技術上の制約は、機能仕様へ混ぜず別のRequirementとして管理します。</p>
`,
    '顧客や事業側の「何を実現したいか」をいきなり詳細仕様へ変換しません'
  );

  content = insertAfterHeading(
    content,
    2,
    'フェーズ5：要件定義書の作成とレビュー',
    `
<p>このフェーズの目的は、一冊の要件定義書を「完成品」にすることではありません。要求・機能仕様・非機能要件・制約・受入条件・未決事項を、誰が見ても関係を追える状態にし、次の実装単位を開始できるかをレビューします。</p>
<p>特に「正常系が動く」だけでは完成判定になりません。異常系、境界条件、権限、外部連携失敗時など、重要な例外を受入条件へ含めます。</p>
`,
    'このフェーズの目的は、一冊の要件定義書を「完成品」にすることではありません'
  );

  content = insertBeforeH2(
    content,
    '発注側チェックリスト：要件定義フェーズ完了時',
    `
<h2 id="feedback-loop">実装・テスト・顧客フィードバックを上流へ戻す</h2>
<p>要件整理の後は、仕様をTaskへコピーして別の正本を作るのではなく、Taskを元のStoryやScenarioへ接続します。実装後も、受入条件に対するTestResult、PR、CIの結果までつなげます。</p>
<p>顧客から曖昧な点への回答をもらった場合は、<strong>顧客回答 → 変更案 → 人間による確認 → 正本へ反映</strong>の順に扱います。AIが回答を直接仕様へ上書きすると、文脈の取り違えをそのまま正本へ固定する危険があるためです。</p>
<p>また、上流情報が変わったら「どのStory、Scenario、Task、設計、テストへ影響するか」を確認します。古い仕様のままAI実装が走り続けることを防ぐには、変更履歴だけでなく影響関係が必要です。</p>
<p>不具合も同様です。重要なBugは、Root Causeを確認し、仕様不足ならScenario / Regression Testへ戻して、次のQuality Gateへ反映します。</p>
`,
    '実装・テスト・顧客フィードバックを上流へ戻す'
  );

  content = replaceSectionBody(
    content,
    '発注側チェックリスト：要件定義フェーズ完了時',
    `
<ul>
<li>解決したい業務課題と要求の正本が残っている</li>
<li>機能仕様と非機能要件・制約を区別できている</li>
<li>未決事項が質問として残り、判断者が分かる</li>
<li>主要なStoryに検証可能な受入条件がある</li>
<li>正常系だけでなく、重要な異常系・境界条件がある</li>
<li>Taskが仕様のコピーではなく、元の仕様へ接続されている</li>
<li>実装後にTestResult / PR / CIで受入条件を確認できる</li>
<li>上流変更の影響先を追跡できる</li>
<li>不具合をRegression Testへ戻すルールがある</li>
</ul>
<p>テンプレート項目は<a href="/column/requirements-definition-template">要件定義テンプレート</a>、全体の考え方は<a href="/column/requirements-definition-complete-guide">要件定義 完全ガイド</a>を参照してください。</p>
`
  );

  // 根拠の薄い固定比率を避け、リスクベースの説明へ更新する。
  try {
    content = replaceSectionBody(
      content,
      '要件定義の予算・スケジュールとシステム開発全体の工程',
      `
<p>要件定義に必要な期間や費用は、プロジェクト金額だけでは決まりません。未知の業務が多い、関係者が多い、既存システム連携が複雑、法規制がある、品質属性が厳しい、といった不確実性とリスクによって必要な深さが変わります。</p>
<p>重要なのは「何週間やれば十分」という固定値より、次の実装単位を始めても過大な手戻りが起きないだけの共有理解があるかです。小さな変更なら短い確認で済む一方、複数部門や外部システムにまたがる案件では、要求・制約・受入条件・変更影響を先に丁寧に整理する価値が高くなります。</p>
<p>スケジュールを短縮したい場合も、要件定義そのものを省くのではなく、スコープを小さくして「要求を整理する → 実装する → 検証する」の単位を小さくする方が安全です。</p>
`
    );
  } catch {
    // セクションがない版では何もしない
  }

  content = replaceSectionBody(
    content,
    'まとめ',
    `
<p>要件定義プロセスは、ヒアリング後に要件定義書を渡して終わる直線ではありません。要求を集め、課題と要求を整理し、未決事項を質問にし、Story・非機能要件・制約・受入条件へ分け、実装・テスト・フィードバックを上流へ戻す循環です。</p>
<p>AI開発では、この循環を短く回せる一方、曖昧な仕様を高速に実装するリスクも上がります。だからこそ、文書の量ではなく、要求から検証までの接続と変更追跡が重要になります。</p>
${clusterNav('requirements-definition-process')}
`
  );

  return content;
}

function transformTemplate(original) {
  let content = original;

  content = replaceSection(
    content,
    '要件定義書テンプレートの全体像',
    `
<h2 id="template-overview">要件定義テンプレートの全体像：役割を分けて管理する10ブロック</h2>
<p>一般的な要件定義書で必要になる情報を、実務で更新しやすい10ブロックに分けます。1ファイルにまとめても構いませんが、情報の役割と正本は区別してください。</p>
<table>
<thead><tr><th>ブロック</th><th>主に書くこと</th><th>役割</th></tr></thead>
<tbody>
<tr><td>1. プロジェクト概要</td><td>背景、目的、成功条件、スコープ</td><td>なぜやるか</td></tr>
<tr><td>2. 要求</td><td>顧客・事業側が実現したいこと、困りごと、由来</td><td>要求の正本</td></tr>
<tr><td>3. 機能仕様</td><td>User Story / Use Case、ユーザーができること</td><td>何をできるようにするか</td></tr>
<tr><td>4. 非機能要件</td><td>性能、可用性、セキュリティ、運用性など</td><td>どの品質を満たすか</td></tr>
<tr><td>5. 制約</td><td>法令、既存システム、技術、予算、納期など</td><td>選択肢の境界</td></tr>
<tr><td>6. 受入仕様</td><td>Acceptance Criteria、必要に応じてGherkin Scenario</td><td>何で完成と判定するか</td></tr>
<tr><td>7. 未決事項</td><td>質問、判断者、期限、顧客回答</td><td>不明点を隠さない</td></tr>
<tr><td>8. 設計判断</td><td>採用案、却下案、理由、関連する要件</td><td>なぜその設計か</td></tr>
<tr><td>9. データ・外部連携</td><td>主要データ、移行、API、既存システム</td><td>境界と依存関係</td></tr>
<tr><td>10. 変更履歴・影響</td><td>変更案、承認、影響するStory / Scenario / Test</td><td>変更を追跡する</td></tr>
</tbody>
</table>
<p>検索や社内レビューの都合で「要件定義書」として出力することはできます。ただし、日々の開発では各ブロックを別の管理単位にしてリンクする方が、変更時に正本がずれにくくなります。</p>
`
  );

  content = insertBeforeH2(
    content,
    'ユーザーストーリー',
    `
<h2 id="one-big-document-problem">一枚の巨大な要件定義書にすべてを詰め込む問題</h2>
<p>一つのWordやExcelへ情報を集約すると、提出物としては分かりやすい一方、継続開発では「同じ仕様が要件定義書、チケット、設計書、テスト仕様にコピーされる」状態が起きやすくなります。</p>
<p>Beekleの実務でも、仕様をTaskへコピーすると、変更時に片方だけ更新されて正本が複数になる問題が起きます。そこで、Taskには作業内容を持たせ、元の要求・Story・Scenarioへリンクして、仕様そのものはコピーしない方針を重視しています。</p>
<p>テンプレートは「すべてを同じ形式へ変換するため」ではなく、<strong>必要な情報の抜けを見つけ、役割ごとの正本を作るため</strong>に使うのが実務的です。</p>
`,
    '一枚の巨大な要件定義書にすべてを詰め込む問題'
  );

  // EARSの既存検索意図・5パターンは残しつつ、位置づけを補正する。
  try {
    content = insertAfterHeading(
      content,
      2,
      '機能要件：EARS記法',
      `
<p>この章ではEARSの書き方を紹介しますが、現在のBeekleでは「機能仕様をすべてEARSへ変換する」運用はしていません。ユーザーが何をできるかはUser Story、非機能要件・制約はRequirement、完成判定はAcceptance Criteria / Scenarioというように役割を分け、EARSは自然言語要件を明確にしたい箇所へ使います。</p>
`,
      '現在のBeekleでは「機能仕様をすべてEARSへ変換する」運用はしていません'
    );
  } catch {
    // 見出し表記違いに備えて後段のEARS見出しを試す
    try {
      content = insertAfterHeading(
        content,
        2,
        'EARS記法',
        `<p>現在のBeekleではEARSを全機能仕様の主形式とはせず、自然言語要件を明確にしたい箇所へ使います。機能仕様・非機能要件・制約・受入仕様は役割を分けて管理します。</p>`,
        '現在のBeekleではEARSを全機能仕様の主形式とはせず'
      );
    } catch {
      // 専用見出しがない版では追加しない
    }
  }

  content = insertBeforeH2(
    content,
    'まとめ',
    `
<h2 id="template-change-management">未決事項・設計判断・変更履歴まで残す</h2>
<h3>未決事項</h3>
<p>不明点を空欄や推測で埋めず、「質問」「回答者」「期限」「現在の仮定」を残します。顧客回答を受け取ったら、回答をそのままAIに正本へ書かせるのではなく、変更案を作り、人間が確認してから反映します。</p>
<h3>設計判断</h3>
<p>要求と設計を混ぜない一方、「どの要件・制約のためにこの設計を選んだか」は追えるようにします。後から制約が変わったとき、設計を見直すべきか判断できます。</p>
<h3>変更履歴と影響範囲</h3>
<p>変更日だけでなく、どのStory、Scenario、Task、設計、テストに影響するかを記録します。AI実装が速いほど、古い仕様で作業を続けたときの誤りも速く増えるためです。</p>
${clusterNav('requirements-definition-template')}
`,
    '未決事項・設計判断・変更履歴まで残す'
  );

  // 旧まとめの強い「Story＋EARS」一本化を置き換える。
  const summaryCandidates = [
    'まとめ：要件定義は「ストーリー＋EARS」で曖昧さを潰す',
    'まとめ',
  ];
  for (const candidate of summaryCandidates) {
    try {
      content = replaceSectionBody(
        content,
        candidate,
        `
<p>テンプレートは、項目を埋めること自体が目的ではありません。要求、機能仕様、非機能要件、制約、受入仕様、未決事項、設計判断、変更履歴を区別し、必要な情報が抜けていないかを確認するために使います。</p>
<p>User Story、EARS、Gherkinはいずれも有効な道具ですが、すべてを一つの記法へ統一する必要はありません。各情報を最も読みやすく、検証しやすい形式で持ち、相互の関係を追跡できる状態を優先します。</p>
<p>要件定義全体の考え方は<a href="/column/requirements-definition-complete-guide">完全ガイド</a>、進め方は<a href="/column/requirements-definition-process">プロセス解説</a>で確認できます。</p>
`
      );
      break;
    } catch {
      // 次候補
    }
  }

  return content;
}

function transformRfp(original) {
  let content = original;

  content = insertBeforeH2(
    content,
    'RFPの骨格テンプレート',
    `
<h2 id="rfp-not-full-spec">RFPで詳細仕様を決め切る必要はない</h2>
<p><strong>RFP（提案依頼書）は、発注前にシステムの詳細仕様を100%確定させるための文書ではありません。</strong> ベンダーが課題・前提・制約を理解し、適切な提案と見積前提を示せるだけの情報を揃えることが重要です。</p>
<p>RFP段階では、少なくとも次を明確にします。</p>
<ul>
<li>解決したい業務課題と、なぜ今取り組むのか</li>
<li>現状（As-Is）と達成したい結果（To-Be / 成功条件）</li>
<li>必須の法務・セキュリティ・予算・納期などの制約</li>
<li>既存システム、データ、外部連携</li>
<li>意思決定者、利用者、情報システム部門などのステークホルダー</li>
<li>現時点で分かっている機能要件</li>
<li><strong>まだ決まっていないこと・ベンダーと相談したいこと</strong></li>
</ul>
<p>詳細仕様は、候補ベンダーとのQ&amp;A、要件整理、プロトタイプ、技術検証などで精度を上げられます。未決事項を隠して「決まっているように見せる」より、何が既知で何が未決かを分ける方が、提案条件を比較しやすくなります。</p>
<p>要件整理の方法は<a href="/column/requirements-definition-process">要件定義プロセス</a>、項目例は<a href="/column/requirements-definition-template">要件定義テンプレート</a>を参照してください。</p>
`,
    'RFPで詳細仕様を決め切る必要はない'
  );

  // 機能要件の章へ「既知/未決」の扱いを追加。
  try {
    content = insertAfterHeading(
      content,
      3,
      '④ 機能要件',
      `
<p>RFPでは「すでに決まっている必須機能」と「実現方法や詳細条件をベンダーと詰めたい項目」を分けてください。後者を無理に確定仕様として書くと、発注側の仮説がそのまま設計制約になり、より良い提案を狭めることがあります。</p>
`,
      'すでに決まっている必須機能」と「実現方法や詳細条件をベンダーと詰めたい項目'
    );
  } catch {
    // 見出しの番号表記差異は許容
  }

  content = insertBeforeH2(
    content,
    'まとめ',
    `
<h2 id="rfp-after-vendor-selection">ベンダー選定後は、RFPを要求・仕様・受入条件へ分解する</h2>
<p>RFPは契約後も参照点になりますが、開発が始まったらRFP本文をそのままTaskへコピーして管理するのではなく、要求、機能仕様、非機能要件・制約、受入条件、未決事項へ分けて正本を作ります。</p>
<p>その後、設計・実装・テスト・PR / CI・顧客フィードバックまで接続し、RFP時点の前提が変わった場合は変更の影響範囲を追えるようにします。</p>
${sharedLifecycle}
<h3>Q. RFP時点で要件はどこまで固めるべきですか？</h3>
<p>A. ベンダーが提案条件を判断できるだけの課題、成功条件、必須制約、既存システム、既知の要件は明確にします。一方、詳細な画面仕様や実現方式まで発注側だけで決め切る必要はありません。未決事項は明示し、選定後の要件整理で精度を上げる余地を残します。</p>
${clusterNav('how-to-write-rfp')}
`,
    'ベンダー選定後は、RFPを要求・仕様・受入条件へ分解する'
  );

  content = replaceSectionBody(
    content,
    'まとめ',
    `
<p>良いRFPは、詳細仕様を最初から完璧に決めた文書ではありません。解決したい業務課題、現状、達成したい結果、必須制約、既存システム、ステークホルダー、既知の要件、未決事項を、候補ベンダーが判断できる形で共有した文書です。</p>
<p>従来のRFPの書式や評価表は今も有効です。ただし、発注前の仮説を固定化しすぎず、ベンダーとの対話で詳細仕様を精度向上させる余地を残してください。契約後はRFPを起点に、要求・仕様・受入条件・設計・実装・テスト・変更を接続していくことが重要です。</p>
<p>要件定義全体は<a href="/column/requirements-definition-complete-guide">要件定義 完全ガイド</a>で解説しています。</p>
`
  );

  return content;
}

const transforms = {
  'requirements-definition-complete-guide': transformCompleteGuide,
  'gherkin-bdd-introduction': transformGherkin,
  'ears-requirements-syntax-guide': transformEars,
  'requirements-definition-process': transformProcess,
  'requirements-definition-template': transformTemplate,
  'how-to-write-rfp': transformRfp,
};

function extractInternalLinks(content) {
  const links = new Set();
  for (const match of content.matchAll(/href=["'](\/[a-zA-Z0-9_?=&%./#-]+)["']/g)) {
    const path = match[1].split('#')[0].split('?')[0];
    if (path) links.add(path);
  }
  return [...links];
}

async function validateLinks(paths) {
  const failed = [];
  const queue = [...new Set(paths)];
  const workers = Array.from({ length: Math.min(8, queue.length) }, async () => {
    while (queue.length) {
      const path = queue.shift();
      try {
        const response = await fetch(`${SITE}${path}`, {
          method: 'GET',
          redirect: 'manual',
          headers: { 'user-agent': 'Beekle-content-migration-link-check/1.0' },
        });
        if (response.status < 200 || response.status >= 400) {
          failed.push(`${path} -> HTTP ${response.status}`);
        }
      } catch (error) {
        failed.push(`${path} -> ${error.message}`);
      }
    }
  });
  await Promise.all(workers);
  if (failed.length) {
    throw new Error(`内部リンク検証失敗:\n${failed.map((x) => `- ${x}`).join('\n')}`);
  }
}

function validateTransformed(slug, before, after) {
  if (!after || after.length < 1000) throw new Error(`${slug}: 変換後本文が短すぎます`);
  if (after === before) throw new Error(`${slug}: 変換結果に差分がありません`);
  if (after.includes('undefined') || after.includes('[object Object]')) {
    throw new Error(`${slug}: 不正な文字列を検出しました`);
  }

  // SEO資産: URLを決めるslugはcontentIdのまま。本文中でも自記事リンクは変えない。
  const h2Count = headings(after, 2).length;
  if (h2Count < 5) throw new Error(`${slug}: h2が少なすぎます (${h2Count})`);

  const text = htmlToText(after);
  const requiredPhrases = {
    'requirements-definition-complete-guide': ['AI開発で要件定義はどう変わるか', '要求 → 機能仕様', '顧客回答 → 変更案'],
    'gherkin-bdd-introduction': ['Gherkinを書いて終わりにしない', 'Scenario → 実装 → TestResult', '在庫数が1個'],
    'ears-requirements-syntax-guide': ['EARSを実務で使う際の限界', '自然言語要件の曖昧さ', '役割を分離'],
    'requirements-definition-process': ['実装・テスト・顧客フィードバックを上流へ戻す', '顧客回答 → 変更案', 'Regression Test'],
    'requirements-definition-template': ['役割を分けて管理する10ブロック', '一枚の巨大な要件定義書', '未決事項・設計判断・変更履歴'],
    'how-to-write-rfp': ['RFPで詳細仕様を決め切る必要はない', 'まだ決まっていないこと', 'ベンダー選定後は'],
  }[slug];

  for (const phrase of requiredPhrases) {
    if (!text.includes(phrase)) throw new Error(`${slug}: 必須フレーズ不足「${phrase}」`);
  }
}

async function main() {
  if (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY) {
    throw new Error('MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が必要です');
  }

  console.log(`mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`targets: ${TARGETS.length}`);

  const plans = [];
  for (const slug of TARGETS) {
    const current = await client.get({ endpoint: 'columns', contentId: slug });
    const beforeH2 = headings(current.content || '', 2).map((h) => h.text);
    const transform = transforms[slug];
    const afterContent = transform(current.content || '');
    validateTransformed(slug, current.content || '', afterContent);

    const internalLinks = extractInternalLinks(afterContent);
    plans.push({ slug, current, afterContent, beforeH2, internalLinks });

    console.log(`\n=== ${slug} ===`);
    console.log(`title: ${current.title}`);
    console.log(`description: ${current.description || '(empty)'}`);
    console.log(`category: ${current.category?.id || '(none)'}`);
    console.log(`publishedAt: ${current.publishedAt || '(none)'}`);
    console.log(`updatedAt: ${current.updatedAt || '(none)'}`);
    console.log(`bytes: ${current.content.length} -> ${afterContent.length} (${afterContent.length - current.content.length >= 0 ? '+' : ''}${afterContent.length - current.content.length})`);
    console.log(`h2-before: ${beforeH2.join(' | ')}`);
    console.log(`internal-links: ${internalLinks.join(' | ')}`);
  }

  // 新しく構成したクラスタリンクに加え、変換後6記事に含まれる内部リンクを全件確認。
  const allInternalLinks = [
    ...REQUIRED_CLUSTER_LINKS,
    ...plans.flatMap((plan) => plan.internalLinks),
  ];
  console.log(`\nchecking ${new Set(allInternalLinks).size} internal links...`);
  await validateLinks(allInternalLinks);
  console.log('internal links: OK');

  // ここまで全件成功してから書き込みを開始する。
  if (!APPLY) {
    console.log('\nDRY-RUN complete: no MicroCMS writes performed.');
    return;
  }

  for (const plan of plans) {
    console.log(`\nPATCH ${plan.slug} ...`);
    // title / description / category は送らない。SEO資産を保持する。
    await client.update({
      endpoint: 'columns',
      contentId: plan.slug,
      content: { content: plan.afterContent },
    });

    const after = await client.get({ endpoint: 'columns', contentId: plan.slug });
    if (after.title !== plan.current.title) throw new Error(`${plan.slug}: titleが変化しました`);
    if ((after.description || '') !== (plan.current.description || '')) {
      throw new Error(`${plan.slug}: descriptionが変化しました`);
    }
    if (after.category?.id !== plan.current.category?.id) throw new Error(`${plan.slug}: categoryが変化しました`);
    validateTransformed(plan.slug, plan.current.content || '', after.content || '');
    console.log(`PATCH verified: ${plan.slug}`);
  }

  console.log('\nAPPLY complete: 6/6 articles updated and re-fetched successfully.');
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
