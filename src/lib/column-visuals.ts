/**
 * コラム記事で使うビジュアル（HTML ブロック）の定義
 *
 * MicroCMS リッチエディタはインラインスタイル付き <div> をサニタイズしてしまうため、
 * 記事本文には `{{MARKER_NAME}}` という形式のプレーンテキストマーカーだけを埋め込み、
 * Astro 側で `renderColumnVisuals()` を通してこのファイルで定義した HTML に置換する。
 *
 * CSS は `src/pages/column/[...slug].astro` の <style> ブロックに定義。
 * クラス名は `cv-` プレフィックスで統一。
 */

const USER_STORY_TEMPLATE = `<figure class="cv-card cv-card-template">
  <figcaption class="cv-card-header cv-header-primary">ユーザーストーリーの型</figcaption>
  <div class="cv-card-body">
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-who">誰が</span>
      <span class="cv-story-value">〈対象ユーザー〉として</span>
    </div>
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-what">何を</span>
      <span class="cv-story-value">〈やりたいこと〉をしたい</span>
    </div>
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-why">なぜ</span>
      <span class="cv-story-value">なぜなら〈理由・背景〉だからだ</span>
    </div>
  </div>
</figure>`;

const USER_STORY_EXAMPLE_NURSING = `<figure class="cv-card cv-card-success">
  <figcaption class="cv-card-header cv-header-success">良い例：訪問看護記録システム</figcaption>
  <div class="cv-card-body">
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-who">誰が</span>
      <span class="cv-story-value">訪問看護師として</span>
    </div>
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-what">何を</span>
      <span class="cv-story-value">利用者宅でその場で看護記録をつけたい</span>
    </div>
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-why">なぜ</span>
      <span class="cv-story-value">帰社してから30件分を思い出して書くと記憶違いが起きるからだ</span>
    </div>
  </div>
</figure>`;

const USER_STORY_EXAMPLE_WAREHOUSE = `<figure class="cv-card cv-card-success">
  <figcaption class="cv-card-header cv-header-success">良い例：倉庫の在庫管理システム</figcaption>
  <div class="cv-card-body">
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-who">誰が</span>
      <span class="cv-story-value">手袋をした倉庫作業員として</span>
    </div>
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-what">何を</span>
      <span class="cv-story-value">スマートフォンで簡単に在庫数を減らしたい</span>
    </div>
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-why">なぜ</span>
      <span class="cv-story-value">作業を止めずにその場で記録しないと後から記憶違いが起きるからだ</span>
    </div>
  </div>
</figure>`;

const WHY_TO_HOW = `<figure class="cv-whyhow">
  <figcaption class="cv-whyhow-title">Why が伝わると、How の選択肢が広がる</figcaption>
  <div class="cv-whyhow-box cv-whyhow-why">
    <div class="cv-whyhow-label cv-label-why">WHY</div>
    <div class="cv-whyhow-text">帰社してから思い出して記録すると記憶違いが起きる</div>
  </div>
  <div class="cv-whyhow-arrow">エンジニアが推察して複数の選択肢を提案</div>
  <div class="cv-whyhow-box cv-whyhow-how">
    <span class="cv-whyhow-num">HOW 1</span>
    <span class="cv-whyhow-text">オフライン保存で電波が無い訪問先でも入力できる</span>
  </div>
  <div class="cv-whyhow-box cv-whyhow-how">
    <span class="cv-whyhow-num">HOW 2</span>
    <span class="cv-whyhow-text">音声入力で運転中や片手作業でも記録できる</span>
  </div>
  <div class="cv-whyhow-box cv-whyhow-how">
    <span class="cv-whyhow-num">HOW 3</span>
    <span class="cv-whyhow-text">前回記録を自動呼び出しして入力の手間を減らす</span>
  </div>
</figure>`;

