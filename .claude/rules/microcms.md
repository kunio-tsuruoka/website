# MicroCMS API

## 基本情報

- APIクライアント: `src/lib/microcms.ts`
- 上限: 100件/リクエスト（100件超えはページネーション必須）
- 環境変数: `MICROCMS_SERVICE_DOMAIN`, `MICROCMS_API_KEY`

## エンドポイント

- `categories` - カテゴリー一覧
- `columns` - コラム記事

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
