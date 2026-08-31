import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const source = (path: string) => {
  const absolutePath = resolve(root, path);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
};

const expectedSlugs = [
  'requirements-unclear',
  'ai-adoption',
  'business-systemization',
  'legacy-system-modernization',
  'internal-document-search',
  'customer-data-foundation',
  'stalled-project',
];

describe('situation LP decision content', () => {
  it('defines capabilities, strengths, case references, and deep-dive links for all seven LPs', () => {
    const content = source('src/data/situation-lp-content.ts');

    expect(content).not.toBe('');
    for (const slug of expectedSlugs) {
      expect(content).toContain(`'${slug}'`);
    }

    expect(content.match(/\n    capabilities:/g) ?? []).toHaveLength(expectedSlugs.length);
    expect(content.match(/\n    strengths:/g) ?? []).toHaveLength(expectedSlugs.length);
    expect(content.match(/\n    caseStudyRefs:/g) ?? []).toHaveLength(expectedSlugs.length);
    expect(content.match(/\n    deepDiveLinks:/g) ?? []).toHaveLength(expectedSlugs.length);
  });

  it('reuses verified service case studies instead of duplicating free-text claims', () => {
    const content = source('src/data/situation-lp-content.ts');

    expect(content).toContain("import { services } from '@/data/service';");
    expect(content).toContain('resolveSituationCaseStudies');
    expect(content).toContain('serviceId:');
    expect(content).toContain('caseIndex:');
    expect(content).not.toContain('challenge:');
    expect(content).not.toContain('solution:');
    expect(content).not.toContain('results:');
  });

  it('renders what Beekle can do, multiple cases, and situation-specific strengths before the consultation materials', () => {
    const page = source('src/pages/situations/[slug].astro');
    const component = source('src/components/situations/situation-decision-content.astro');

    expect(page).toContain('getSituationLpContent');
    expect(page).toContain('resolveSituationCaseStudies');
    expect(page).toContain('<SituationDecisionContent');
    expect(page.indexOf('<SituationDecisionContent')).toBeLessThan(
      page.indexOf('初回相談で返すもの')
    );

    expect(component).toContain('具体的にできること');
    expect(component).toContain('似た相談の実例');
    expect(component).toContain('この場面でBeekleが強い理由');
    expect(component).toContain('<ServiceCaseStudies');
    expect(component).toContain('content.capabilities.map');
    expect(component).toContain('content.strengths.map');
    expect(component).toContain('content.deepDiveLinks.map');
  });
});
