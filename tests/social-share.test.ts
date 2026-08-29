import { describe, expect, it } from 'vitest';
import * as socialShare from '../src/lib/social-share.mjs';

const { buildSocialShareLinks } = socialShare;
const title = 'AI受託開発とは？';
const articleUrl = 'https://beekle.jp/column/ai-development-guide';

function expectTrackedArticleUrl(value: string | null, source: string): void {
  expect(value).not.toBeNull();
  const trackedUrl = new URL(value as string);
  expect(trackedUrl.origin + trackedUrl.pathname).toBe(articleUrl);
  expect(trackedUrl.searchParams.get('utm_source')).toBe(source);
  expect(trackedUrl.searchParams.get('utm_medium')).toBe('social');
  expect(trackedUrl.searchParams.get('utm_campaign')).toBe('column_share');
}

describe('buildSocialShareLinks', () => {
  it('Xへコラムタイトルと計測可能なURLを渡す', () => {
    const shareUrl = new URL(buildSocialShareLinks({ title, url: articleUrl }).x);

    expect(shareUrl.origin + shareUrl.pathname).toBe('https://x.com/intent/tweet');
    expect(shareUrl.searchParams.get('text')).toBe(title);
    expectTrackedArticleUrl(shareUrl.searchParams.get('url'), 'x');
  });

  it('LinkedInへ計測可能なコラムURLを渡す', () => {
    const shareUrl = new URL(buildSocialShareLinks({ title, url: articleUrl }).linkedin);

    expect(shareUrl.origin + shareUrl.pathname).toBe(
      'https://www.linkedin.com/sharing/share-offsite/'
    );
    expectTrackedArticleUrl(shareUrl.searchParams.get('url'), 'linkedin');
  });

  it('LINEへコラムタイトルと計測可能なURLを渡す', () => {
    const shareUrl = new URL(buildSocialShareLinks({ title, url: articleUrl }).line);

    expect(shareUrl.origin + shareUrl.pathname).toBe('https://social-plugins.line.me/lineit/share');
    expect(shareUrl.searchParams.get('text')).toBe(title);
    expectTrackedArticleUrl(shareUrl.searchParams.get('url'), 'line');
  });

  it('安全でないURLスキームを拒否する', () => {
    expect(() => buildSocialShareLinks({ title: '記事', url: 'javascript:alert(1)' })).toThrow(
      /http/i
    );
  });
});

describe('buildSocialShareEventParams', () => {
  it('GA4の推奨shareイベント向けの項目へ変換する', () => {
    const eventBuilder = Reflect.get(socialShare, 'buildSocialShareEventParams');

    expect(eventBuilder).toBeTypeOf('function');
    if (typeof eventBuilder !== 'function') return;

    expect(
      eventBuilder({
        slug: 'ai-development-guide',
        target: 'copy',
        placement: 'footer',
      })
    ).toEqual({
      method: 'copy',
      content_type: 'column_article',
      item_id: 'ai-development-guide',
      share_position: 'footer',
    });
  });
});
