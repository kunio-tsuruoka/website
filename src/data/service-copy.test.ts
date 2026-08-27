import { describe, expect, it } from 'vitest';
import { aiServicePageConfig } from './ai-service-page-config';
import { services } from './service';

describe('service page copy', () => {
  it('keeps web-mobile development scoped to both web and mobile', () => {
    const service = services.find((item) => item.id === 'web-mobile-development');

    expect(service?.title).toBe('Web・モバイルアプリ開発');
    expect(service?.description).toContain('Webアプリ');
    expect(service?.description).toContain('モバイルアプリ');
    expect(service?.solutions[0]?.results).toContain('伝言ゲームを減らせる');
    expect(service?.solutions[0]?.results).toContain('追加開発でも壊れにくい');
  });

  it('turns the RAG hero and comparison into an evidence-based architecture consultation', () => {
    const config = aiServicePageConfig['rag-system-development'];
    const service = services.find((item) => item.id === 'rag-system-development');
    const comparison = service?.additionalSections?.find((section) =>
      section.title.includes('RAGで十分か')
    );
    const comparisonCopy = comparison?.paragraphs.join('');
    const updateFaq = service?.faq.find((item) => item.question.includes('更新頻度'));
    const requirementsCase = service?.caseStudies.find((item) =>
      item.title.includes('要件管理システム')
    );

    expect(config.contactLabel).toBe('自社のデータでRAGが成立するか相談する');
    expect(config.showZeroStartLink).toBe(false);
    expect(config.heroLead).toContain('社内資料');
    expect(config.heroLead).toContain('根拠付き');
    expect(comparisonCopy).toContain('通常RAG');
    expect(comparisonCopy).toContain('GraphRAG');
    expect(comparisonCopy).toContain('検索ノイズ');
    expect(comparisonCopy).toContain('正本');
    expect(comparisonCopy).toContain('更新');
    expect(comparisonCopy).toContain('ハイブリッド');
    expect(comparisonCopy).toContain('PM on Rails');
    expect(comparisonCopy).toContain('NDA');
    expect(comparisonCopy).toContain('実データ');
    expect(comparisonCopy).toContain('Beekleが判断');
    expect(comparison).toMatchObject({ placement: 'middle' });
    expect(updateFaq?.answer).toContain('正本');
    expect(updateFaq?.answer).toContain('派生');
    expect(updateFaq?.answer).toContain('許容');
    expect(updateFaq?.answer).toContain('ドリフト');
    expect(`${requirementsCase?.solution}${requirementsCase?.whyUs}`).toContain('正本');
    expect(`${requirementsCase?.solution}${requirementsCase?.whyUs}`).toContain('複製せず');
  });

  it('keeps the AI development hero concise and outcome-led', () => {
    const config = aiServicePageConfig['ai-development'];

    expect(config.heroLead.length).toBeLessThanOrEqual(90);
    expect(config.heroLead).toContain('現場の仕事');
    expect(config.heroLead).toContain('削減時間');
  });

  it('centers requirements definition support on PM on Rails instead of free tools', () => {
    const service = services.find((item) => item.id === 'requirements-definition-support');
    const config = aiServicePageConfig['requirements-definition-support'];
    const pageCopy = JSON.stringify({ service, config });

    expect(service).toBeDefined();
    expect(pageCopy).not.toContain('無料ツール');
    expect(pageCopy).not.toContain('/tools/flow-mapper');
    expect(pageCopy).not.toContain('/tools/story-builder');
    expect(pageCopy).not.toContain('/tools/scope-manager');
    expect(pageCopy).not.toContain('/tools/rfp-builder');
    expect(service?.seoDescription).toContain('PM on Rails');
    expect(service?.solutions.some((item) => item.title.includes('PM on Rails'))).toBe(true);
    expect(service?.faq.some((item) => item.question.includes('PM on Rails'))).toBe(true);
    expect(config.headline).toContain('PM on Rails');
    expect(config.rtb.title).toContain('PM on Rails');
    expect(config.rtb.items.length).toBeGreaterThanOrEqual(4);
    expect(config.rtb.note?.title).toContain('PM on Rails');
    expect(config.flow.title).toContain('実装につながる仕様');
  });
});
