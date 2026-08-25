import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(import.meta.dirname, '../pages/strengths.astro'), 'utf8');
const mainSource = source.slice(source.indexOf('<main'));

const indexOfCopy = (copy: string, target = mainSource) => {
  const index = target.indexOf(copy);
  expect(index, `${copy} should exist in strengths.astro`).toBeGreaterThanOrEqual(0);
  return index;
};

const countMatches = (target: string, pattern: RegExp) => target.match(pattern)?.length ?? 0;

describe('strengths page information architecture', () => {
  it('starts with customer outcome and proof, not an abstract method explanation', () => {
    expect(source).not.toContain('<PageHero');
    expect(mainSource).toContain('発注判断の材料まで');
    expect(mainSource).toContain('text-4xl font-bold leading-[1.08]');

    const positions = [
      indexOfCopy('要件が曖昧でも、'),
      indexOfCopy('実案件ログ'),
      indexOfCopy('発注判断シート'),
      indexOfCopy('変更に強い理由'),
      indexOfCopy('この進め方が向いている相談'),
      indexOfCopy('よくあるご不安'),
    ];

    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('explains PM on Rails in the FAQ without making it the first message', () => {
    const firstViewportEnd = indexOfCopy('発注判断シート');
    const pmOnRailsIndex = indexOfCopy('PM on Rails');
    const faqIndex = indexOfCopy('よくあるご不安');

    expect(pmOnRailsIndex).toBeGreaterThan(firstViewportEnd);
    expect(source).toContain('仕様変更の影響はどう追いますか？');
    expect(faqIndex).toBeGreaterThan(pmOnRailsIndex);
    expect(source).toContain("question: 'PM on Railsとは何ですか？'");
    expect(source).toContain('要求、受入条件、実装タスク、確認結果をつなぎ');
  });

  it('reduces rounded card repetition in favor of ruled logs and tables', () => {
    expect(mainSource).toContain('case-log-table');
    expect(mainSource).toContain('case-log-table hidden');
    expect(mainSource).toContain('md:hidden');
    expect(mainSource).toContain('decision-sheet-table');
    expect(countMatches(mainSource, /rounded-\[32px\]|rounded-2xl/g)).toBeLessThanOrEqual(4);
  });

  it('uses editorial brand accents instead of generated-looking purple surfaces', () => {
    const firstDecisionEnd = indexOfCopy('この進め方が向いている相談');
    const firstDecisionSource = mainSource.slice(0, firstDecisionEnd);

    expect(firstDecisionSource).toContain('border-l-8 border-primary-500');
    expect(firstDecisionSource).toContain('case-log-table hidden border-t border-neutral-300');
    expect(firstDecisionSource).toContain(
      'decision-sheet-table border-y border-neutral-300 bg-white'
    );
    expect(firstDecisionSource).not.toContain('bg-gradient-to-br from-primary-50');
    expect(firstDecisionSource).not.toContain('bg-primary-500 px-5 py-4');
    expect(firstDecisionSource).not.toContain('bg-primary-100');
    expect(firstDecisionSource).not.toContain('shadow-soft');
  });
});
