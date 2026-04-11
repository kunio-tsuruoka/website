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

const VISUALS: Record<string, string> = {
  USER_STORY_TEMPLATE,
  USER_STORY_EXAMPLE_NURSING,
  USER_STORY_EXAMPLE_WAREHOUSE,
  WHY_TO_HOW,
  SCENARIO_COMPARISON,
  FM_MATRIX,
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
