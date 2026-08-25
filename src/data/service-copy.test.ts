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

  it('uses customer-language CTA for the RAG service', () => {
    const config = aiServicePageConfig['rag-system-development'];

    expect(config.contactLabel).toBe('社内資料で、根拠付きAI検索ができるか相談する');
    expect(config.heroLead).toContain('社内資料');
    expect(config.heroLead).toContain('根拠付き');
  });

  it('keeps the AI development hero concise and outcome-led', () => {
    const config = aiServicePageConfig['ai-development'];

    expect(config.heroLead.length).toBeLessThanOrEqual(90);
    expect(config.heroLead).toContain('現場の仕事');
    expect(config.heroLead).toContain('削減時間');
  });
});
