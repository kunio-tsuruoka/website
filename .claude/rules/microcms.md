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
