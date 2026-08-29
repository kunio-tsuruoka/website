import { describe, expect, it } from 'vitest';
import { buildColumnShareEventParams, buildColumnShareLinks } from './column-share';

const title = 'AI受託開発とは？';
const url = 'https://beekle.jp/column/ai-development-guide';

function expectTrackedArticleUrl(value: string | null, source: string): void {
  expect(value).not.toBeNull();
  const trackedUrl = new URL(value as string);
  expect(trackedUrl.origin + trackedUrl.pathname).toBe(url);
  expect(trackedUrl.searchParams.get('utm_source')).toBe(source);
  expect(trackedUrl.searchParams.get('utm_medium')).toBe('social');
  expect(trackedUrl.searchParams.get('utm_campaign')).toBe('column_share');
}

describe('buildColumnShareLinks', () => {
  it('Xへ記事タイトルと計測可能なURLを渡す', () => {
    const shareUrl = new URL(buildColumnShareLinks({ title, url }).x);

    expect(shareUrl.origin + shareUrl.pathname).toBe('https://x.com/intent/tweet');
    expect(shareUrl.searchParams.get('text')).toBe(title);
    expectTrackedArticleUrl(shareUrl.searchParams.get('url'), 'x');
  });

  it('LinkedInへ計測可能な記事URLを渡す', () => {
    const shareUrl = new URL(buildColumnShareLinks({ title, url }).linkedin);

    expect(shareUrl.origin + shareUrl.pathname).toBe(
      'https://www.linkedin.com/sharing/share-offsite/'
    );
    expectTrackedArticleUrl(shareUrl.searchParams.get('url'), 'linkedin');
  });

  it('LINEへ記事タイトルと計測可能なURLを渡す', () => {
    const shareUrl = new URL(buildColumnShareLinks({ title, url }).line);

    expect(shareUrl.origin + shareUrl.pathname).toBe('https://social-plugins.line.me/lineit/share');
    expect(shareUrl.searchParams.get('text')).toBe(title);
    expectTrackedArticleUrl(shareUrl.searchParams.get('url'), 'line');
  });
});

describe('buildColumnShareEventParams', () => {
  it('GA4の推奨shareイベント向けの項目へ変換する', () => {
    expect(
      buildColumnShareEventParams({
        slug: 'ai-development-guide',
        target: 'copy',
        position: 'footer',
      })
    ).toEqual({
      method: 'copy',
      content_type: 'column_article',
      item_id: 'ai-development-guide',
      share_position: 'footer',
    });
  });
});
