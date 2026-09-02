import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('RAG service procurement page', () => {
  it('renders a dedicated service route in procurement-decision order', () => {
    const page = readSource('src/pages/services/rag-system-development.astro');
    const sections = [
      '<ServiceHero',
      '<ServiceRagDeploymentModes',
      '<ServicePainPoints',
      '<ServiceWhyBeekle',
      '<ServiceCaseStudies',
      '<ServiceSolutions',
      '<ServiceFeatures',
      '<ServiceRagPricing',
      '<ServiceFaq',
    ];
    const positions = sections.map((section) => page.indexOf(section));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
    expect(page).not.toContain('<ServiceRootCause');
    expect(page).not.toContain('<ServiceBusinessFlow');
    expect(page).not.toContain('<ServiceAdditionalSections');
  });

  it('reuses canonical, Service JSON-LD, FAQ JSON-LD and CTA tracking', () => {
    const page = readSource('src/pages/services/rag-system-development.astro');

    expect(page).toContain("const serviceUrl = `${siteUrl}/services/rag-system-development`");
    expect(page).toContain('canonical={serviceUrl}');
    expect(page).toContain('type="service"');
    expect(page).toContain('serviceDescription: service.description');
    expect(page).toContain('type="faq"');
    expect(page).toContain('faqs: service.faq.map');
    expect(page).toContain('data-cta-source="services-rag-system-development-final"');
    expect(page).toContain('data-cta-id="contact-rag-system-development"');
    expect(page).not.toContain('ナレナレ');
  });

  it('shows the approved price ranges with a separately measurable CTA', () => {
    const pricing = readSource('src/components/services/service-rag-pricing.astro');

    expect(pricing).toContain('ragPricingPhases.map');
    expect(pricing).toContain('RAG構築の費用目安');
    expect(pricing).toContain('data-cta-source="services-rag-system-development-pricing"');
    expect(pricing).toContain('data-cta-id="contact-rag-system-development"');
  });

  it('links explanations out instead of repeating them on the service page', () => {
    const page = readSource('src/pages/services/rag-system-development.astro');

    expect(page).toContain('/column/what-is-rag');
    expect(page).toContain('/column/ai-rag-accuracy-graphrag');
    expect(page).toContain('/knowledge/graphrag-knowledge-search');
    expect(page).toContain('/column/eliminate-work-attribution');
  });
});
