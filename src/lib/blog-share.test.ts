import { describe, expect, it } from 'vitest';
import { buildBlogShareEventParams, buildBlogShareLinks } from './blog-share';

const title = '小さな社内システムのRAGに、ベクトルDBはいらないかもしれない';
const url = 'https://beekle.jp/blog/small-internal-rag-without-vector-db';

function expectTrackedArticleUrl(value: string | null, source: string): void {
  expect(value).not.toBeNull();
  const trackedUrl = new URL(value as string);
  expect(trackedUrl.origin + trackedUrl.pathname).toBe(url);
  expect(trackedUrl.searchParams.get('utm_source')).toBe(source);
  expect(trackedUrl.searchParams.get('utm_medium')).toBe('social');
  expect(trackedUrl.searchParams.get('utm_campaign')).toBe('blog_share');
}

describe('buildBlogShareLinks', () => {
  it('Xへ記事タイトルと計測可能なURLを渡す', () => {
    const shareUrl = new URL(buildBlogShareLinks({ title, url }).x);

    expect(shareUrl.origin + shareUrl.pathname).toBe('https://x.com/intent/tweet');
    expect(shareUrl.searchParams.get('text')).toBe(title);
    expectTrackedArticleUrl(shareUrl.searchParams.get('url'), 'x');
  });

  it('LinkedInへ計測可能な記事URLを渡す', () => {
    const shareUrl = new URL(buildBlogShareLinks({ title, url }).linkedin);

    expect(shareUrl.origin + shareUrl.pathname).toBe(
      'https://www.linkedin.com/sharing/share-offsite/'
    );
    expectTrackedArticleUrl(shareUrl.searchParams.get('url'), 'linkedin');
  });

  it('LINEへ記事タイトルと計測可能なURLを渡す', () => {
    const shareUrl = new URL(buildBlogShareLinks({ title, url }).line);

    expect(shareUrl.origin + shareUrl.pathname).toBe('https://social-plugins.line.me/lineit/share');
    expect(shareUrl.searchParams.get('text')).toBe(title);
    expectTrackedArticleUrl(shareUrl.searchParams.get('url'), 'line');
  });
});

describe('buildBlogShareEventParams', () => {
  it('GA4の推奨shareイベント向けの項目へ変換する', () => {
    expect(
      buildBlogShareEventParams({
        slug: 'small-internal-rag-without-vector-db',
        target: 'copy',
        position: 'footer',
      })
    ).toEqual({
      method: 'copy',
      content_type: 'blog_article',
      item_id: 'small-internal-rag-without-vector-db',
      share_position: 'footer',
    });
  });
});
