# MicroCMS API

> 本文の文体・AIっぽさ排除・Markdown残骸チェックは `column-writing-style.md` を参照。

## 基本情報

- APIクライアント: `src/lib/microcms.ts`
- 上限: 100件/リクエスト（100件超えはページネーション必須）
- 環境変数: `MICROCMS_SERVICE_DOMAIN`, `MICROCMS_API_KEY`

## エンドポイント

- `categories` - カテゴリー一覧
- `columns` - コラム記事
- `qa-categories` - 一問一答カテゴリー
- `qas` - 一問一答（複数形 `qas`、コードの `getQAs/getQA` も `qas` に揃える）

**注意**: MicroCMS の API スキーマ作成時のエンドポイント名は **コード側 (`src/lib/microcms.ts` の `endpoint:` 引数) と完全一致** している必要がある。単数 / 複数の揺れで GET が空配列を返すと、ページは描画されるが構造化データだけ抜け落ちる事故になる（2026-05-03 に `qa` vs `qas` でこのパターン発生）。新スキーマ追加時は **(1) microcms.ts の endpoint 文字列 (2) MicroCMS 管理画面の API ID (3) 入稿スクリプトの endpoint** の3点を必ず揃える。

# microcms-js-sdk の `status: 'draft'` は client.create() で効かない（2026-05-03 確認）

`scripts/publish-drafts.mjs` で `client.create({ endpoint: 'columns', contentId, content, status: 'draft' })` のように呼んでいるが、**実際には公開状態で作成される**（`publishedAt` が現在時刻で設定され、通常の Content API GET でそのまま取れる）。コメントには「下書き状態で投稿（管理画面で確認後に公開）」と書いてあるが、実態と合っていない。

**how to apply**: 「draft 投入してから管理画面で公開」を期待してはいけない。`publish-drafts.mjs --apply` を走らせた瞬間に **本番公開と同じ扱い**になる前提で確認・レビューしてから実行する。draft で止めたい場合は管理画面から `status` を手動で変更するか、別の API オプション（`microcms-js-sdk` v2 系の new API）を調査する必要がある。

**why**: 2026-05-03、情シス向けDXコラム4本を「draft で投入したつもり」が、実は即時公開されていた。`publishedAt` が現在時刻で設定されている＝公開済みのサイン。フロント `/column/<slug>` も HTTP 200 で表示。幸い内容に問題なかったので公開のまま運用するが、本来はレビュー機会を失っている事故。

## 使用例

```typescript
import { getCategories, getColumns, getColumn } from '@/lib/microcms';

// カテゴリー一覧
const categories = await getCategories();

// コラム一覧（カテゴリーフィルタ可）
const columns = await getColumns(categoryId);

// 単一コラム
const column = await getColumn(id);
```

## 型定義

```typescript
type Category = {
  id: string;
  title: string;
  description: string;
  icon?: string;
  order: number;
};

type Column = {
  id: string;
  title: string;
  content: string;
  category: Category;
  publishedAt: string;
  updatedAt: string;
};
```

# MicroCMS columns API gotchas

- `category` フィールドは**単数値（文字列）**で送る。配列で送ると `'category' has unexpected data type.` (HTTP 400) になる。
- `<pre><code>` ブロックは `src/pages/column/[...slug].astro` のグローバル CSS で `bg-gray-900` (暗ネイビー) になるため、業務的な構造化された例には不向き。`{{MARKER}}` で `cv-card` 系の明るいビジュアルに置換する。
- 新記事追加後は `node scripts/generate-descriptions.mjs` で description を自動生成（OpenRouter Claude Haiku、`OPENROUTER_API_KEY` 必須）。description を手で書いた場合はスキップで OK。
- **`<a><code>...</code></a>` のネストはサニタイザに剥がされる**（API 経由 PATCH で保存しても `<a>` だけ消えて `<code>` が残る）。コードフォントでパスを見せたいけどリンクにもしたい時は、`<code>` をやめてプレーンな `<a href="/tools/foo">/tools/foo</a>` にする。markdown の `[\`/path\`](/path)` を MicroCMS に流し込んだ場合も同じ理由でリンクが落ちるので、HTML 直編集で `<a>` 単体に直す必要がある。

# MicroCMS は HTML 入稿（Markdownドラフト → marked変換は非推奨）

`columns` は HTML フィールドなので、ドラフトは最初から HTML で書く方が安全。理由: `marked()` 経由だと、`{{MARKER}}` の前後改行や `<div>` 内の Markdown 行が想定外に変換され、cv-card の構造が崩れることがある（実際 2026-05 の生成AI/CDP 8本投入時に指摘あり）。

`scripts/publish-drafts.mjs` は `.md` と `.html` 両方を読む。**`.html` は marked を通さず、本文をそのまま MicroCMS に投入する**（`file.endsWith('.html') ? body : marked(body)`）。新規ドラフトは原則 `.html` で書く。

メタヘッダ（`想定スラッグ:` `推奨カテゴリ:` `想定 description:`）と先頭の `# タイトル` 行は `.html` でも Markdown 形式の `>` 引用ブロックでOK（`stripMetaBlock` がパース）。本文だけ HTML にする。

# cv-card 系の <div> は MicroCMS サニタイザに剥がされる（{{MARKER}} 必須）

`<div class="cv-card">...</div>` を本文HTMLに直書きすると、**MicroCMS リッチエディタのサニタイザが `<div>` と class 属性を完全に剥がす**。結果、cv-card のヘッダー/ボディが普通の `<p>` と `<ul>` の連続だけになり、column [...slug].astro 側のスタイルが効かない。

特に致命的なのは、CTAブロックを `<div class="cv-card-body"><p>本文…<a href="/contact">お問い合わせはこちら</a>。</p></div>` の構造で書くと、`<div>` が剥がされた結果 `<p>` の `:only-child` 条件を満たさず、ピル化CSSが効かずに文中にプレーンリンクとして表示される。Astro CSS の `p > a[href^="/contact"]:only-child` 条件はサニタイズ後のHTML構造で評価される点に注意。

**正しいパターン**:
- 本文中の cv-card → 直書き禁止。`<h3>` + リスト/段落/blockquote の素HTMLで代替する（class 属性なし要素はサニタイザ通過）
- 共通CTAブロック → `column-visuals.ts` の `VISUALS` レコードに `CONTACT_CTA` 等を定義し、本文には `{{CONTACT_CTA}}` プレースホルダだけ書く（`renderColumnVisuals()` が Astro 側で実HTMLに置換）

新規ビジュアルが必要になったら同じ要領で `column-visuals.ts` にHTMLを定義 + マーカー名を `VISUALS` に追加 + 記事本文には `{{NAME}}` だけ書く。

# MicroCMS PATCH に1行詰めHTML を送るとブロック要素間が壊れる

API経由で `client.update({ content: { content: '<h3>X</h3><p>Y</p>' } })` のように **改行なし1行のHTML** を送ると、MicroCMS のサニタイザがブロック境界を解釈できずに `<h3>` を剥がして次の `<p>` に統合する事故が起きる（2026-05、9記事のCTAブロックで実際に発生：`<h3>Beekleにご相談ください</h3><p>本文</p><p><a>...</a></p>` が `<p>Beekleにご相談くださいBeekleでは...本文...<a>...</a></p>` の1段落に潰された）。

**送るときは必ず改行を入れた整形済みHTMLにする**:
```js
const cta = `
<h3>タイトル</h3>
<p>本文</p>
<p><a href="/contact">お問い合わせはこちら</a></p>
`.trim();
```

検証は `client.get(...).content` を生で見ると一発でわかる（潰れていれば1段落にマージされている）。
