/**
 * Beekle 固有用語の用語集。
 * `build-column-embeddings.mjs` がコラムと一緒に埋め込み、
 * `/api/ai/chat` の RAG 文脈に流し込まれる。
 *
 * 追加方法:
 *   - id は `glossary-` プレフィクスでユニーク
 *   - title は質問されそうな自然な言い回し（略語＋正式名称）
 *   - excerpt は LLM がそのまま答えに使える短い定義文（200〜400字）
 *   - url は深掘りページが無ければ `/about` や `/services` 等の安全な相対URL
 */

export const BEEKLE_GLOSSARY = [
  {
    id: 'glossary-fm',
    title: 'FM（ファンクショナリティ・マトリクス）とは',
    url: '/tools/scope-manager',
    excerpt:
      'FM は「ファンクショナリティ・マトリクス」(Functionality Matrix) の略称です。Future Mode でも Functional Specification でもありません。書籍『システムを作らせる技術』(白川克著、ISBN 978-4-532-32399-8) で紹介されている、システムに載せる機能候補を「ビジネス価値 / 現場で使えるか / 技術コスト」の3軸で評価して、作る・後回し・作らない を判断する一覧表のことです。Beekle では要件定義のヒアリングで集めた要望をユーザーストーリーに分解し、最終的に FM で優先度を整理する流れで使っています。Beekle 社内ツール「スコープマネージャー」(/tools/scope-manager) でこの判定をオンラインで体験できます。',
  },
  {
    id: 'glossary-asis-tobe',
    title: 'AsIs / ToBe（現状業務フローと改善後フロー）とは',
    url: '/tools/flow-mapper',
    excerpt:
      'AsIs（アズイズ）は現状の業務フロー、ToBe（トゥービー）は改善後の理想フローを指します。Beekle では要件定義の入口で、まず AsIs をスイムレーン図に書き起こして「誰が・どの工程で・何分かけているか」を可視化し、ボトルネックを見つけてから ToBe を設計します。Beekle 社内ツール「フローマッパー」(/tools/flow-mapper) で AsIs/ToBe の両方を並べて編集できます。',
  },
  {
    id: 'glossary-user-story',
    title: 'ユーザーストーリーとは',
    url: '/tools/story-builder',
    excerpt:
      'ユーザーストーリーは「〈誰〉として、〈何〉がしたい。なぜなら〈理由〉だから」という形式で要望を1枚に書き起こす手法です。Beekle ではヒアリングで集めた現場の声をこの形に分解してから、FM（ファンクショナリティ・マトリクス）で優先度を判定します。Beekle 社内ツール「ストーリービルダー」(/tools/story-builder) で REQ-XXX 形式の ID を振りながら整理でき、出力した Markdown はそのままスコープマネージャーに読み込めます。',
  },
  {
    id: 'glossary-scope-manager',
    title: 'スコープマネージャー（Beekle ツール）とは',
    url: '/tools/scope-manager',
    excerpt:
      'スコープマネージャーは Beekle が公開している Web ツールで、要件候補を「ビジネス価値 / 現場で使えるか / 技術コスト」の3軸で評価して FM（ファンクショナリティ・マトリクス）方式で優先度を判定します。ストーリービルダーで作ったユーザーストーリーをそのまま貼り付けて使えます。URL は /tools/scope-manager です。',
  },
  {
    id: 'glossary-flow-mapper',
    title: 'フローマッパー（Beekle ツール）とは',
    url: '/tools/flow-mapper',
    excerpt:
      'フローマッパーは Beekle が公開している Web ツールで、業務フローをスイムレーン形式で可視化します。AsIs（現状）と ToBe（改善後）を並べて編集でき、各ステップの所要時間や担当者を入れるとコスト試算と改善提案を自動で出します。URL は /tools/flow-mapper です。',
  },
  {
    id: 'glossary-story-builder',
    title: 'ストーリービルダー（Beekle ツール）とは',
    url: '/tools/story-builder',
    excerpt:
      'ストーリービルダーは Beekle が公開している Web ツールで、要望をユーザーストーリー形式（「〈誰〉として〈何〉がしたい。なぜなら〈理由〉」）に分解しながら REQ-XXX 形式の ID で管理します。出力した Markdown はスコープマネージャーにそのまま読み込めるため、ヒアリング → ストーリー化 → 優先度判定 の流れがツール上で完結します。URL は /tools/story-builder です。',
  },
  {
    id: 'glossary-beekle-domain',
    title: 'Beekle のサイトURL',
    url: '/',
    excerpt:
      'Beekle のコーポレートサイトのドメインは beekle.jp です。beekle.co.jp や beekle.com ではありません。コラム記事の URL は https://beekle.jp/column/<記事ID>/ の形式です。回答内で URL を案内する時は、必ず参考コラム抜粋に含まれる URL のみを使い、別ドメインの URL を勝手に組み立てないでください。',
  },
];
