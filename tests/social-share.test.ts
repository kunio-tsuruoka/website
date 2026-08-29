import { describe, expect, it } from 'vitest';
import { buildSocialShareLinks } from '../src/lib/social-share.mjs';

describe('buildSocialShareLinks', () => {
  it('preserves Japanese titles and article URLs in each share destination', () => {
    const title = '小さな社内システムのRAGは、ベクトルDBから始めなくていい';
    const articleUrl = 'https://beekle.jp/blog/small-internal-rag-without-vector-db';

    const links = buildSocialShareLinks({ title, url: articleUrl });

    const x = new URL(links.x);
    expect(x.origin).toBe('https://twitter.com');
    expect(x.pathname).toBe('/intent/tweet');
    expect(x.searchParams.get('text')).toBe(title);
    expect(x.searchParams.get('url')).toBe(articleUrl);

    const linkedin = new URL(links.linkedin);
    expect(linkedin.origin).toBe('https://www.linkedin.com');
    expect(linkedin.pathname).toBe('/sharing/share-offsite/');
    expect(linkedin.searchParams.get('url')).toBe(articleUrl);

    const facebook = new URL(links.facebook);
    expect(facebook.origin).toBe('https://www.facebook.com');
    expect(facebook.pathname).toBe('/sharer/sharer.php');
    expect(facebook.searchParams.get('u')).toBe(articleUrl);
  });

  it('rejects non-http URLs so share buttons cannot emit unsafe schemes', () => {
    expect(() => buildSocialShareLinks({ title: '記事', url: 'javascript:alert(1)' })).toThrow(
      /http/i
    );
  });
});