const SCENARIO_COMPARISON = `<figure class="cv-compare">
  <div class="cv-compare-col cv-compare-bad">
    <div class="cv-compare-header cv-header-bad">機能リストだけ</div>
    <div class="cv-compare-body">
      <ul class="cv-bullet-list">
        <li>バーコードを読み取る</li>
        <li>合計金額を表示する</li>
        <li>現金で会計する</li>
        <li>レシートを印刷する</li>
      </ul>
      <p class="cv-compare-note cv-note-bad">誰が・どんな状況で・どんな順序で使うかが不明。機能は正しく動いても現場では使えない。</p>
    </div>
  </div>
  <div class="cv-compare-col cv-compare-good">
    <div class="cv-compare-header cv-header-good">シナリオで伝える</div>
    <div class="cv-compare-body">
      <p class="cv-scenario-text"><strong>レジ担当者として</strong>、混雑時に会計列を止めないために、割引シールを貼った商品は<strong>1タップで単価変更</strong>したい。<br><br>また、<strong>現金とクーポン併用</strong>の会計も1画面で完結させたい。<br><br>返品対応は<strong>管理者呼出なしで</strong>処理したい。</p>
      <p class="cv-compare-note cv-note-good">誰が・いつ・どんな制約下で使うかが明確で、エンジニアが適切な設計を選べる。</p>
    </div>
  </div>
</figure>`;

const FM_MATRIX = `<figure class="cv-fm">
  <figcaption class="cv-fm-title">FM（ファンクショナリティ・マトリクス）の例：在庫管理システム</figcaption>
  <p class="cv-fm-desc">FMは、書籍『<a href="https://www.amazon.co.jp/dp/B099WCDCG6" target="_blank" rel="noopener noreferrer">システムを作らせる技術</a>』（白川克 著）で紹介されている、要求を「作る」「後回し」「作らない」に白黒つけて合意形成する手法です。発注者と開発パートナーで一緒にマトリクスを埋めていきます。「作らない機能」もリストに残すのがポイントです。</p>
  <div class="cv-fm-scroll">
    <table class="cv-fm-table">
      <thead>
        <tr>
          <th>機能</th>
          <th>ビジネス価値</th>
          <th>現場で使えるか</th>
          <th>技術コスト</th>
          <th>判定</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>バーコードで在庫を減らす</td>
          <td class="cv-center">★★★</td>
          <td class="cv-center">★★★</td>
          <td class="cv-center">低</td>
          <td class="cv-verdict cv-verdict-yes">作る</td>
        </tr>
        <tr>
          <td>月次の在庫分析レポート</td>
          <td class="cv-center">★★</td>
          <td class="cv-center">★★★</td>
          <td class="cv-center">低</td>
          <td class="cv-verdict cv-verdict-yes">作る</td>
        </tr>
        <tr>
          <td>在庫の自動発注アラート</td>
          <td class="cv-center">★★★</td>
          <td class="cv-center">★★</td>
          <td class="cv-center">高</td>
          <td class="cv-verdict cv-verdict-later">後回し</td>
        </tr>
        <tr>
          <td>入荷予定の手動入力</td>
          <td class="cv-center">★★</td>
          <td class="cv-center">★</td>
          <td class="cv-center">中</td>
          <td class="cv-verdict cv-verdict-no">作らない</td>
        </tr>
        <tr>
          <td>バーコード無し商品の写真認識</td>
          <td class="cv-center">★</td>
          <td class="cv-center">★</td>
          <td class="cv-center">高</td>
          <td class="cv-verdict cv-verdict-no">作らない</td>
        </tr>
      </tbody>
    </table>
  </div>
  <p class="cv-fm-effect"><strong>FMの効果</strong>：「作らない機能」を明示的に残すことで、「なぜ作らないのか」の合意形成が視覚的にできます。後から「やっぱり欲しい」と言われた時も、なぜ最初に外したかが一目で分かり、スコープクリープを防げます。</p>
  <p class="cv-fm-citation">出典：白川克『<a href="https://www.amazon.co.jp/dp/B099WCDCG6" target="_blank" rel="noopener noreferrer">システムを作らせる技術 エンジニアではないあなたへ</a>』（日経BP, 2021）</p>
</figure>`;

