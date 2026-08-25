import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Header } from '@/components/header';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const pathFor = (relativePath: string) => resolve(root, relativePath);
const readSource = (relativePath: string) => readFileSync(pathFor(relativePath), 'utf8');

const situationSlugs = [
  'requirements-unclear',
  'ai-adoption',
  'business-systemization',
  'internal-document-search',
  'customer-data-foundation',
  'stalled-project',
];

describe('consultation situation IA', () => {
  it('adds a CEP hub and detail route for consultation situations', () => {
    expect(existsSync(pathFor('src/data/consultation-situations.ts'))).toBe(true);
    expect(existsSync(pathFor('src/pages/situations/index.astro'))).toBe(true);
    expect(existsSync(pathFor('src/pages/situations/[slug].astro'))).toBe(true);
  });

  it('defines each CEP with buyer-sided judgment language and contextual RTB', () => {
    const source = readSource('src/data/consultation-situations.ts');

    for (const slug of situationSlugs) {
      expect(source).toContain(`slug: '${slug}'`);
      expect(source).toContain(`href: '/situations/${slug}'`);
    }

    expect(source).toContain('相談が始まる場面');
    expect(source).toContain('判断材料');
    expect(source).toContain('見送り条件');
    expect(source).toContain('成果物サンプル');
    expect(source).toContain('実案件ログ');
    expect(source).toContain('次に確認すること');
    expect(source).not.toContain('Go / No-Go');
    expect(source).not.toContain('進むか止める');
  });

  it('routes the home consultation section and problem navigation through CEP pages', () => {
    const home = readSource('src/pages/index.astro');
    const headerHtml = renderToStaticMarkup(createElement(Header));

    for (const slug of situationSlugs.slice(0, 5)) {
      expect(headerHtml).toContain(`href="/situations/${slug}"`);
    }

    expect(home).toContain('featuredConsultationSituations');
    expect(home).toContain('/situations');
    expect(home).toContain('場面別に判断材料を見る');
    expect(headerHtml).toContain('相談が始まる場面一覧');
    expect(headerHtml).toContain('href="/situations"');
    expect(home).not.toContain('href="/services/mvp-poc-development" class="group block"');
    expect(home).not.toContain('href="/services/ai-adoption" class="group block"');
  });
});
