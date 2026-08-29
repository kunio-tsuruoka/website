import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('..', import.meta.url));
const authorByline = readFileSync(`${root}/src/components/seo/author-byline.astro`, 'utf8');
const shareComponent = readFileSync(
  `${root}/src/components/blog/social-share-buttons.astro`,
  'utf8'
);

describe('column article social sharing placement', () => {
  it('コラム詳細のタイトル下と読了後に共有導線を出す', () => {
    expect(authorByline).toContain('isColumnArticlePath');
    expect(authorByline).toContain('placement="header"');
    expect(authorByline).toContain('placement="footer"');
  });

  it('ブログでは表示せず、コラム用の共有操作と計測を備える', () => {
    expect(shareComponent).toContain('data-column-share');
    expect(shareComponent).toContain('isColumnArticlePath');
    expect(shareComponent).toContain('buildSocialShareLinks');
    expect(shareComponent).toContain('buildSocialShareEventParams');
    expect(shareComponent).toContain('navigator.share');
    expect(shareComponent).toContain('data-share-platform="line"');
  });
});
