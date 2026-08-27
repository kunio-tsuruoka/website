import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HeroSection } from './hero-section';

const visibleText = (html: string) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, '');
const renderHeroHtml = () => render(<HeroSection />).container.innerHTML;

describe('HeroSection', () => {
  it('renders speed-led value proposition in the first view', () => {
    const html = renderHeroHtml();
    const text = visibleText(html);

    expect(text).toContain('AI・DX・業務システムを、少ない工数で速く形にする');
    expect(text).toContain('開発が速い。だから、同じ予算でより多く前に進める。');
    expect(text).not.toContain('AI・DXで、何を作るべきかから一緒に考える。');
    expect(html).toContain('text-4xl font-bold leading-[1.05] text-accent-950 sm:text-5xl');
    expect(html).toContain('発注前に相談する');
    expect(html).toContain('速さの実績を見る');
    expect(html).toContain('AIに相談する');
    expect(html).not.toContain('PM on Rails');
    expect(html).toContain('業務課題の整理からプロトタイプ、本開発までをAIを前提に高速化します。');
    expect(html).toContain('必要な人月を減らし、その分、開発総額を抑えながら、検証と改善の回数を増やします。');
    expect(html).toContain('安いから速いのではなく、速いからコストを下げられる開発です。');
    expect(html).toContain('初回相談・簡易デモは無料');
    expect(html).toContain('速さのために品質を落とすのではなく、手戻りと待ち時間を減らします。');
    expect(html).not.toContain('初期費用0円');
    expect(html).not.toContain('無料相談');
    expect(html).not.toContain('opacity:0');
    expect(html).not.toContain('translateY(20px)');
    expect(html).not.toContain('translateY(16px)');
  });

  it('shows why speed improves development economics', () => {
    const html = renderHeroHtml();

    expect(html).toContain('開発効率の構造');
    expect(html).toContain('速さがコストに効く理由');
    expect(html).toContain('速く作る');
    expect(html).toContain('工数を減らす');
    expect(html).toContain('総額を抑える');
    expect(html).toContain('検証を増やす');
    expect(html).toContain('1日でデモ化 / 1週間程度で触れる形にした実績');
    expect(html).toContain('必要な人月を減らし、同じ予算で作れる範囲を広げる');
    expect(html).toContain('実案件で確認できる速度');
    expect(html).toContain('1日でデモ');
    expect(html).toContain('1週間程度で触れる形');
    expect(html).toContain('3週間で難航案件を立て直し');
    expect(html).not.toContain('発注判断シート');
    expect(html).not.toContain('No-Go条件');
    expect(html).not.toContain('GO');
    expect(html).not.toContain('HOLD');
    expect(html).not.toContain('STOP');
    expect(html).not.toContain('<img');
  });

  it('keeps the hero compact enough for the proof section to appear next', () => {
    const html = renderHeroHtml();

    expect(html).not.toContain('min-h-[calc(100vh-88px)]');
    expect(html).not.toContain('lg:min-h-[720px]');
    expect(html).toContain('lg:min-h-[640px]');
    expect(html).toContain('md:hidden');
    expect(html).toContain('hidden border-y border-neutral-300 bg-white md:block');
  });

  it('uses restrained brand accents instead of broad generated-looking purple surfaces', () => {
    const html = renderHeroHtml();

    expect(html).toContain('border-l-8 border-primary-500');
    expect(html).toContain('border-l-2 border-primary-500 pl-3');
    expect(html).toContain('border-y border-neutral-300 bg-white');
    expect(html).not.toContain('bg-gradient-to-br from-primary-50');
    expect(html).not.toContain('bg-primary-500 px-5 py-4 text-white');
    expect(html).not.toContain('bg-primary-100');
    expect(html).not.toContain('shadow-medium');
  });
});
