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
  description?: string;
  category: Category;
  publishedAt: string;
  updatedAt: string;
  revisedAt?: string;
};

export type MicroCMSImage = {
  url: string;
  height?: number;
  width?: number;
};

export type BlogTag =
  | string
  | {
      id?: string;
      name?: string;
      title?: string;
    };

// 雑記ブログの型定義
export type Blog = {
  id: string;
  title: string;
  content?: string;
  body?: string;
  description?: string;
  ogimage?: MicroCMSImage;
  eyecatch?: MicroCMSImage;
  thumbnail?: MicroCMSImage;
  cover?: MicroCMSImage;
  image?: MicroCMSImage;
  tags?: BlogTag[] | string;
  publishedAt: string;
  updatedAt: string;
  revisedAt?: string;
};

const BLOG_ENDPOINT = 'blogs';
export const BLOGS_PER_PAGE = 10;

export type PaginatedBlogs = {
  contents: Blog[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  offset: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
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

// ブログ一覧を取得
export async function getBlogs(env?: MicroCMSEnv) {
  try {
    const client = getClient(env);
    const limit = 100;
    const all: Blog[] = [];
    let offset = 0;

    while (true) {
      const data = await client.get({
        endpoint: BLOG_ENDPOINT,
        queries: {
          orders: '-publishedAt',
          limit,
          offset,
        },
      });
      all.push(...(data.contents as Blog[]));

      if (all.length >= data.totalCount || data.contents.length === 0) {
        break;
      }
      offset += limit;
    }

    return all;
  } catch (error) {
    console.error('Failed to fetch blogs:', error);
    return [];
  }
}

// ブログ一覧の1ページ分を取得
export async function getBlogsPage(
  page = 1,
  limit = BLOGS_PER_PAGE,
  env?: MicroCMSEnv
): Promise<PaginatedBlogs> {
  const currentPage = Math.max(1, Math.trunc(page));
  const pageSize = Math.min(100, Math.max(1, Math.trunc(limit)));
  const offset = (currentPage - 1) * pageSize;
  const data = await getClient(env).get({
    endpoint: BLOG_ENDPOINT,
    queries: {
      orders: '-publishedAt',
      limit: pageSize,
      offset,
    },
  });
  const totalCount = typeof data.totalCount === 'number' ? data.totalCount : 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    contents: data.contents as Blog[],
    totalCount,
    currentPage,
    totalPages,
    limit: pageSize,
    offset,
    hasPrevPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
  };
}

// 特定のブログ記事を取得
export async function getBlog(id: string, env?: MicroCMSEnv) {
  try {
    const data = await getClient(env).get({
      endpoint: BLOG_ENDPOINT,
      contentId: id,
    });
    return data as Blog;
  } catch (error) {
    console.error(`Failed to fetch blog ${id}:`, error);
    return null;
  }
}

// 関連ブログ記事を取得
export async function getRelatedBlogs(currentId: string, limit = 4, env?: MicroCMSEnv) {
  try {
    const data = await getClient(env).get({
      endpoint: BLOG_ENDPOINT,
      queries: {
        filters: `id[not_equals]${currentId}`,
        orders: '-publishedAt',
        limit,
      },
    });
    return data.contents as Blog[];
  } catch (error) {
    console.error('Failed to fetch related blogs:', error);
    return [];
  }
}
