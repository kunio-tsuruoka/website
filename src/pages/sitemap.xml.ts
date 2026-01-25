import type { APIRoute } from 'astro';
import { articleCategories } from '../data/article-categories';
import { services } from '../data/service';
import { type MicroCMSEnv, getColumns } from '../lib/microcms';

const SITE_URL = 'https://beekle.co.jp';

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
  { url: '/works', priority: '0.7', changefreq: 'monthly' },
  { url: '/case-studies', priority: '0.7', changefreq: 'monthly' },
  { url: '/development-issues', priority: '0.7', changefreq: 'monthly' },
  { url: '/knowledge', priority: '0.8', changefreq: 'weekly' },
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

  // ナレッジ記事
  const knowledgePages: { url: string; priority: string; changefreq: string }[] = [];
  for (const category of articleCategories) {
    for (const article of category.articles) {
      knowledgePages.push({
        url: `/knowledge/${article.slug}`,
        priority: '0.6',
        changefreq: 'monthly',
      });
    }
  }

  // MicroCMSコラム記事
  let columnPages: { url: string; priority: string; changefreq: string; lastmod?: string }[] = [];
  try {
    const columns = await getColumns(undefined, env);
    columnPages = columns.map((column) => ({
      url: `/column/${column.id}`,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: column.updatedAt ? new Date(column.updatedAt).toISOString().split('T')[0] : now,
    }));
  } catch (error) {
    console.error('Failed to fetch columns for sitemap:', error);
  }

  // 全ページを結合
  const allPages = [...staticPages, ...servicePages, ...knowledgePages, ...columnPages];

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
