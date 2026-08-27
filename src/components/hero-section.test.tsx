import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HeroSection } from './hero-section';

const visibleText = (html: string) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, '');
const renderHeroHtml = () => render(<HeroSection />).container.innerHTML;

describe('HeroSection', () => {
  it('keeps the first view to one message, one proof line, and one CTA', () => {
    const html = renderHeroHtml();
    const text = visibleText(html);

    expect(text).toContain('爆速開発。だから、開発費を抑えられる。');
    expect(text).toContain('AI前提で開発工数を圧縮。1日でデモ、1週間で触れる形に。');
    expect(text).toContain('相談する');
    expect(text).not.toContain('開発が速い。だから、同じ予算でより多く前に進める。');
    expect(text).not.toContain('発注前に相談する');
    expect(text).not.toContain('速さの実績を見る');
    expect(text).not.toContain('AIに相談する');
  });

  it('removes explanatory copy and the development-economics panel from the hero', () => {
    const html = renderHeroHtml();

    expect(html).not.toContain('開発効率の構造');
    expect(html).not.toContain('速さがコストに効く理由');
    expect(html).not.toContain('速く作る');
    expect(html).not.toContain('工数を減らす');
    expect(html).not.toContain('総額を抑える');
    expect(html).not.toContain('検証を増やす');
    expect(html).not.toContain('初回相談・簡易デモは無料');
    expect(html).not.toContain('3週間で難航案件を立て直し');
    expect(html).not.toContain('NDA可');
  });

  it('uses a compact single-column hero', () => {
    const html = renderHeroHtml();

    expect(html).toContain('lg:min-h-[480px]');
    expect(html).not.toContain('lg:min-h-[640px]');
    expect(html).not.toContain('lg:grid-cols');
    expect(html).not.toContain('md:hidden');
    expect(html).not.toContain('hidden border-y border-neutral-300 bg-white md:block');
  });

  it('keeps restrained brand styling', () => {
    const html = renderHeroHtml();

    expect(html).toContain('bg-neutral-100');
    expect(html).toContain('text-primary-500');
    expect(html).not.toContain('bg-gradient-to-br from-primary-50');
    expect(html).not.toContain('shadow-medium');
  });
});
