import type { APIRoute } from 'astro';
import { consultationHub, consultationSituations } from '../data/consultation-situations';
import { services } from '../data/service';
import { redirectedColumnIds } from '../lib/column-redirects';
import {
  BLOGS_PER_PAGE,
  type MicroCMSEnv,
  getBlogs,
  getColumns,
  isPillarArticle,
} from '../lib/microcms';

const SITE_URL = 'https://beekle.jp';

type SitemapPage = {
  url: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
};

// 静的ページ一覧
const staticPages: SitemapPage[] = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: consultationHub.href, priority: '0.9', changefreq: 'weekly' },
  ...consultationSituations.map((situation) => ({
    url: situation.href,
    priority: '0.8',
    changefreq: 'monthly',
  })),
  { url: '/prooffirst', priority: '0.9', changefreq: 'weekly' },
  { url: '/services/ai-adoption', priority: '0.9', changefreq: 'monthly' },
  { url: '/contact', priority: '0.9', changefreq: 'monthly' },
  { url: '/company', priority: '0.8', changefreq: 'monthly' },
  { url: '/members', priority: '0.7', changefreq: 'monthly' },
  { url: '/process', priority: '0.8', changefreq: 'monthly' },
  { url: '/strengths', priority: '0.8', changefreq: 'monthly', lastmod: '2026-08-17' },
  { url: '/testimonial', priority: '0.7', changefreq: 'monthly' },
  { url: '/case-studies', priority: '0.7', changefreq: 'monthly' },
  { url: '/column', priority: '0.8', changefreq: 'daily' },
  { url: '/column/genai-adoption', priority: '0.8', changefreq: 'weekly' },
  { url: '/column/project-management', priority: '0.8', changefreq: 'weekly' },
  { url: '/column/communication', priority: '0.8', changefreq: 'weekly' },
  { url: '/column/estimate-concerns', priority: '0.8', changefreq: 'weekly' },
  { url: '/column/ai-development', priority: '0.8', changefreq: 'weekly' },
  { url: '/column/cdp-development', priority: '0.8', changefreq: 'weekly' },
  { url: '/column/dx', priority: '0.8', changefreq: 'weekly' },
  { url: '/blog', priority: '0.7', changefreq: 'weekly' },
  { url: '/knowledge', priority: '0.8', changefreq: 'weekly' },
  { url: '/partner', priority: '0.8', changefreq: 'monthly' },
  { url: '/careers', priority: '0.6', changefreq: 'monthly' },
  { url: '/careers/contact', priority: '0.5', changefreq: 'monthly' },
  { url: '/qa', priority: '0.7', changefreq: 'monthly' },
  { url: '/tools', priority: '0.8', changefreq: 'monthly' },
  { url: '/tools/flow-mapper', priority: '0.8', changefreq: 'monthly' },
  { url: '/tools/story-builder', priority: '0.8', changefreq: 'monthly' },
  { url: '/tools/scope-manager', priority: '0.8', changefreq: 'monthly' },
  { url: '/tools/rfp-builder', priority: '0.8', changefreq: 'monthly' },
  { url: '/demos', priority: '0.7', changefreq: 'monthly' },
  { url: '/demos/it-advisor', priority: '0.7', changefreq: 'monthly' },
  { url: '/demos/ocr', priority: '0.7', changefreq: 'monthly' },
  { url: '/checklists/dev-process', priority: '0.6', changefreq: 'monthly' },
  { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
];

export const GET: APIRoute = async ({ locals }) => {
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
  let columnPages: SitemapPage[] = [];
  try {
    const columns = await getColumns(undefined, env);
    // knowledge カテゴリの記事は /knowledge/<id> で配信され、canonical もそちらを指す
    // （src/pages/column/[...slug].astro の sectionPath）。sitemap が /column/ を
    // 主張すると canonical と食い違い、同一記事の2URLが別々にインデックスされる。
    columnPages = columns
      .filter((column) => !redirectedColumnIds.has(column.id))
      .map((column) => ({
        url:
          column.category?.id === 'knowledge' ? `/knowledge/${column.id}` : `/column/${column.id}`,
        priority: isPillarArticle(column.id) ? '0.9' : '0.7',
        changefreq: 'weekly',
        lastmod: column.updatedAt
          ? new Date(column.updatedAt).toISOString().split('T')[0]
          : undefined,
      }));
  } catch (error) {
    console.error('Failed to fetch columns for sitemap:', error);
  }

  // MicroCMSブログ記事
  let blogPages: SitemapPage[] = [];
  let blogIndexPages: SitemapPage[] = [];
  try {
    const blogs = await getBlogs(env);
    const totalBlogIndexPages = Math.ceil(blogs.length / BLOGS_PER_PAGE);
    blogIndexPages =
      totalBlogIndexPages > 1
        ? Array.from({ length: totalBlogIndexPages - 1 }, (_, index) => ({
            url: `/blog/page/${index + 2}`,
            priority: '0.5',
            changefreq: 'weekly',
          }))
        : [];
    blogPages = blogs.map((blog) => ({
      url: `/blog/${blog.id}`,
      priority: '0.6',
      changefreq: 'weekly',
      lastmod: blog.updatedAt ? new Date(blog.updatedAt).toISOString().split('T')[0] : undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch blogs for sitemap:', error);
  }

  // 全ページを結合
  const allPages = [
    ...staticPages,
    ...servicePages,
    ...columnPages,
    ...blogIndexPages,
    ...blogPages,
  ];

  // XML生成
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map((page) => {
    const lastmod = page.lastmod ? `    <lastmod>${page.lastmod}</lastmod>\n` : '';
    return `  <url>
    <loc>${SITE_URL}${page.url}</loc>
${lastmod}    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // 1時間キャッシュ
    },
  });
};
