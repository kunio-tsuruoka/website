import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HeroSection } from './hero-section';

const visibleText = (html: string) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, '');
const renderHeroHtml = () => render(<HeroSection />).container.innerHTML;

describe('HeroSection', () => {
  it('renders the first-view copy visible in the initial HTML', () => {
    const html = renderHeroHtml();
    const text = visibleText(html);

    expect(text).toContain('要件が固まる前のAI・DX・業務システム相談');
    expect(text).not.toContain('社内システム化の発注前相談');
    expect(text).toContain('AI・DXで、何を作るべきかから一緒に考える。');
    expect(text).toContain('何を作るべきかから一緒に考える。');
    expect(html).toContain('text-4xl font-bold leading-[1.05] text-accent-950 sm:text-5xl');
    expect(html).toContain('発注前に相談する');
    expect(html).toContain('実案件の判断材料を見る');
    expect(html).toContain('AIに相談する');
    expect(html).not.toContain('PM on Rails');
    expect(html).toContain('要件が固まる前から、業務課題を整理し、まず動く形で検証します。');
    expect(html).toContain('試してから本開発を決めるためのAI・業務システム開発です。');
    expect(html).not.toContain('数百万円を発注する前に、本当に作るべきか確かめる。');
    expect(html).not.toContain('開発する・見送る・範囲を変える判断材料を作ります。');
    expect(html).toContain('初回相談・簡易デモは無料');
    expect(html).toContain('PoCが必要な場合は、目的・範囲・判断基準を別途整理します。');
    expect(html).toContain('見送り条件がある場合も、開発前に理由を残します。');
    expect(html).not.toContain('初期費用0円');
    expect(html).not.toContain('無料相談');
    expect(html).not.toContain('opacity:0');
    expect(html).not.toContain('translateY(20px)');
    expect(html).not.toContain('translateY(16px)');
  });

  it('uses the supplied background image instead of a faux app dashboard', () => {
    const html = renderHeroHtml();

    expect(html).toContain('/images/home-hero-background.webp');
    expect(html).toContain('<img');
    expect(html).not.toContain('/images/prototype-review-hero.webp');
    expect(html).not.toContain('/images/home-hero-decision-workspace.webp');
    expect(html).not.toContain('発注判断シート');
    expect(html).not.toContain('この要件で発注していいか');
    expect(html).not.toContain('No-Go条件');
    expect(html).not.toContain('GO');
    expect(html).not.toContain('HOLD');
    expect(html).not.toContain('STOP');
    expect(html).not.toContain('NDA OK');
    expect(html).not.toContain('AI導入候補 / 社内検索');
    expect(html).not.toContain('相談で返すもの');
  });

  it('keeps the hero compact enough for the proof section to appear next', () => {
    const html = renderHeroHtml();

    expect(html).not.toContain('min-h-[calc(100vh-88px)]');
    expect(html).not.toContain('lg:min-h-[720px]');
    expect(html).toContain('lg:min-h-[640px]');
  });

  it('uses restrained brand accents instead of broad generated-looking purple surfaces', () => {
    const html = renderHeroHtml();

    expect(html).toContain('border-l-8 border-primary-500');
    expect(html).not.toContain('bg-gradient-to-br from-primary-50');
    expect(html).not.toContain('bg-primary-500 px-5 py-4 text-white');
    expect(html).not.toContain('bg-primary-100');
    expect(html).not.toContain('shadow-medium');
  });
});
