import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf8');

describe('AI導入・経営DX支援', () => {
  it('serves two buyer-specific entry pages from one shared service component', () => {
    const aiAdoption = readSource('../pages/services/ai-adoption.astro');
    const managementDx = readSource('../pages/services/management-dx.astro');

    expect(aiAdoption).toContain('<AiDxServicePage mode="ai-adoption" />');
    expect(managementDx).toContain('<AiDxServicePage mode="management-dx" />');
  });

  it('publishes implementation-backed plans at market-aligned prices', () => {
    const servicePage = readSource('../components/services/ai-dx-service-page.astro');

    expect(servicePage).toContain("name: 'AI・経営DX診断'");
    expect(servicePage).toContain("price: '400,000'");
    expect(servicePage).toContain("name: 'AI導入・経営DX伴走'");
    expect(servicePage).toContain("price: '800,000'");
    expect(servicePage).toContain("name: 'AI・DX推進室'");
    expect(servicePage).toContain("price: '1,200,000'");
    expect(servicePage).not.toContain("price: '100,000'");
    expect(servicePage).not.toContain("price: '160,000'");
    expect(servicePage).not.toContain("price: '320,000'");
  });

  it('separates recurring accompaniment from unlimited production development', () => {
    const servicePage = readSource('../components/services/ai-dx-service-page.astro');

    expect(servicePage).toContain('本番開発費');
    expect(servicePage).toContain('クラウド・外部サービス利用料');
    expect(servicePage).toContain('別途見積もり');
  });

  it('makes the management DX entry discoverable across navigation and AI references', () => {
    const header = readSource('../components/header.tsx');
    const footer = readSource('../components/footer.astro');
    const sitemap = readSource('../pages/sitemap.xml.ts');
    const llms = readSource('../../public/llms.txt');
    const llmsFull = readSource('../pages/llms-full.txt.ts');

    expect(header).toContain(
      "{ label: '経営DX・AI導入支援', href: '/services/management-dx' }"
    );
    expect(footer).toContain(
      "{ label: '経営DX・AI導入支援', href: '/services/management-dx' }"
    );
    expect(footer).toContain("{ label: 'AI導入支援', href: '/services/ai-adoption' }");
    expect(sitemap).toContain("{ url: '/services/management-dx'");
    expect(llms).toContain(
      '/services/management-dx - 経営DX・AI導入支援（価格公開）'
    );
    expect(llmsFull).toContain('AI・経営DX診断 400,000円');
    expect(llmsFull).toContain('AI導入・経営DX伴走 800,000円 月〜');
    expect(llmsFull).toContain('AI・DX推進室 1,200,000円 月〜');
  });
});