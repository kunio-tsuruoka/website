import { createClient, type MicroCMSClient } from 'microcms-js-sdk';

// MicroCMS APIクライアント（遅延初期化）
let _client: MicroCMSClient | null = null;

function getClient(): MicroCMSClient {
  if (_client) return _client;

  const serviceDomain = import.meta.env.MICROCMS_SERVICE_DOMAIN;
  const apiKey = import.meta.env.MICROCMS_API_KEY;

  if (!serviceDomain || !apiKey) {
    throw new Error(
      'MicroCMS environment variables are not set. Please set MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY.'
    );
  }

  _client = createClient({ serviceDomain, apiKey });
  return _client;
}

// 後方互換性のためexport
export const client = {
  get: (params: Parameters<MicroCMSClient['get']>[0]) => getClient().get(params),
};

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