const EARS_PATTERNS = `<figure class="cv-card">
  <figcaption class="cv-card-header cv-header-primary">EARS記法の5つの構文パターン</figcaption>
  <div class="cv-card-body">
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-why" style="min-width: 7rem;">常時</span>
      <span class="cv-story-value">システムは〜<strong>しなければならない</strong>（常に成り立つ要件）</span>
    </div>
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-who" style="min-width: 7rem;">イベント駆動</span>
      <span class="cv-story-value"><strong>〜したとき</strong>、システムは〜しなければならない（特定のイベントをきっかけに動く要件）</span>
    </div>
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-who" style="min-width: 7rem;">状態駆動</span>
      <span class="cv-story-value"><strong>〜の間</strong>、システムは〜しなければならない（ある状態が続く間だけ成り立つ要件）</span>
    </div>
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-what" style="min-width: 7rem;">オプション機能</span>
      <span class="cv-story-value"><strong>〜である場合</strong>、システムは〜しなければならない（特定機能が有効な場合だけの要件）</span>
    </div>
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-why" style="min-width: 7rem;">異常系</span>
      <span class="cv-story-value"><strong>もし〜ならば</strong>、システムは〜しなければならない（エラーや例外時の要件）</span>
    </div>
  </div>
</figure>`;

const EARS_EXAMPLES = `<figure class="cv-card cv-card-success">
  <figcaption class="cv-card-header cv-header-success">良い例：在庫管理システムをEARS記法で書く</figcaption>
  <div class="cv-card-body">
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-who" style="min-width: 7rem;">イベント駆動</span>
      <span class="cv-story-value">ユーザーが<strong>バーコードをスキャンしたとき</strong>、システムは商品コードを読み取り、在庫数を1つ減らさなければならない</span>
    </div>
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-who" style="min-width: 7rem;">状態駆動</span>
      <span class="cv-story-value"><strong>在庫数が安全在庫を下回っている間</strong>、システムは商品一覧画面で警告アイコンを表示しなければならない</span>
    </div>
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-what" style="min-width: 7rem;">オプション機能</span>
      <span class="cv-story-value"><strong>自動発注機能が有効である場合</strong>、システムは安全在庫を下回ったときに発注メールを担当者へ送信しなければならない</span>
    </div>
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-why" style="min-width: 7rem;">異常系</span>
      <span class="cv-story-value"><strong>もしバーコードが商品マスタに登録されていないならば</strong>、システムはエラー音を鳴らし、在庫数を変更してはならない</span>
    </div>
  </div>
</figure>`;

const EARS_FULL_EXAMPLE = `<figure class="cv-card cv-card-full">
  <figcaption class="cv-card-header cv-header-primary">完成例：商品検索機能（US-101）の要件定義</figcaption>
  <div class="cv-card-body cv-full-body">
    <section class="cv-full-section">
      <h4 class="cv-full-title">ユーザーストーリー（Why）</h4>
      <p class="cv-full-text">店舗マネージャーとして、商品名で在庫を検索したい。<br>なぜなら、顧客から問い合わせを受けた際に、その場で在庫の有無を答えたいから。</p>
    </section>
    <section class="cv-full-section">
      <h4 class="cv-full-title">受入条件（What、EARS）</h4>
      <ul class="cv-ears-list">
        <li><span class="cv-ears-tag cv-tag-ubiquitous">ユビキタス</span><span class="cv-ears-text">商品検索システムは、検索結果を1ページあたり20件まで表示する。</span></li>
        <li><span class="cv-ears-tag cv-tag-ubiquitous">ユビキタス</span><span class="cv-ears-text">商品検索システムは、検索結果を在庫数の降順で並べる。</span></li>
        <li><span class="cv-ears-tag cv-tag-event">イベント駆動</span><span class="cv-ears-text">ユーザーが検索ボタンをクリックしたとき、商品検索システムは1秒以内に結果を表示する。</span></li>
        <li><span class="cv-ears-tag cv-tag-event">イベント駆動</span><span class="cv-ears-text">検索結果が0件のとき、商品検索システムは「該当する商品がありません」を表示する。</span></li>
        <li><span class="cv-ears-tag cv-tag-state">状態駆動</span><span class="cv-ears-text">ユーザーがログインしている間、商品検索システムは過去5件の検索履歴を表示する。</span></li>
        <li><span class="cv-ears-tag cv-tag-option">オプション</span><span class="cv-ears-text">詳細検索オプションが有効な場合、商品検索システムはカテゴリと価格帯による絞り込みを許可する。</span></li>
        <li><span class="cv-ears-tag cv-tag-unwanted">望まない振る舞い</span><span class="cv-ears-text">検索クエリが空の場合、商品検索システムはエラーメッセージを表示する。</span></li>
        <li><span class="cv-ears-tag cv-tag-unwanted">望まない振る舞い</span><span class="cv-ears-text">在庫DBに接続できない場合、商品検索システムは「現在検索できません」を表示する。</span></li>
      </ul>
    </section>
    <section class="cv-full-section">
      <h4 class="cv-full-title">非機能要件（EARS）</h4>
      <ul class="cv-ears-list">
        <li><span class="cv-ears-tag cv-tag-ubiquitous">ユビキタス</span><span class="cv-ears-text">商品検索システムは、99.9%の可用性を保つ。</span></li>
        <li><span class="cv-ears-tag cv-tag-event">イベント駆動</span><span class="cv-ears-text">同時リクエスト数が100を超えたとき、商品検索システムはレート制限を適用する。</span></li>
      </ul>
    </section>
  </div>
</figure>`;

