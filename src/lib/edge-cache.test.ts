import { describe, expect, it } from 'vitest';
import { resolveEdgeCacheKeyUrl } from './edge-cache';

describe('edge cache key', () => {
  it('separates cached HTML by Cloudflare Pages commit SHA', () => {
    const url = 'https://beekle.jp/';

    expect(resolveEdgeCacheKeyUrl(url, { CF_PAGES_COMMIT_SHA: 'old' })).not.toBe(
      resolveEdgeCacheKeyUrl(url, { CF_PAGES_COMMIT_SHA: 'new' })
    );
    expect(resolveEdgeCacheKeyUrl(url, { CF_PAGES_COMMIT_SHA: '236a569' })).toContain(
      '__edge_deploy=236a569'
    );
  });

  it('keeps the public URL unchanged when deployment metadata is unavailable', () => {
    expect(resolveEdgeCacheKeyUrl('https://beekle.jp/?v=preview')).toBe(
      'https://beekle.jp/?v=preview'
    );
  });
});
