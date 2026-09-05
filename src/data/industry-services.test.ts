import { describe, expect, it } from 'vitest';
import { industryPageConfig } from './industry-page-config';
import { industryServices } from './industry-services';
import { services } from './service';

const INDUSTRY_IDS = [
  'sales-data-coaching',
  'manufacturing-parts-knowledge-search',
  'technical-manual-knowledge-search',
  'internal-it-helpdesk-ai',
  'document-processing-automation',
];

// 依頼書の禁止事項: 抽象論・技術名だけの価値説明・架空数値
const FORBIDDEN = ['DXを加速', '最先端', '革新的', '業務変革', 'AIで業務効率化できます', '——'];

describe('industry service pages', () => {
  it('registers all five pages into services with matching hero config', () => {
    for (const id of INDUSTRY_IDS) {
      expect(
        services.find((s) => s.id === id),
        id
      ).toBeDefined();
      expect(industryPageConfig[id], id).toBeDefined();
      expect(industryPageConfig[id].contactIntent).toBe(id);
    }
    expect(industryServices.map((s) => s.id)).toEqual(INDUSTRY_IDS);
  });

  it('keeps the shared product design: requirements first, one task, measure, then expand', () => {
    for (const service of industryServices) {
      const config = industryPageConfig[service.id];
      const copy = JSON.stringify({ service, config });
      expect(copy, service.id).toContain('As-Is');
      expect(copy, service.id).toContain('受入条件');
      expect(copy, service.id).toContain('PM on Rails');
      expect(service.faq.length, service.id).toBeGreaterThanOrEqual(6);
      expect(
        service.additionalSections?.some((s) => s.title === '費用・期間の考え方'),
        service.id
      ).toBe(true);
      expect(
        service.additionalSections?.some((s) => s.title === '向いている会社、向いていない会社'),
        service.id
      ).toBe(true);
      for (const word of FORBIDDEN) {
        expect(copy, `${service.id} contains ${word}`).not.toContain(word);
      }
    }
  });

  it('does not send readers to free tools from these pages', () => {
    const copy = JSON.stringify({ industryServices, industryPageConfig });
    expect(copy).not.toContain('/tools/');
  });
});
