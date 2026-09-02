import { normalizeBeeklePageTitle } from '@/lib/seo-title';
import { describe, expect, it } from 'vitest';

describe('normalizeBeeklePageTitle', () => {
  it.each([
    ['生成AI受託開発', '生成AI受託開発 | Beekle'],
    ['生成AI受託開発 | Beekle', '生成AI受託開発 | Beekle'],
    ['生成AI受託開発 | Beekle | Beekle', '生成AI受託開発 | Beekle'],
    ['生成AI受託開発｜Beekle｜Beekle', '生成AI受託開発 | Beekle'],
    ['株式会社Beekle', '株式会社Beekle'],
    ['Beekle', 'Beekle'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizeBeeklePageTitle(input)).toBe(expected);
  });
});
