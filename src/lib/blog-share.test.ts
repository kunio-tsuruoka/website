import { describe, expect, it } from 'vitest';
import { buildBlogShareEventParams, buildBlogShareLinks } from './blog-share';

describe('buildBlogShareLinks', () => {
  const title = '小さな社内システムのRAGに、ベクトルDBはいらないかもしれない';
  const url = 'https://beekle.jp/blog/small-internal-rag-without-vector-db';

  it('Xへ記事タイトルとURLを渡す', () => {
    const shareUrl = new URL(buildBlogShareLinks({ title, url }).x);

    expect(shareUrl.origin + shareUrl.pathname).toBe('https://twitter.com/intent/tweet');
    expect(shareUrl.searchParams.get('text')).toBe(title);
    expect(shareUrl.searchParams.get('url')).toBe(url);
  });

  it('LinkedInへ記事URLを渡す', () => {
    const shareUrl = new URL(buildBlogShareLinks({ title, url }).linkedin);

    expect(shareUrl.origin + shareUrl.pathname).toBe(
      'https://www.linkedin.com/sharing/share-offsite/'
    );
    expect(shareUrl.searchParams.get('url')).toBe(url);
  });

  it('LINEへ記事タイトルとURLを渡す', () => {
    const shareUrl = new URL(buildBlogShareLinks({ title, url }).line);

    expect(shareUrl.origin + shareUrl.pathname).toBe('https://social-plugins.line.me/lineit/share');
    expect(shareUrl.searchParams.get('text')).toBe(title);
    expect(shareUrl.searchParams.get('url')).toBe(url);
  });
});

describe('buildBlogShareEventParams', () => {
  it('記事・共有先・配置をGA4向けの固定キーに変換する', () => {
    expect(
      buildBlogShareEventParams({
        slug: 'small-internal-rag-without-vector-db',
        target: 'copy',
        position: 'footer',
      })
    ).toEqual({
      article_slug: 'small-internal-rag-without-vector-db',
      share_target: 'copy',
      share_position: 'footer',
    });
  });
});
