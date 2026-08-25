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
      indexOfCopy('実案件の変化'),
      indexOfCopy('Beekleの判断支援'),
      indexOfCopy('相談が始まる場面'),
      indexOfCopy('発注前の判断材料'),
      indexOfCopy('よくあるご不安'),
      indexOfCopy('相談前の安心材料'),
    ];

    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('does not explain PM on Rails in the first decision sections', () => {
    const earlyDecisionEnd = indexOfCopy('相談が始まる場面');
    const earlySource = mainSource.slice(0, earlyDecisionEnd);

    expect(earlySource).not.toContain('PM on Rails');
    expect(earlySource).not.toContain('PM基盤');
  });

  it('uses case logs and ruled sections instead of repeating rounded marketing cards up front', () => {
    const earlyDecisionEnd = indexOfCopy('相談が始まる場面');
    const earlySource = mainSource.slice(0, earlyDecisionEnd);

    expect(earlySource).toContain('case-log-table');
    expect(earlySource).toContain('発注判断シート');
    expect(earlySource).toContain('判断の根拠');
    expect(countMatches(earlySource, /card-base/g)).toBeLessThanOrEqual(1);
    expect(earlySource).not.toContain('card-base card-hover h-full p-6');
  });

  it('uses editorial brand accents instead of generated-looking purple surfaces', () => {
    const earlyDecisionEnd = indexOfCopy('相談が始まる場面');
    const earlySource = mainSource.slice(0, earlyDecisionEnd);

    expect(earlySource).toContain('case-log-table border-t border-neutral-300');
    expect(earlySource).toContain('decision-sheet-table border-y border-neutral-300 bg-white');
    expect(earlySource).toContain('border-l-8 border-primary-500');
    expect(earlySource).not.toContain('bg-gradient-to-br from-primary-50');
    expect(earlySource).not.toContain('bg-primary-500 px-3 py-1 text-white');
    expect(earlySource).not.toContain('bg-primary-100');
    expect(earlySource).not.toContain('shadow-soft');
  });
});
