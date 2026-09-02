import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { services } from '@/data/service';
import { situationLpContents } from '@/data/situation-lp-content';

const root = process.cwd();
const source = (path: string) => {
  const absolutePath = resolve(root, path);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
};

const situationRefs = (slug: string) =>
  situationLpContents.find((content) => content.slug === slug)?.caseStudyRefs;

describe('LLMO LP consistency', () => {
  it('uses situation-specific proof instead of the shared helpdesk case', () => {
    expect(situationRefs('requirements-unclear')).toEqual([
      { serviceId: 'requirements-definition-support', caseIndex: 0 },
      { serviceId: 'mvp-poc-development', caseIndex: 0 },
      { serviceId: 'web-mobile-development', caseIndex: 2 },
    ]);
    expect(situationRefs('business-systemization')).toEqual([
      { serviceId: 'web-mobile-development', caseIndex: 2 },
      { serviceId: 'web-mobile-development', caseIndex: 3 },
      { serviceId: 'requirements-definition-support', caseIndex: 0 },
    ]);
    expect(situationRefs('customer-data-foundation')).toEqual([
      { serviceId: 'cdp-development', caseIndex: 0 },
      { serviceId: 'cdp-development', caseIndex: 1 },
      { serviceId: 'cdp-development', caseIndex: 2 },
    ]);
    expect(situationRefs('ai-adoption')).toContainEqual({
      serviceId: 'ai-development',
      caseIndex: 0,
    });
  });

  it('states the conditions under which an AI agent can avoid existing-system changes', () => {
    const service = services.find((item) => item.id === 'ai-agent-development');
    const faq = service?.faq.find((item) =>
      item.question.includes('既存のシステムを改修する必要')
    );

    expect(faq?.answer).not.toContain('基本的に既存システムの改修は不要');
    expect(faq?.answer).toContain('APIや認証方式');
    expect(faq?.answer).toContain('ネットワーク');
    expect(faq?.answer).toContain('権限');
    expect(faq?.answer).toContain('監査要件');
  });

  it('makes the AI development page an explicit hub for specialist service pages', () => {
    const overview = source('src/components/services/ai-development-overview.astro');

    expect(overview).toContain('生成AI開発の総合案内');
    expect(overview).toContain("href: '/services/rag-system-development'");
    expect(overview).toContain("href: '/services/ocr-ai-development'");
    expect(overview).toContain("href: '/services/ai-agent-development'");
    expect(overview).toContain("href: '/services/management-dx'");
    expect(overview).toContain('専門ページで詳しく見る');
  });

  it('places management-DX-specific proof on the management DX service page', () => {
    const servicePage = source('src/components/services/ai-dx-service-page.astro');
    const evidence = source('src/components/services/management-dx-evidence.astro');

    expect(servicePage).toContain("import ManagementDxEvidence from './management-dx-evidence.astro'");
    expect(servicePage).toContain("{mode === 'management-dx' && <ManagementDxEvidence />}");
    expect(evidence).toContain('経営判断につないだ実績');
    expect(evidence).toContain('ECサイトの顧客データ基盤構築');
    expect(evidence).toContain('SaaSスタートアップの売上分析基盤構築');
    expect(evidence).toContain('サブスク課金型マッチングサービス');
    expect(evidence).toContain('/services/cdp-development');
  });

  it('normalizes the Beekle suffix instead of rendering duplicated page titles', () => {
    const layout = source('src/layouts/layout.astro');
    const titleHelper = source('src/lib/seo-title.ts');

    expect(layout).toContain("import { normalizeBeeklePageTitle } from '@/lib/seo-title'");
    expect(layout).toContain('normalizeBeeklePageTitle(title)');
    expect(titleHelper).toContain('export const normalizeBeeklePageTitle');
    expect(titleHelper).toContain("return `${withoutBrandSuffix} | Beekle`");
  });
});
