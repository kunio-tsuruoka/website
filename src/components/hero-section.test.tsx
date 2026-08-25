import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HeroSection } from './hero-section';

const visibleText = (html: string) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, '');

describe('HeroSection', () => {
  it('renders the first-view copy visible in the initial HTML', () => {
    const html = renderToStaticMarkup(<HeroSection />);
    const text = visibleText(html);

    expect(text).toContain('要件が固まる前のAI・DX・業務システム相談');
    expect(text).not.toContain('社内システム化の発注前相談');
    expect(text).toContain('数百万円を発注する前に、本当に作るべきか確かめる。');
    expect(text).toContain('本当に作るべきか確かめる。');
    expect(html).toContain('text-4xl font-bold leading-[1.05] text-accent-950 sm:text-5xl');
    expect(html).toContain('発注前に相談する');
    expect(html).toContain('開発する・見送る・範囲を変える判断材料を作ります。');
    expect(html).toContain('見送り条件がある場合も、開発前に理由を残します。');
    expect(html).toContain('この要件で発注していいか');
    expect(html).not.toContain('進めない方がよい場合');
    expect(html).not.toContain('opacity:0');
    expect(html).not.toContain('translateY(20px)');
    expect(html).not.toContain('translateY(16px)');
  });

  it('uses a restrained decision sheet instead of a faux app dashboard', () => {
    const html = renderToStaticMarkup(<HeroSection />);

    expect(html).toContain('発注判断シート');
    expect(html).toContain('判断の根拠');
    expect(html).toContain('見送り条件');
    expect(html).not.toContain('No-Go条件');
    expect(html).toContain('受入条件');
    expect(html).toContain('投資レンジ');
    expect(html).not.toContain('GO');
    expect(html).not.toContain('HOLD');
    expect(html).not.toContain('STOP');
    expect(html).not.toContain('NDA OK');
    expect(html).not.toContain('AI導入候補 / 社内検索');
    expect(html).not.toContain('相談で返すもの');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('/images/prototype-review-hero.webp');
    expect(html).not.toContain('/images/home-hero-decision-workspace.webp');
  });

  it('keeps the hero compact enough for the proof section to appear next', () => {
    const html = renderToStaticMarkup(<HeroSection />);

    expect(html).not.toContain('min-h-[calc(100vh-88px)]');
    expect(html).not.toContain('lg:min-h-[720px]');
    expect(html).toContain('lg:min-h-[640px]');
    expect(html).toContain('md:hidden');
    expect(html).toContain('hidden border-y border-neutral-300 bg-white md:block');
  });

  it('uses restrained brand accents instead of broad generated-looking purple surfaces', () => {
    const html = renderToStaticMarkup(<HeroSection />);

    expect(html).toContain('border-l-8 border-primary-500');
    expect(html).toContain('border-l-2 border-primary-500 pl-3');
    expect(html).toContain('border-y border-neutral-300 bg-white');
    expect(html).not.toContain('bg-gradient-to-br from-primary-50');
    expect(html).not.toContain('bg-primary-500 px-5 py-4 text-white');
    expect(html).not.toContain('bg-primary-100');
    expect(html).not.toContain('shadow-medium');
  });
});