const EARS_GOODBAD_SUBJECT = `<figure class="cv-goodbad">
  <div class="cv-goodbad-row cv-goodbad-good">
    <span class="cv-goodbad-label cv-goodbad-label-good">良い例</span>
    <span class="cv-goodbad-text">検索<strong>システムは</strong>、検索結果を1秒以内に表示する。</span>
  </div>
  <div class="cv-goodbad-row cv-goodbad-bad">
    <span class="cv-goodbad-label cv-goodbad-label-bad">悪い例</span>
    <span class="cv-goodbad-text"><strong>ユーザーは</strong>、検索結果を1秒以内に得られる。</span>
  </div>
  <p class="cv-goodbad-hint">主語をユーザーではなく<strong>システム</strong>に揃えると、誰の責任で何が起きるかが一意に決まります。</p>
</figure>`;

const EARS_GOODBAD_NUMBER = `<figure class="cv-goodbad">
  <div class="cv-goodbad-row cv-goodbad-good">
    <span class="cv-goodbad-label cv-goodbad-label-good">良い例</span>
    <span class="cv-goodbad-text">1秒以内に / 100件まで / 99.9%以上</span>
  </div>
  <div class="cv-goodbad-row cv-goodbad-bad">
    <span class="cv-goodbad-label cv-goodbad-label-bad">悪い例</span>
    <span class="cv-goodbad-text">速やかに / 大量の / 高い可用性で</span>
  </div>
  <p class="cv-goodbad-hint">数値で書けば、テストで合否を機械的に判定できます。形容詞は人によって解釈がぶれます。</p>
</figure>`;

const US_ACCEPTANCE_CHECKLIST = `<figure class="cv-card cv-card-full">
  <figcaption class="cv-card-header cv-header-primary">受入条件（Acceptance Criteria）の例</figcaption>
  <div class="cv-card-body">
    <ul class="cv-check-list">
      <li>メールアドレスの部分一致で検索できる</li>
      <li>大文字小文字は区別しない</li>
      <li>検索結果は1秒以内に表示される</li>
      <li>100件以上の結果はページング表示する</li>
    </ul>
  </div>
</figure>`;

