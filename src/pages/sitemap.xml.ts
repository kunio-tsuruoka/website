import type { APIRoute } from 'astro';
import { services } from '../data/service';
import { type MicroCMSEnv, getColumns, isPillarArticle } from '../lib/microcms';

const SITE_URL = 'https://beekle.jp';

// 静的ページ一覧
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/prooffirst', priority: '0.9', changefreq: 'weekly' },
  { url: '/contact', priority: '0.9', changefreq: 'monthly' },
  { url: '/company', priority: '0.8', changefreq: 'monthly' },
  { url: '/members', priority: '0.7', changefreq: 'monthly' },
  { url: '/process', priority: '0.8', changefreq: 'monthly' },
  { url: '/strengths', priority: '0.8', changefreq: 'monthly' },
  { url: '/testimonial', priority: '0.7', changefreq: 'monthly' },
  { url: '/case-studies', priority: '0.7', changefreq: 'monthly' },
  { url: '/materials', priority: '0.6', changefreq: 'monthly' },
  { url: '/column', priority: '0.8', changefreq: 'daily' },
  { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
];

export const GET: APIRoute = async ({ locals }) => {
  const now = new Date().toISOString().split('T')[0];

  // Cloudflare Pages SSR: ランタイム環境変数を取得
  const runtime = (locals as { runtime?: { env?: MicroCMSEnv } }).runtime;
  const env = runtime?.env;

  // サービスページ
  const servicePages = services.map((service) => ({
    url: `/services/${service.id}`,
    priority: '0.8',
    changefreq: 'monthly',
  }));

  // MicroCMSコラム記事
  let columnPages: { url: string; priority: string; changefreq: string; lastmod?: string }[] = [];
  try {
    const columns = await getColumns(undefined, env);
    columnPages = columns.map((column) => ({
      url: `/column/${column.id}`,
      priority: isPillarArticle(column.id) ? '0.9' : '0.7',
      changefreq: 'weekly',
      lastmod: column.updatedAt ? new Date(column.updatedAt).toISOString().split('T')[0] : now,
    }));
  } catch (error) {
    console.error('Failed to fetch columns for sitemap:', error);
  }

  // 全ページを結合
  const allPages = [...staticPages, ...servicePages, ...columnPages];

  // XML生成
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
      .map(
        (page) => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${'lastmod' in page && page.lastmod ? page.lastmod : now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
      )
      .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // 1時間キャッシュ
    },
  });
};
