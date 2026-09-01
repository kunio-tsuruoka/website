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
  it('follows the decision-page order: one-line pitch, proof, fit, comparison, sheet, method, cost, voices, FAQ, contact', () => {
    expect(source).not.toContain('<PageHero');
    expect(source).toContain(
      "const pageTitle = 'Beekleはどんな開発会社か｜向いている案件・他社との違い・費用・実績'"
    );
    expect(mainSource).toContain('要件が曖昧なAI・DX・システム開発を、発注できる状態に変えます。');

    const positions = [
      indexOfCopy('実案件ログ'),
      indexOfCopy('数字の前後まで書いた実案件'),
      indexOfCopy('この進め方が向いている相談'),
      indexOfCopy('id="comparison"'),
      indexOfCopy('発注判断シート'),
      indexOfCopy('変更に強い進め方'),
      indexOfCopy('id="cost"'),
      indexOfCopy('id="voices"'),
      indexOfCopy('よくあるご不安'),
      indexOfCopy('strengths-final'),
    ];

    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('writes each proof as a chain, not just a number, and links to the detailed case', () => {
    for (const key of ['止まっていた状態', 'Beekleが担当した範囲', '完了とした状態', '期間']) {
      expect(source).toContain(`key: '${key}'`);
    }
    for (const anchor of ['recovery', 'demo-in-a-day', 'new-business-in-a-week', 'iroai-care']) {
      expect(source).toContain(`/case-studies?case=${anchor}#${anchor}`);
    }
    // 顧客の声は対応が確認できている案件だけに載せる（勝手に結びつけない）
    expect(source).toContain("attribution: '森一真様 株式会社iroAI 代表取締役'");
    expect(countMatches(source, /voice: null/g)).toBe(2);
  });

  it('compares four options and keeps the cost summary tied to the cost articles', () => {
    for (const option of ['既製サービス', 'コンサル会社', '仕様確定型の開発会社', 'Beekle']) {
      expect(source).toContain(`option: '${option}'`);
    }
    expect(source).toContain("guide: '50〜300万円程度'");
    expect(source).toContain("guide: '200〜600万円程度'");
    expect(source).toContain("guide: '500〜1,500万円以上'");
    expect(source).toContain("href: '/column/ai-development-cost-guide'");
    expect(source).toContain('testimonialData.map');
  });

  it('explains PM on Rails after the first viewport and again in the FAQ', () => {
    const firstViewportEnd = indexOfCopy('数字の前後まで書いた実案件');
    const pmOnRailsIndex = indexOfCopy('PM on Rails');
    const faqIndex = indexOfCopy('よくあるご不安');

    expect(pmOnRailsIndex).toBeGreaterThan(firstViewportEnd);
    expect(faqIndex).toBeGreaterThan(pmOnRailsIndex);
    expect(source).toContain('仕様変更の影響はどう追いますか？');
    expect(source).toContain("question: 'PM on Railsとは何ですか？'");
    expect(source).toContain('要求、受入条件、実装タスク、確認結果をつなぎ');
  });

  it('keeps the editorial design language: ruled tables, left accents, no rounded card stacks', () => {
    expect(mainSource).toContain('case-log-table');
    expect(mainSource).toContain('decision-sheet-table border-y border-neutral-300 bg-white');
    expect(mainSource).toContain('border-l-8 border-primary-500');
    expect(mainSource).toContain('md:hidden');
    expect(countMatches(mainSource, /rounded-\[32px\]|rounded-2xl/g)).toBe(0);
    expect(mainSource).not.toContain('bg-gradient-to-br from-primary-50');
    expect(mainSource).not.toContain('bg-primary-100');
    expect(mainSource).not.toContain('shadow-soft');
    expect(mainSource).not.toContain('shadow-medium');
  });
});