const US_FULL_EXAMPLE = `<figure class="cv-card cv-card-full">
  <figcaption class="cv-card-header cv-header-primary">完成例：US-101 在庫切れ前通知</figcaption>
  <div class="cv-card-body cv-full-body">
    <section class="cv-full-section">
      <h4 class="cv-full-title">ユーザーストーリー</h4>
      <p class="cv-full-text">店舗マネージャーとして、商品の在庫が閾値を下回った段階で通知を受けたい。<br>なぜなら、発注リードタイム（3日）を確保するため、欠品の3日以上前に気づきたいから。</p>
    </section>
    <section class="cv-full-section">
      <h4 class="cv-full-title">受入条件</h4>
      <ul class="cv-check-list">
        <li>商品ごとに通知閾値を設定できる</li>
        <li>在庫が閾値を下回ったら、24時間以内にメール通知が届く</li>
        <li>同じ商品に対する通知は、回復するまで1日1回までに抑える</li>
        <li>通知メールには、商品名・現在在庫・推奨発注数が含まれる</li>
      </ul>
    </section>
    <section class="cv-full-section">
      <h4 class="cv-full-title">想定するエッジケース</h4>
      <ul class="cv-bullet-list">
        <li>在庫が一瞬下回ってすぐ回復した場合 → 通知しない</li>
        <li>通知設定が無効化された商品 → 通知しない</li>
      </ul>
    </section>
    <section class="cv-full-section">
      <h4 class="cv-full-title">関連ストーリー</h4>
      <ul class="cv-bullet-list">
        <li>US-102: 通知閾値の一括設定</li>
        <li>US-103: 通知履歴の閲覧</li>
      </ul>
    </section>
    <section class="cv-full-section">
      <h4 class="cv-full-title">由来</h4>
      <ul class="cv-bullet-list">
        <li>営業 田中: 「先月、A店舗で人気商品が3日間欠品して機会損失」</li>
        <li>マネージャー会議: 2025-12 議事録</li>
      </ul>
    </section>
  </div>
</figure>`;

const buildGoodBadList = (title: string, goods: string[], bads: string[], hint: string) => {
  const goodLis = goods
    .map(
      (g) =>
        `<li class="cv-goodbad-item cv-goodbad-good"><span class="cv-goodbad-label cv-goodbad-label-good">良い例</span><span class="cv-goodbad-text">${g}</span></li>`
    )
    .join('');
  const badLis = bads
    .map(
      (b) =>
        `<li class="cv-goodbad-item cv-goodbad-bad"><span class="cv-goodbad-label cv-goodbad-label-bad">悪い例</span><span class="cv-goodbad-text">${b}</span></li>`
    )
    .join('');
  return `<figure class="cv-goodbad cv-goodbad-list"><figcaption class="cv-goodbad-title">${title}</figcaption><ul class="cv-goodbad-ul">${goodLis}${badLis}</ul><p class="cv-goodbad-hint">${hint}</p></figure>`;
};

const US_GOODBAD_AS_A = buildGoodBadList(
  'As a〜（誰が）の書き分け',
  [
    '管理者として',
    '学習中の社員として',
    '月次レポートを作成する経理担当者として',
    'サポート窓口のオペレーターとして',
  ],
  [
    'ユーザーとして<span class="cv-goodbad-note">（具体性がない）</span>',
    'システムとして<span class="cv-goodbad-note">（ユーザーじゃない）</span>',
    '私として<span class="cv-goodbad-note">（誰？）</span>',
  ],
  '「ユーザー」では役割が広すぎます。役割が違えば求める価値も違うので、もう一段階具体的にします。'
);

const US_GOODBAD_IWANT = buildGoodBadList(
  'I want to〜（何を）の書き分け',
  [
    '商品を在庫切れ前に通知してほしい',
    '過去の問い合わせ履歴をキーワード検索したい',
    'レポートを月初に自動でメール送信したい',
  ],
  [
    '通知機能が欲しい<span class="cv-goodbad-note">（解決手段、目的が不明）</span>',
    'AIで分析したい<span class="cv-goodbad-note">（手段先行）</span>',
    '使いやすい画面が欲しい<span class="cv-goodbad-note">（曖昧）</span>',
  ],
  '機能ではなく<strong>ユーザーの行動</strong>を書きます。「通知機能」は手段で、「在庫切れ前に気づきたい」が行動です。'
);

const US_GOODBAD_SOTHAT = buildGoodBadList(
  'So that〜（なぜ）の書き分け',
  [
    'なぜなら、商品の発注タイミングを逃すと売上機会を失うから',
    'なぜなら、1回の問い合わせ対応時間を半減させたいから',
    'なぜなら、担当者が休暇中でもレポート配信を止めないため',
  ],
  [
    'なぜなら必要だから<span class="cv-goodbad-note">（理由になっていない）</span>',
    'なぜなら効率化のため<span class="cv-goodbad-note">（具体性がない）</span>',
    'なぜなら顧客が喜ぶから<span class="cv-goodbad-note">（測れない）</span>',
  ],
  '測れるメリットや明確な業務上の必要性まで掘り下げると、後の優先順位判断が容易になります。'
);

