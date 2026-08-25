import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CTASection } from './process-cta-section';

describe('CTASection', () => {
  it('uses decision-risk CTA copy instead of free-consultation anchoring', () => {
    const html = renderToStaticMarkup(<CTASection />);

    expect(html).toContain('作るべきか、発注前に整理しませんか？');
    expect(html).toContain('初回相談・簡易デモの範囲を確認する');
    expect(html).toContain('PoCや本開発の前に、判断材料を整理します');
    expect(html).not.toContain('無料相談');
    expect(html).not.toContain('初期費用0円');
  });
});
