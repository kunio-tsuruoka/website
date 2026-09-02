import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const source = (path: string) => {
  const absolutePath = resolve(root, path);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
};

describe('outcome-led LP copy', () => {
  it('defines service heroes around the customer result and decision', () => {
    const copy = source('src/data/outcome-led-copy.ts');

    expect(copy).toContain("'web-mobile-development'");
    expect(copy).toContain(
      '開発会社を何社もつながず、要件が曖昧な段階から公開後まで一つのチームで進める。'
    );
    expect(copy).toContain('次に何を作るかの判断へ集中できる状態');
    expect(copy).toContain('開発の進め方を整理する');

    expect(copy).toContain("'mvp-poc-development'");
    expect(copy).toContain('数百万円を投じる前に、小さく動かして本開発の価値を確かめる。');
    expect(copy).toContain('どこまで作るべきかを判断できる材料');
    expect(copy).toContain('発注前に検証範囲を決める');
  });

  it('defines situation heroes around the future after the project', () => {
    const copy = source('src/data/outcome-led-copy.ts');

    expect(copy).toContain("'business-systemization'");
    expect(copy).toContain('ベテランが休んでも、業務が止まらない仕組みへ。');
    expect(copy).toContain('誰でも同じ流れで仕事を進められる状態');
    expect(copy).toContain('属人業務を整理する');

    expect(copy).toContain("'legacy-system-modernization'");
    expect(copy).toContain(
      '改修のたびに増える調査費を止め、業務を止めずに古いシステムを刷新する。'
    );
    expect(copy).toContain('不要な再実装と移行リスクを減らします');
    expect(copy).toContain('刷新範囲を整理する');
  });

  it('wires the outcome copy into service and situation heroes', () => {
    const serviceHero = source('src/components/services/service-hero.astro');
    const situationPage = source('src/pages/situations/[slug].astro');

    expect(serviceHero).toContain('resolveServiceHeroCopy');
    expect(serviceHero).toContain('resolvedCopy.headline');
    expect(serviceHero).toContain('resolvedCopy.heroLead');
    expect(serviceHero).toContain('resolvedCopy.contactLabel');

    expect(situationPage).toContain('resolveSituationHeroCopy');
    expect(situationPage).toContain('situationHero.title');
    expect(situationPage).toContain('situationHero.lead');
    expect(situationPage).toContain('situationHero.contactLabel');
  });
});
