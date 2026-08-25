import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(import.meta.dirname, '../pages/index.astro'), 'utf8');
const mainSource = source.slice(source.indexOf('<main'));

const indexOfCopy = (copy: string) => {
  const index = mainSource.indexOf(copy);
  expect(index, `${copy} should exist in index.astro`).toBeGreaterThanOrEqual(0);
  return index;
};

const countMatches = (target: string, pattern: RegExp) => target.match(pattern)?.length ?? 0;

describe('home page information architecture', () => {
  it('uses Japanese customer-facing section labels instead of internal English labels', () => {
    expect(mainSource).not.toContain('WHY BEEKLE');
    expect(mainSource).not.toContain('WHAT WE SOLVE');
    expect(mainSource).not.toContain('COLUMNS');
    expect(mainSource).not.toContain('CONTACT');

    const positions = [
      indexOfCopy('発注前の不安'),
      indexOfCopy('実案件の変化'),
      indexOfCopy('Beekleの判断支援'),
      indexOfCopy('一般的な傾向として比較'),
      indexOfCopy('相談が始まる場面'),
      indexOfCopy('進め方'),
      indexOfCopy('発注前の判断材料'),
      indexOfCopy('よくあるご不安'),
      indexOfCopy('相談前の安心材料'),
    ];

    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('does not explain PM on Rails in the first decision sections', () => {
    const earlyDecisionEnd = indexOfCopy('一般的な傾向として比較');
    const earlySource = mainSource.slice(0, earlyDecisionEnd);

    expect(earlySource).not.toContain('PM on Rails');
    expect(earlySource).not.toContain('PM基盤');
  });

  it('uses case logs and ruled sections instead of repeating rounded marketing cards up front', () => {
    const earlyDecisionEnd = indexOfCopy('一般的な傾向として比較');
    const earlySource = mainSource.slice(0, earlyDecisionEnd);

    expect(earlySource).toContain('case-log-table');
    expect(earlySource).toContain('発注判断シート');
    expect(earlySource).toContain('判断の根拠');
    expect(countMatches(earlySource, /card-base/g)).toBeLessThanOrEqual(1);
    expect(earlySource).not.toContain('card-base card-hover h-full p-6');
  });

  it('uses editorial brand accents instead of generated-looking purple surfaces', () => {
    const earlyDecisionEnd = indexOfCopy('一般的な傾向として比較');
    const earlySource = mainSource.slice(0, earlyDecisionEnd);

    expect(earlySource).toContain('case-log-table border-t border-neutral-300');
    expect(earlySource).toContain('decision-sheet-table border-y border-neutral-300 bg-white');
    expect(earlySource).toContain('border-l-8 border-primary-500');
    expect(earlySource).not.toContain('bg-gradient-to-br from-primary-50');
    expect(earlySource).not.toContain('bg-primary-500 px-3 py-1 text-white');
    expect(earlySource).not.toContain('bg-primary-100');
    expect(earlySource).not.toContain('shadow-soft');
  });

  it('frames the home page around decision risk instead of price anchoring', () => {
    expect(mainSource).toContain('数百万円を発注する前に');
    expect(mainSource).toContain('作る価値が薄い場合は、作らない判断も選択肢に含めます');
    expect(mainSource).toContain('条件が合う案件では、初期検証を当社負担で行う場合があります');
    expect(mainSource).toContain('初回相談・簡易デモは無料');
    expect(mainSource).toContain('PoCは別途範囲定義');
    expect(mainSource).toContain('発注前に相談する');
    expect(mainSource).not.toContain('初期費用0円');
    expect(mainSource).not.toContain('無料相談');
    expect(mainSource).not.toContain('効果検証無料');
  });
});
