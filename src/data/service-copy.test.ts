import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
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

  it('presents RAG as a procurement-ready service in the required order', () => {
    const config = aiServicePageConfig['rag-system-development'];
    const service = services.find((item) => item.id === 'rag-system-development');
    const definition =
      '株式会社Beekleは、社内文書や業務データを安全に活用したい企業向けに、RAG・ハイブリッド検索・GraphRAGを、オンプレミス、閉域網、ローカルLLM、クラウドのセキュリティ要件に合わせて構築する開発会社です。';

    expect(service).toBeDefined();
    expect(service?.title).toBe('RAGシステム構築・GraphRAG開発');
    expect(service?.description).toBe(definition);
    expect(config.headline).toBe('RAGシステム構築・GraphRAG開発');
    expect(config.heroLead).toBe(definition);
    expect(config.contactLabel).toBe('自社環境でのRAG構築を相談する');
    expect(config.showZeroStartLink).toBe(false);
    expect(service?.seoTitle).toContain('オンプレ');
    expect(service?.seoTitle).toContain('ローカルLLM');

    const pageSource = readFileSync(
      fileURLToPath(new URL('../pages/services/[id].astro', import.meta.url)),
      'utf8'
    );
    const deploymentSource = readFileSync(
      fileURLToPath(
        new URL('../components/services/service-rag-deployment-modes.astro', import.meta.url)
      ),
      'utf8'
    );
    const pricingSource = readFileSync(
      fileURLToPath(new URL('../components/services/service-rag-pricing.astro', import.meta.url)),
      'utf8'
    );

    const heroIndex = pageSource.indexOf('<ServiceHero');
    const deploymentIndex = pageSource.indexOf('<ServiceRagDeploymentModes');
    const painPointsIndex = pageSource.indexOf('<ServicePainPoints');

    expect(heroIndex).toBeGreaterThan(-1);
    expect(deploymentIndex).toBeGreaterThan(heroIndex);
    expect(painPointsIndex).toBeGreaterThan(deploymentIndex);
    expect(deploymentSource).toContain(
      'オンプレミス・閉域網・ローカルLLM・クラウドのRAG構築に対応'
    );
    expect(deploymentSource).toContain('Azure OpenAI');
    expect(deploymentSource).toContain('AWS Bedrock');
    expect(deploymentSource).toContain('data-cta-source');
    expect(deploymentSource).toContain('data-cta-id');

    expect(service?.painPoints.map((item) => item.title)).toEqual([
      '社内文書検索',
      '属人化・暗黙知の継承',
      '問い合わせ対応の効率化',
      '要件・設計判断・変更影響の追跡',
    ]);

    const faqCopy = service?.faq.map((item) => `${item.question}${item.answer}`).join('') ?? '';
    for (const term of [
      'オンプレミス',
      '閉域網',
      'ローカルLLM',
      'Azure OpenAI',
      'Neo4j',
      '精度改善',
      'アクセス権',
      '費用',
    ]) {
      expect(faqCopy).toContain(term);
    }

    expect(pricingSource).toContain('50万〜300万円');
    expect(pricingSource).toContain('200万〜600万円');
    expect(pricingSource).toContain('500万〜1,500万円');
    expect(pricingSource).toContain('月20万〜100万円');
    expect(pricingSource).toContain('data-cta-source');
    expect(pricingSource).toContain('data-cta-id');

    const additionalSectionCopy =
      service?.additionalSections?.map((section) => section.title).join('') ?? '';
    expect(additionalSectionCopy).not.toContain('RAGで十分か');
    expect(additionalSectionCopy).not.toContain('なぜ「先に用途を決める」');

    const fullCopy = JSON.stringify({ service, config, deploymentSource, pricingSource });
    expect(fullCopy).not.toContain('ナレナレサポート');
    expect(fullCopy).not.toContain('一般的には');
    expect(fullCopy).not.toContain('と言われています');
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
