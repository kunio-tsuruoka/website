import { describe, expect, it } from 'vitest';
import { companyPositioning } from './company';

describe('companyPositioning', () => {
  it('defines Beekle around development efficiency rather than low-price positioning', () => {
    expect(companyPositioning.short).toBe(
      'AIを前提に開発工数を圧縮し、同じ予算でより多く前に進めるシステム開発会社です。'
    );
    expect(companyPositioning.long).toContain('調査・設計・実装・検証を高速化');
    expect(companyPositioning.long).toContain('必要な人月と開発総額を抑えながら改善回数を増やします');
    expect(companyPositioning.short).not.toContain('最安');
    expect(companyPositioning.short).not.toContain('格安');
  });
});