const buildBlockCompare = (badText: string, goodText: string) => `<figure class="cv-blockcompare">
  <div class="cv-blockcompare-row cv-blockcompare-bad">
    <span class="cv-blockcompare-label cv-blockcompare-label-bad">悪い例</span>
    <p class="cv-blockcompare-text">${badText}</p>
  </div>
  <div class="cv-blockcompare-row cv-blockcompare-good">
    <span class="cv-blockcompare-label cv-blockcompare-label-good">良い例</span>
    <p class="cv-blockcompare-text">${goodText}</p>
  </div>
</figure>`;

const US_COMPARE_INTRO = buildBlockCompare(
  '「ユーザー一覧画面に検索ボックスを追加する。検索対象はメールアドレスとユーザー名。」',
  '管理者として、ユーザーをメールアドレスで検索したい。なぜなら、問い合わせ対応時に該当ユーザーを5秒以内に見つけたいから。'
);

const US_COMPARE_MEANS = buildBlockCompare(
  '顧客として、AIチャットボットで質問したい。なぜなら、24時間対応してほしいから。',
  '顧客として、深夜でも質問の答えをすぐに得たい。なぜなら、業務時間外に検討することが多いから。'
);

const US_COMPARE_EPIC = `<figure class="cv-blockcompare">
  <div class="cv-blockcompare-row cv-blockcompare-bad">
    <span class="cv-blockcompare-label cv-blockcompare-label-bad">悪い例</span>
    <p class="cv-blockcompare-text">管理者として、すべての顧客データを管理したい。</p>
  </div>
  <div class="cv-blockcompare-row cv-blockcompare-good">
    <span class="cv-blockcompare-label cv-blockcompare-label-good">良い例</span>
    <div class="cv-blockcompare-text">
      <p>管理者として、顧客の連絡先情報を1画面で編集したい。</p>
      <p>管理者として、顧客の購入履歴を時系列で閲覧したい。</p>
      <p>管理者として、複数の顧客を一括でタグ付けしたい。</p>
    </div>
  </div>
</figure>`;

const US_COMPARE_CEO = buildBlockCompare(
  'CEOとして、KPIを可視化したい。なぜなら、経営判断の精度を上げたいから。',
  'CEOとして、サブスクリプションのチャーン率の推移を月次で見たい。なぜなら、価格改定のタイミング判断に使うから。'
);

const GHERKIN_SYNTAX = `<figure class="cv-card">
  <figcaption class="cv-card-header cv-header-primary">Gherkinの基本構文（Given / When / Then）</figcaption>
  <div class="cv-card-body">
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-who" style="min-width: 7rem;">Feature</span>
      <span class="cv-story-value">テスト対象の機能名（ユーザーストーリーに対応）</span>
    </div>
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-who" style="min-width: 7rem;">Scenario</span>
      <span class="cv-story-value">具体的な業務シナリオ1件（受入条件1つに対応）</span>
    </div>
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-why" style="min-width: 7rem;">Given</span>
      <span class="cv-story-value"><strong>前提条件</strong>：シナリオ開始時のシステム・データ状態</span>
    </div>
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-what" style="min-width: 7rem;">When</span>
      <span class="cv-story-value"><strong>操作・イベント</strong>：ユーザーまたは外部要因のアクション</span>
    </div>
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-who" style="min-width: 7rem;">Then</span>
      <span class="cv-story-value"><strong>期待される結果</strong>：システムの観測可能な振る舞い</span>
    </div>
    <div class="cv-story-row">
      <span class="cv-story-label cv-label-why" style="min-width: 7rem;">And / But</span>
      <span class="cv-story-value">同じステップ種別を続けて並べるための接続詞</span>
    </div>
  </div>
</figure>`;

