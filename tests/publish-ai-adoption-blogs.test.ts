import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as publisher from '../scripts/publish-ai-adoption-blogs.mjs';

const { POSTS, validatePosts } = publisher;

describe('AI導入ブログ公開データ', () => {
  it('経営者向けと担当者向けの2本を持つ', () => {
    expect(POSTS).toHaveLength(2);
    expect(POSTS.map((post) => post.id)).toEqual([
      'ai-adoption-management-led',
      'ai-adoption-person-in-charge',
    ]);
  });

  it('公開に必要な項目と本文品質を満たす', () => {
    expect(() => validatePosts(POSTS)).not.toThrow();

    for (const post of POSTS) {
      expect(post.title.length).toBeGreaterThan(15);
      expect(post.description.length).toBeGreaterThanOrEqual(70);
      expect(post.description.length).toBeLessThanOrEqual(130);
      expect(post.content).not.toContain('<h1');
      expect(post.content.length).toBeGreaterThan(3_000);
    }
  });

  it('2本が相互に参照し、担当者向け記事がBeekleの仕事を語る', () => {
    const management = POSTS[0];
    const operator = POSTS[1];

    expect(management.content).toContain('/blog/ai-adoption-person-in-charge');
    expect(operator.content).toContain('/blog/ai-adoption-management-led');
    expect(operator.content).toContain('自分は経営者であり、エンジニアでもあります');
    expect(operator.content).toContain('何でも放り投げてください');
    expect(operator.content).toContain('会社そのものが学習し、判断し、改善できる状態');
  });

  it('Cloudflare Pagesの本番ブランチだけで公開処理を許可する', () => {
    const productionGuard = (
      publisher as unknown as {
        shouldPublishOnProductionBuild?: (environment: Record<string, string | undefined>) => boolean;
      }
    ).shouldPublishOnProductionBuild;

    expect(productionGuard).toBeTypeOf('function');
    if (!productionGuard) return;

    expect(productionGuard({ CF_PAGES: '1', CF_PAGES_BRANCH: 'main' })).toBe(true);
    expect(productionGuard({ CF_PAGES: '1', CF_PAGES_BRANCH: 'preview' })).toBe(false);
    expect(productionGuard({ CF_PAGES_BRANCH: 'main' })).toBe(false);
    expect(productionGuard({})).toBe(false);
  });

  it('本番ビルドが公開ガードを実行する', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: { build?: string };
    };

    expect(packageJson.scripts?.build).toContain(
      'scripts/publish-ai-adoption-blogs.mjs --apply-on-production-build'
    );
  });
});
