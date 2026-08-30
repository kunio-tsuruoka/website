import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HeroSection } from './hero-section';

const visibleText = (html: string) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, '');
const renderHeroHtml = () => render(<HeroSection />).container.innerHTML;

describe('HeroSection', () => {
  it('sells a faster decision and a continuous path to production', () => {
    const html = renderHeroHtml();
    const text = visibleText(html);

    expect(text).toContain(
      '爆速デモで、長い検討をスキップ。動くものを見て決め、そのまま本番運用まで。'
    );
    expect(text).toContain(
      '資料と見積書だけで何週間も悩まず、まず実際に動く形を確認できます。進めると決めたものは、使い捨ての試作品で終わらせず、そのまま本番運用まで育てます。'
    );
    expect(text).toContain('爆速デモについて相談する');
    expect(text).not.toContain('数千万円を発注する前に、まず動くものを。');
    expect(text).not.toContain('作る・見送る・範囲を変える判断材料を揃えます。');
    expect(text).not.toContain('発注前の判断材料をつくる');
  });

  it('uses the supplied background image instead of a faux app dashboard', () => {
    const html = renderHeroHtml();

    expect(html).toContain('/images/home-hero-background.webp');
    expect(html).toContain('<img');
    expect(html).not.toContain('/images/prototype-review-hero.webp');
    expect(html).not.toContain('/images/home-hero-decision-workspace.webp');
    expect(html).not.toContain('発注判断シート');
    expect(html).not.toContain('開発効率の構造');
    expect(html).not.toContain('速さがコストに効く理由');
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

  it('uses a full-bleed background with longer copy still constrained to the left', () => {
    const html = renderHeroHtml();

    expect(html).toContain('absolute inset-0 h-full w-full object-cover');
    expect(html).toContain('home-hero-veil');
    expect(html).toContain('lg:min-h-[560px]');
    expect(html).not.toContain('lg:min-h-[640px]');
    expect(html).not.toContain('lg:grid-cols');
    expect(html).not.toContain('w-[54%]');
    expect(html).not.toContain('w-[52%]');
    expect(html).not.toContain('md:hidden');
    expect(html).not.toContain('hidden border-y border-neutral-300 bg-white md:block');
    expect(html).toContain('max-w-[28rem]');
    expect(html).toContain('xl:max-w-[36rem]');
    expect(html).toContain('xl:text-5xl');
    expect(html).not.toContain('max-w-[20rem]');
    expect(html).not.toContain('xl:max-w-[26rem]');
    expect(html).not.toContain('xl:text-8xl');
    expect(html).not.toContain('md:text-7xl');
  });

  it('keeps restrained brand styling', () => {
    const html = renderHeroHtml();

    expect(html).toContain('bg-neutral-100');
    expect(html).toContain('text-primary-500');
    expect(html).not.toContain('bg-gradient-to-br from-primary-50');
    expect(html).not.toContain('shadow-medium');
  });
});
