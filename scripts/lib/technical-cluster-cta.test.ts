import { describe, expect, it } from 'vitest';
import { buildPmOnRailsCta, replaceTechnicalClusterCta } from './technical-cluster-cta.mjs';

describe('technical cluster PM on Rails CTA migration', () => {
  it('builds the approved candid waitlist CTA copy', () => {
    const result = buildPmOnRailsCta('gherkin-bdd-introduction');

    expect(result).toContain('https://pmonrails.com/waitlist?');
    expect(result).toContain('utm_campaign=technical_cluster');
    expect(result).toContain('utm_content=gherkin-bdd-introduction');
    expect(result).toContain('私たちも、実案件でこれらを全部手書きしたり、レビューしたりするのが大変だったので');
    expect(result).toContain('「PM on Rails」というシステムを作りました');
    expect(result).toContain('お客さまの要望からコーディングまで自動でつなげられるように');
    expect(result).toContain('要件やGherkinをベストプラクティスに沿って生成してくれます');
    expect(result).toContain('宣伝抜きで、かなり良いものができたと思っています');
    expect(result).toContain('現在はベータ版');
    expect(result).toContain('そろそろ一般公開する予定');
    expect(result).toContain('ウェイティングリストに登録しておいてください');
    expect(result).toContain('ウェイティングリストに登録する');
    expect(result).not.toContain('/contact');
    expect(result).not.toContain('/prooffirst');
  });

  it('replaces an existing BRIDGE_CTA marker before checking old hardcoded CTA patterns', () => {
    const source = '<p>本文</p><p>{{BRIDGE_CTA}}</p>';
    const result = replaceTechnicalClusterCta(source, /never-match/, 'ears-gherkin-workflow');

    expect(result.status).toBe('bridge-marker');
    expect(result.content).toContain('https://pmonrails.com/waitlist?');
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
    expect(result.content).toContain('https://pmonrails.com/waitlist?');
    expect(result.content).not.toContain('/contact');
  });
});
