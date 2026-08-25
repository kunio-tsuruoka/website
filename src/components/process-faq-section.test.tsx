import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProcessFAQ } from './process-faq-section';

describe('ProcessFAQ', () => {
  it('separates the free initial demo from paid PoC scope', () => {
    const html = renderToStaticMarkup(<ProcessFAQ />);

    expect(html).toContain('無料で対応できる範囲はどこまでですか？');
    expect(html).toContain('初回相談では、課題の整理と方向性確認');
    expect(html).toContain('既存デモまたは簡易デモの提示まで費用をいただきません');
    expect(html).toContain('実データ・実業務フロー・精度検証・セキュリティ要件を含むPoC');
    expect(html).toContain('別途範囲を定義してご提案します');
    expect(html).not.toContain('初期費用0円');
    expect(html).not.toContain('無料相談');
  });
});
