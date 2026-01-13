import { createClient } from 'microcms-js-sdk';

if (!import.meta.env.MICROCMS_SERVICE_DOMAIN) {
  throw new Error('MICROCMS_SERVICE_DOMAIN is required');
}

if (!import.meta.env.MICROCMS_API_KEY) {
  throw new Error('MICROCMS_API_KEY is required');
}

// MicroCMS APIクライアントの作成
export const client = createClient({
  serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.MICROCMS_API_KEY,
});

// カテゴリーの型定義
export type Category = {
  id: string;
  title: string;
  description: string;
  icon?: string;
  order: number;
};

// コラム記事の型定義
export type Column = {
  id: string;
  title: string;
  content: string;
  category: Category;
  publishedAt: string;
  updatedAt: string;
  revisedAt?: string;
};

// カテゴリー一覧を取得
export async function getCategories() {
  try {
    const data = await client.get({
      endpoint: 'categories',
      queries: {
        orders: 'order',
      },
    });
    return data.contents as Category[];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

// コラム一覧を取得（カテゴリーでフィルタリング可能）
export async function getColumns(categoryId?: string) {
  try {
    const queries: { orders: string; filters?: string } = {
      orders: '-publishedAt',
    };

    if (categoryId) {
      queries.filters = `category[equals]${categoryId}`;
    }

    const data = await client.get({
      endpoint: 'columns',
      queries,
    });
    return data.contents as Column[];
  } catch (error) {
    console.error('Failed to fetch columns:', error);
    return [];
  }
}

// 特定のコラム記事を取得
export async function getColumn(id: string) {
  try {
    const data = await client.get({
      endpoint: 'columns',
      contentId: id,
    });
    return data as Column;
  } catch (error) {
    console.error(`Failed to fetch column ${id}:`, error);
    return null;
  }
}

// すべてのコラム記事のIDを取得（静的生成用）
export async function getAllColumnIds() {
  try {
    const data = await client.get({
      endpoint: 'columns',
      queries: {
        fields: 'id',
        limit: 100,
      },
    });
    return data.contents.map((content: { id: string }) => content.id);
  } catch (error) {
    console.error('Failed to fetch column IDs:', error);
    return [];
  }
}
