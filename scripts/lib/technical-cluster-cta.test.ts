import { describe, expect, it } from 'vitest';
import { buildPmOnRailsCta, replaceTechnicalClusterCta } from './technical-cluster-cta.mjs';

describe('technical cluster PM on Rails CTA migration', () => {
  it('builds a tracked PM on Rails CTA for the article slug', () => {
    const result = buildPmOnRailsCta('gherkin-bdd-introduction');

    expect(result).toContain('https://pmonrails.com/');
    expect(result).toContain('utm_campaign=technical_cluster');
    expect(result).toContain('utm_content=gherkin-bdd-introduction');
    expect(result).toContain('PM on Railsを見る');
    expect(result).not.toContain('/contact');
    expect(result).not.toContain('/prooffirst');
  });

  it('replaces an existing BRIDGE_CTA marker before checking old hardcoded CTA patterns', () => {
    const source = '<p>本文</p><p>{{BRIDGE_CTA}}</p>';
    const result = replaceTechnicalClusterCta(source, /never-match/, 'ears-gherkin-workflow');

    expect(result.status).toBe('bridge-marker');
    expect(result.content).toContain('https://pmonrails.com/');
    expect(result.content).not.toContain('{{BRIDGE_CTA}}');
  });

  it('replaces legacy hardcoded CTAs when the bridge marker is absent', () => {
    const source = '<p>本文</p><h2>相談</h2><p><a href="/contact">相談する</a></p>';
    const result = replaceTechnicalClusterCta(
      source,
      /<h2>相談<\/h2><p><a href="\/contact">相談する<\/a><\/p>/,
      'ears-requirements-syntax-guide'
    );

    expect(result.status).toBe('hardcoded-cta');
    expect(result.content).toContain('https://pmonrails.com/');
    expect(result.content).not.toContain('/contact');
  });
});
