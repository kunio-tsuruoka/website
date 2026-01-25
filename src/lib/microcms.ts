import { type MicroCMSClient, createClient } from 'microcms-js-sdk';

// 環境変数の型
export interface MicroCMSEnv {
  MICROCMS_SERVICE_DOMAIN: string;
  MICROCMS_API_KEY: string;
}

// MicroCMS APIクライアント（キャッシュ用）
let _cachedClient: MicroCMSClient | null = null;
let _cachedDomain: string | null = null;

/**
 * MicroCMSクライアントを取得
 * Cloudflare Pages SSRでは env パラメータを渡す必要あり
 */
export function getClient(env?: MicroCMSEnv): MicroCMSClient {
  // 環境変数を取得（優先順位: 引数 > import.meta.env）
  const serviceDomain = env?.MICROCMS_SERVICE_DOMAIN || import.meta.env.MICROCMS_SERVICE_DOMAIN;
  const apiKey = env?.MICROCMS_API_KEY || import.meta.env.MICROCMS_API_KEY;

  if (!serviceDomain || !apiKey) {
    throw new Error(
      'MicroCMS environment variables are not set. Please set MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY.'
    );
  }

  // キャッシュされたクライアントを再利用（同じドメインの場合）
  if (_cachedClient && _cachedDomain === serviceDomain) {
    return _cachedClient;
  }

  _cachedClient = createClient({ serviceDomain, apiKey });
  _cachedDomain = serviceDomain;
  return _cachedClient;
}

// 後方互換性のためexport（ビルド時・ローカル開発用）
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
export async function getCategories(env?: MicroCMSEnv) {
  try {
    const data = await getClient(env).get({
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
export async function getColumns(categoryId?: string, env?: MicroCMSEnv) {
  try {
    const queries: { orders: string; filters?: string } = {
      orders: '-publishedAt',
    };

    if (categoryId) {
      queries.filters = `category[equals]${categoryId}`;
    }

    const data = await getClient(env).get({
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
export async function getColumn(id: string, env?: MicroCMSEnv) {
  try {
    const data = await getClient(env).get({
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
