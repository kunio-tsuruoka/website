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
