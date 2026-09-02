import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf8');
const sourceRoots = ['src/pages', 'src/components', 'src/features', 'src/styles', 'src/lib'];
const sourceExtensions = new Set(['.astro', '.css', '.ts', '.tsx']);
const listSourceFiles = (dir: string): string[] => {
  return readdirSync(dir).flatMap((entry) => {
    const child = path.join(dir, entry);
    if (statSync(child).isDirectory()) return listSourceFiles(child);
    if (entry.includes('.test.')) return [];
    return sourceExtensions.has(path.extname(entry)) ? [child] : [];
  });
};
const allSourceFiles = () =>
  sourceRoots.flatMap((root) => listSourceFiles(path.join(process.cwd(), root)));
const pageHeroBlock = (source: string) => {
  const start = source.indexOf('<PageHero');
  const end = source.indexOf('</PageHero>', start);

  return start >= 0 && end >= 0 ? source.slice(start, end) : '';
};

describe('site-wide editorial design foundations', () => {
  it('renders shared page heroes as editorial headers, not purple poster blocks', () => {
    const html = renderToStaticMarkup(
      <PageHero
        title="資料・判断材料"
        subtitle="検討段階に合わせて必要な材料へ案内します。"
        badge="判断材料"
      />
    );

    expect(html).toContain('border-b border-neutral-300 bg-neutral-100');
    expect(html).toContain('border-l-8 border-primary-500');
    expect(html).toContain('text-accent-950');
    expect(html).toContain('text-neutral-700');
    expect(html).not.toContain('relative bg-primary-500 py-20');
    expect(html).not.toContain('bg-grid-pattern');
    expect(html).not.toContain('text-white');
    expect(html).not.toContain('bg-white/20');
  });

  it('keeps shared sections layered with neutral surfaces instead of decorative gradients', () => {
    const lightPurple = renderToStaticMarkup(
      <Section variant="lightPurple" decoration="blursPurple">
        <p>content</p>
      </Section>
    );
    const bars = renderToStaticMarkup(
      <Section variant="white" decoration="bars">
        <p>content</p>
      </Section>
    );

    expect(lightPurple).toContain('bg-neutral-100');
    expect(lightPurple).not.toContain('bg-gradient-to-br');
    expect(lightPurple).not.toContain('blur-3xl');
    expect(bars).not.toContain('decoration-bar-purple');
    expect(bars).not.toContain('decoration-bar-cyan');
    expect(bars).not.toContain('decoration-bar-yellow');
  });

  it('does not leave white-on-white hero CTAs on PageHero pages', () => {
    const columnHero = pageHeroBlock(readSource('../pages/column.astro'));
    const qaHero = pageHeroBlock(readSource('../pages/qa.astro'));

    for (const hero of [columnHero, qaHero]) {
      expect(hero).toContain('bg-primary-500');
      expect(hero).not.toContain('text-white bg-transparent');
      expect(hero).not.toContain('border-2 border-white');
      expect(hero).not.toContain('hover:bg-white');
      expect(hero).not.toContain('shadow-lg hover:shadow-xl');
    }
  });

  it('keeps shared cards restrained instead of glossy marketing panels', () => {
    const card = renderToStaticMarkup(
      <Card variant="gradientMix" decoration="barPurple">
        <p>content</p>
      </Card>
    );
    const neutralCard = renderToStaticMarkup(
      <Card>
        <p>content</p>
      </Card>
    );

    expect(card).toContain('rounded-lg');
    expect(card).toContain('border');
    expect(neutralCard).toContain('border border-neutral-200');
    expect(card).not.toContain('rounded-[32px]');
    expect(card).not.toContain('bg-gradient-to-br');
    expect(card).not.toContain('hover:-translate-y-1');
    expect(card).not.toContain('blur');
  });

  it('keeps shared buttons rectangular and flat enough for the editorial system', () => {
    const primary = renderToStaticMarkup(
      <ButtonLink href="/contact" variant="primary" size="lg">
        お問い合わせ
      </ButtonLink>
    );
    const outline = renderToStaticMarkup(
      <ButtonLink href="/materials" variant="outlinePrimary" size="md">
        判断材料を見る
      </ButtonLink>
    );

    for (const html of [primary, outline]) {
      expect(html).toContain('rounded-md');
      expect(html).not.toContain('rounded-full');
      expect(html).not.toContain('shadow-soft');
      expect(html).not.toContain('shadow-medium');
    }
    expect(outline).toContain('border border-primary-500');
    expect(outline).not.toContain('border-2');
  });

  it('keeps reused React components away from old pop-decoration patterns', () => {
    const sources = [
      readSource('../components/member-card.tsx'),
      readSource('../components/process-steps.tsx'),
      readSource('../components/ui/card.tsx'),
      readSource('../components/ui/section.tsx'),
    ];

    for (const source of sources) {
      expect(source).not.toContain('bg-gradient-to-br');
      expect(source).not.toContain('bg-gradient-to-r');
      expect(source).not.toContain('blur-3xl');
      expect(source).not.toContain('rounded-[32px]');
      expect(source).not.toContain('hover:-translate-y-1');
      expect(source).not.toContain('shadow-lg');
      expect(source).not.toContain('hover:shadow-xl');
    }
  });

  it('keeps service heroes and the shared AI DX page in the editorial system', () => {
    const serviceHero = readSource('../components/services/service-hero.astro');
    const aiDxServicePage = readSource('../components/services/ai-dx-service-page.astro');

    for (const source of [serviceHero, aiDxServicePage]) {
      expect(source).not.toContain('bg-primary-500 py-20');
      expect(source).not.toMatch(/rounded-[tblr][a-z-]*-(2xl|3xl)/);
      expect(source).not.toContain('rounded-3xl');
      expect(source).not.toContain('rounded-2xl');
      expect(source).not.toContain('shadow-strong');
      expect(source).not.toContain('shadow-medium');
      expect(source).not.toContain('hover:-translate-y-1');
    }
    expect(serviceHero).toContain('border-b border-neutral-300 bg-neutral-100');
    expect(serviceHero).not.toContain('<img');
    expect(serviceHero).toContain('判断メモ');
    expect(aiDxServicePage).toContain('border-b border-neutral-300 bg-neutral-100');
    expect(aiDxServicePage).toContain('AI導入判断メモ');
    expect(aiDxServicePage).toContain('今やらない判断');
    expect(aiDxServicePage).toContain('PoC後に本番化しない判断もできますか？');
  });

  it('keeps proof-first and partner landing pages out of the old decorative style', () => {
    const sources = [readSource('../pages/prooffirst.astro'), readSource('../pages/partner.astro')];

    for (const source of sources) {
      expect(source).toContain('border-b border-neutral-300 bg-neutral-100');
      expect(source).toContain('判断メモ');
      expect(source).not.toContain('rounded-full');
      expect(source).not.toContain('bg-gradient-to-br');
      expect(source).not.toContain('blur-3xl');
      expect(source).not.toContain('blur-2xl');
      expect(source).not.toContain('rounded-3xl');
      expect(source).not.toContain('rounded-2xl');
      expect(source).not.toContain('shadow-strong');
      expect(source).not.toContain('shadow-medium');
      expect(source).not.toContain('shadow-lg');
      expect(source).not.toContain('shadow-xl');
      expect(source).not.toContain('hover:-translate-y-1');
    }
  });

  it('keeps home and materials CTAs aligned with the rectangular CTA system', () => {
    const home = readSource('../pages/index.astro');
    const materials = readSource('../pages/materials.astro');

    for (const source of [home, materials]) {
      expect(source).not.toContain('rounded-full');
      expect(source).not.toContain('transition-all transform');
    }
    expect(home).toContain('発注前に相談する');
    expect(materials).toContain('実現可否を相談する');
  });

  it('keeps the global Header server-rendered without React hydration directives', () => {
    const offenders = allSourceFiles().flatMap((sourcePath) => {
      const source = readFileSync(sourcePath, 'utf8');
      return source.includes('<Header client:') ? [path.relative(process.cwd(), sourcePath)] : [];
    });

    expect(offenders).toEqual([]);
  });

  it('keeps the collaboration page discoverable from the global footer', () => {
    const footer = readSource('../components/footer.astro');

    expect(footer).toContain("{ label: '開発会社・SIer様へ（協業）', href: '/partner' }");
  });

  it('uses the formal company name in source content and public metadata', () => {
    const checkedFiles = [
      ...allSourceFiles(),
      path.join(process.cwd(), 'public/llms.txt'),
      path.join(process.cwd(), 'scripts/beekle-glossary.mjs'),
      path.join(process.cwd(), 'AGENTS.md'),
      path.join(process.cwd(), 'CLAUDE.md'),
    ];
    const offenders = checkedFiles
      .filter((sourcePath) => readFileSync(sourcePath, 'utf8').includes('Beekle株式会社'))
      .map((sourcePath) => path.relative(process.cwd(), sourcePath));

    expect(offenders).toEqual([]);
  });

  it('keeps primary consultation copy buyer-sided instead of start-stop wording', () => {
    const checkedPaths = [
      'src/pages/index.astro',
      'src/pages/contact.astro',
      'src/pages/prooffirst.astro',
      'src/pages/strengths.astro',
      'src/pages/services/ai-adoption.astro',
      'src/pages/situations/index.astro',
      'src/pages/situations/[slug].astro',
      'src/components/hero-section.tsx',
      'src/components/process-hero.tsx',
      'src/components/process-steps.tsx',
      'src/components/contact-form.tsx',
      'src/components/services/service-product-package.astro',
      'src/components/services/service-ai-risk-management.astro',
      'src/data/ai-service-page-config.ts',
      'src/data/consultation-situations.ts',
    ];
    const blockedPatterns = [
      '進むか止める',
      '進む/止める',
      '進める/止める',
      'Go / No-Go',
      'No-Go',
      '止める理由',
      '止めるべき',
    ];
    const offenders = checkedPaths.flatMap((sourcePath) => {
      const source = readFileSync(path.join(process.cwd(), sourcePath), 'utf8');
      return blockedPatterns
        .filter((pattern) => source.includes(pattern))
        .map((pattern) => `${sourcePath}: ${pattern}`);
    });

    expect(offenders).toEqual([]);
  });

  it('keeps every page and embedded feature on the neutral editorial surface system', () => {
    const blockedPatterns = [
      'bg-gradient-to-br',
      'bg-gradient-to-r',
      'bg-gradient-to-br from-gray-50 to-white',
      'bg-gradient-to-br from-primary-50 to-primary-100',
      'rounded-3xl',
      'rounded-2xl',
      'rounded-[32px]',
      'rounded-[40px]',
      'shadow-soft',
      'shadow-medium',
      'shadow-strong',
      'shadow-sm',
      'shadow-md',
      'shadow-lg',
      'shadow-xl',
      'shadow-2xl',
      'transition-shadow',
      'hover:shadow',
      'hover:-translate-y',
      'hover:scale-105',
      'blur-3xl',
      'blur-2xl',
      '<main class="pt-20"',
    ];

    const offenders = allSourceFiles().flatMap((sourcePath) => {
      const source = readFileSync(sourcePath, 'utf8');
      return blockedPatterns
        .filter((pattern) => source.includes(pattern))
        .map((pattern) => `${path.relative(process.cwd(), sourcePath)}: ${pattern}`);
    });

    expect(offenders).toEqual([]);
  });
});
