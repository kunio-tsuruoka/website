import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { resolveSituationCaseStudies, situationLpContents } from '@/data/situation-lp-content';
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
    expect(situationLpContents.map((content) => content.slug)).toEqual(expectedSlugs);

    for (const content of situationLpContents) {
      expect(content.capabilities).toHaveLength(4);
      expect(content.strengths).toHaveLength(3);
      expect(content.deepDiveLinks).toHaveLength(2);
    }
  });

  it('resolves three verified service case studies per LP instead of duplicating free-text claims', () => {
    const contentSource = source('src/data/situation-lp-content.ts');

    for (const content of situationLpContents) {
      expect(resolveSituationCaseStudies(content)).toHaveLength(3);
    }

    expect(contentSource).toContain("import { services } from '@/data/service';");
    expect(contentSource).not.toContain('challenge:');
    expect(contentSource).not.toContain('solution:');
    expect(contentSource).not.toContain('results:');
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