const GHERKIN_EXAMPLE = `<figure class="cv-card cv-card-success">
  <figcaption class="cv-card-header cv-header-success">Gherkin の実例：商品検索のシナリオ</figcaption>
  <div class="cv-card-body cv-full-body">
    <section class="cv-full-section">
      <h4 class="cv-full-title">Feature: 商品検索</h4>
      <p class="cv-full-text">店舗マネージャーが在庫を素早く確認できるよう、商品名・コード・カテゴリで在庫を検索できる。</p>
    </section>
    <section class="cv-full-section">
      <h4 class="cv-full-title">Scenario: キーワードでの正常検索</h4>
      <ul class="cv-ears-list">
        <li><span class="cv-ears-tag cv-tag-state">Given</span><span class="cv-ears-text">商品マスタに「やかん」が10件登録されている</span></li>
        <li><span class="cv-ears-tag cv-tag-state">And</span><span class="cv-ears-text">ユーザーは検索画面を開いている</span></li>
        <li><span class="cv-ears-tag cv-tag-event">When</span><span class="cv-ears-text">検索ボックスに「やかん」を入力する</span></li>
        <li><span class="cv-ears-tag cv-tag-event">And</span><span class="cv-ears-text">検索ボタンをクリックする</span></li>
        <li><span class="cv-ears-tag cv-tag-ubiquitous">Then</span><span class="cv-ears-text">1秒以内に10件の検索結果が表示される</span></li>
        <li><span class="cv-ears-tag cv-tag-ubiquitous">And</span><span class="cv-ears-text">各結果に商品名・在庫数・最終更新日が含まれる</span></li>
      </ul>
    </section>
    <section class="cv-full-section">
      <h4 class="cv-full-title">Scenario: 該当なし</h4>
      <ul class="cv-ears-list">
        <li><span class="cv-ears-tag cv-tag-state">Given</span><span class="cv-ears-text">商品マスタに「該当無し商品」は登録されていない</span></li>
        <li><span class="cv-ears-tag cv-tag-event">When</span><span class="cv-ears-text">検索ボックスに「該当無し商品」を入力して検索する</span></li>
        <li><span class="cv-ears-tag cv-tag-unwanted">Then</span><span class="cv-ears-text">「該当する商品がありません」が表示される</span></li>
        <li><span class="cv-ears-tag cv-tag-unwanted">And</span><span class="cv-ears-text">検索結果リストは空である</span></li>
      </ul>
    </section>
  </div>
</figure>`;

const EARS_TO_GHERKIN_MAP = `<figure class="cv-card cv-card-full">
  <figcaption class="cv-card-header cv-header-primary">EARS の5パターン → Gherkin への変換ルール</figcaption>
  <div class="cv-card-body cv-full-body">
    <section class="cv-full-section">
      <h4 class="cv-full-title">ユビキタス（常時）</h4>
      <p class="cv-full-text"><strong>EARS:</strong> 商品検索システムは、検索結果を1秒以内に返す。<br><strong>Gherkin:</strong> Background または各 Scenario の Then で「常に成立する」事後条件として表現する。</p>
    </section>
    <section class="cv-full-section">
      <h4 class="cv-full-title">イベント駆動（〜のとき）</h4>
      <p class="cv-full-text"><strong>EARS:</strong> ユーザーが検索ボタンをクリックしたとき、システムは結果を表示する。<br><strong>Gherkin:</strong> When 句にトリガーを、Then 句に振る舞いをそのまま分割する（最も自然に変換できるパターン）。</p>
    </section>
    <section class="cv-full-section">
      <h4 class="cv-full-title">状態駆動（〜の間）</h4>
      <p class="cv-full-text"><strong>EARS:</strong> ユーザーがログインしている間、システムは検索履歴を保存する。<br><strong>Gherkin:</strong> 「ログイン状態」を Given に置き、操作を When、保存結果を Then に書く。</p>
    </section>
    <section class="cv-full-section">
      <h4 class="cv-full-title">オプション機能（〜の場合）</h4>
      <p class="cv-full-text"><strong>EARS:</strong> 多言語対応が有効な場合、システムは選択言語で結果を表示する。<br><strong>Gherkin:</strong> 「機能フラグが有効」を Given に置き、Scenario Outline で複数言語のパターンを表形式で並べる。</p>
    </section>
    <section class="cv-full-section">
      <h4 class="cv-full-title">望まない振る舞い（異常系）</h4>
      <p class="cv-full-text"><strong>EARS:</strong> 検索クエリが空の場合、システムはエラーメッセージを表示する。<br><strong>Gherkin:</strong> 異常な前提を Given/When に置き、エラー表示と副作用なしを Then で明示する。1異常 = 1 Scenario が原則。</p>
    </section>
  </div>
</figure>`;

