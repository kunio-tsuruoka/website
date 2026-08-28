import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Header } from '@/components/header';
import {
  consultationSituations,
  featuredConsultationSituations,
} from '@/data/consultation-situations';
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
  'legacy-system-modernization',
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

  it('adds legacy system modernization to the consultation hub and home cards', () => {
    const situation = consultationSituations.find(
      (item) => item.slug === 'legacy-system-modernization'
    );

    expect(situation).toMatchObject({
      href: '/situations/legacy-system-modernization',
      navLabel: '古いシステムをコスパよく刷新したい',
      title: '古いシステムを、必要な機能だけ次へ移す。',
    });
    expect(situation?.returnMaterials.map((item) => item.title)).toEqual([
      '現行仕様マップ',
      '刷新スコープ',
      '移行計画と概算レンジ',
    ]);
    expect(featuredConsultationSituations.map((item) => item.slug)).toContain(
      'legacy-system-modernization'
    );
  });

  it('keeps buyer-facing situation copy free of internal CEP/RTB jargon', () => {
    const indexPage = readSource('src/pages/situations/index.astro');
    const detailPage = readSource('src/pages/situations/[slug].astro');
    const home = readSource('src/pages/index.astro');
    const data = readSource('src/data/consultation-situations.ts');

    expect(indexPage).not.toContain('CEP別RTB');
    expect(indexPage).not.toContain('CEP INDEX');
    expect(indexPage).not.toContain('自分の状況に近い入口');
    expect(indexPage).not.toContain('CEP別に');
    expect(detailPage).not.toContain('03 RTB');
    expect(home).not.toContain('各入口で');
    expect(data).not.toContain('各CEPごとに');
  });

  it('defines each situation with buyer-sided judgment language and contextual proof', () => {
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

    for (const slug of situationSlugs) {
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
