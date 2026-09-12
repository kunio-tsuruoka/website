import { describe, expect, it } from 'vitest';
import { getCategoryCta } from './column-cta-mapping';

describe('getCategoryCta: 仕様・要件定義ノウハウの記事末CTA', () => {
  const specSlugs = [
    'gherkin-bdd-introduction',
    'spec-driven-development',
    'ai-development-dor-gherkin',
    'user-story-template-examples',
    'ai-agent-gherkin-evidence',
  ];

  it('主動線が PM on Rails ウェイトリスト（外部）、副動線が協業相談になる', () => {
    for (const slug of specSlugs) {
      const cta = getCategoryCta('knowledge', slug);
      expect(cta.primary.href).toMatch(
        /^https:\/\/pmonrails\.com\/waitlist\?utm_source=beekle\.jp/
      );
      expect(cta.primary.external).toBe(true);
      expect(cta.primary.ctaId).toBe('pm-on-rails-waitlist');
      expect(cta.secondary?.href).toBe('/contact?intent=partner');
    }
  });

  it('カテゴリが何であってもスラッグ指定が優先される（移動前後で同じCTA）', () => {
    expect(getCategoryCta('project-management', 'user-story-template-examples').primary.ctaId).toBe(
      'pm-on-rails-waitlist'
    );
  });

  it('RAG/GraphRAG 系の knowledge 記事は既定（相談）のまま', () => {
    for (const slug of [
      'graphrag-knowledge-search',
      'neo4j-multitenant-security',
      'rag-evaluation',
    ]) {
      const cta = getCategoryCta('knowledge', slug);
      expect(cta.primary.href).toMatch(/^\/contact/);
      expect(cta.primary.external).toBeUndefined();
    }
  });

  it('買い手向けの要件定義記事は PM on Rails にしない', () => {
    for (const slug of [
      'requirements-definition-complete-guide',
      'requirements-definition-template',
      'requirements-vs-requests',
      'scenario-test-cost-reduction',
    ]) {
      expect(getCategoryCta('project-management', slug).primary.href).toMatch(/^\/contact/);
    }
  });
});