const CONTACT_CTA = `<figure class="cv-card">
  <figcaption class="cv-card-header cv-header-primary">Beekleにご相談ください</figcaption>
  <div class="cv-card-body">
    <p>Beekleでは、生成AI／CDP／業務システムの企画・要件定義・開発・運用までワンストップで支援しています。「何を作れば成功か」の整理、検証フェーズの設計、本番化判断まで、発注側の判断材料が揃うように伴走します。費用感の概算だけでも歓迎です。</p>
    <p style="text-align:center;margin-top:1.25rem;"><a href="/contact">お問い合わせはこちら</a></p>
  </div>
</figure>`;

const EARS_GHERKIN_WORKFLOW = `<figure class="cv-whyhow">
  <figcaption class="cv-whyhow-title">ビジネスサイド → エンジニア → デモ／テストの流れ</figcaption>
  <div class="cv-whyhow-box cv-whyhow-why">
    <div class="cv-whyhow-label cv-label-why">STEP 1 ／ ビジネスサイド</div>
    <div class="cv-whyhow-text">ユーザーストーリーで Why を、EARS で受入条件と異常系を曖昧さなく言語化する。<br>業務知識を持つ人が書ける粒度で、技術用語は不要。</div>
  </div>
  <div class="cv-whyhow-arrow">生成AIで Gherkin に変換（プロンプトテンプレ化可）</div>
  <div class="cv-whyhow-box cv-whyhow-how">
    <span class="cv-whyhow-num">STEP 2</span>
    <span class="cv-whyhow-text">エンジニアが Gherkin を確認・補正し、Cucumber／Behave／Playwright BDD でステップ定義を実装する。</span>
  </div>
  <div class="cv-whyhow-box cv-whyhow-how">
    <span class="cv-whyhow-num">STEP 3</span>
    <span class="cv-whyhow-text">同じ Gherkin から動くデモを作り、ステークホルダーに見せて受入確認を行う。</span>
  </div>
  <div class="cv-whyhow-box cv-whyhow-how">
    <span class="cv-whyhow-num">STEP 4</span>
    <span class="cv-whyhow-text">同じ Gherkin が CI のシナリオテストとして残り、リグレッションを継続的に検出する。</span>
  </div>
</figure>`;

const VISUALS: Record<string, string> = {
  CONTACT_CTA,
  USER_STORY_TEMPLATE,
  USER_STORY_EXAMPLE_NURSING,
  USER_STORY_EXAMPLE_WAREHOUSE,
  WHY_TO_HOW,
  SCENARIO_COMPARISON,
  FM_MATRIX,
  EARS_PATTERNS,
  EARS_EXAMPLES,
  EARS_FULL_EXAMPLE,
  EARS_GOODBAD_SUBJECT,
  EARS_GOODBAD_NUMBER,
  US_ACCEPTANCE_CHECKLIST,
  US_FULL_EXAMPLE,
  US_GOODBAD_AS_A,
  US_GOODBAD_IWANT,
  US_GOODBAD_SOTHAT,
  US_COMPARE_INTRO,
  US_COMPARE_MEANS,
  US_COMPARE_EPIC,
  US_COMPARE_CEO,
  GHERKIN_SYNTAX,
  GHERKIN_EXAMPLE,
  EARS_TO_GHERKIN_MAP,
  EARS_GHERKIN_WORKFLOW,
};

/**
 * 記事 HTML 内のマーカー（`<p>{{NAME}}</p>` または `{{NAME}}`）を
 * 対応するビジュアル HTML に置換する。
 */
export function renderColumnVisuals(html: string): string {
  let result = html;
  for (const [key, visual] of Object.entries(VISUALS)) {
    // <p>{{KEY}}</p> パターン（空白を許容）と、裸の {{KEY}} パターンの両方に対応
    const wrapped = new RegExp(`<p>\\s*\\{\\{${key}\\}\\}\\s*</p>`, 'g');
    const bare = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(wrapped, visual).replace(bare, visual);
  }
  return result;
}
