import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { TOOL_WIZARD_GOALS } from '@/components/tool-wizard';
import { describe, expect, it } from 'vitest';

const pagesDir = resolve(import.meta.dirname, '../pages/tools');
const storyPage = readFileSync(resolve(pagesDir, 'story-builder.astro'), 'utf8');
const toolsIndex = readFileSync(resolve(pagesDir, 'index.astro'), 'utf8');
const flowPage = readFileSync(resolve(pagesDir, 'flow-mapper.astro'), 'utf8');
const scopePage = readFileSync(resolve(pagesDir, 'scope-manager.astro'), 'utf8');
const rfpPage = readFileSync(resolve(pagesDir, 'rfp-builder.astro'), 'utf8');

describe('tools information architecture', () => {
  it('story-builder は As-Is / シナリオ / RFP をこの順で案内する', () => {
    const asIs = storyPage.indexOf('>現状と目指す姿</h3>');
    const stories = storyPage.indexOf('>ストーリーとシナリオ</h3>');
    const rfp = storyPage.indexOf('>RFPの下書き</h3>');
    expect(asIs).toBeGreaterThan(-1);
    expect(stories).toBeGreaterThan(asIs);
    expect(rfp).toBeGreaterThan(stories);
  });

  it('無料ツールの案内から EARS を外している', () => {
    expect(storyPage).not.toContain('EARS');
    expect(toolsIndex).not.toContain('EARS');
  });

  it('発注準備キットは見る→書く→切る→出すの順で案内する', () => {
    expect(toolsIndex).toContain('見る → 書く → 切る → 出す');
    expect(toolsIndex).toContain('<ToolPath />');
    expect(toolsIndex).not.toContain('順番に使う必要はありません');
    expect(flowPage).toContain('current="flow-mapper"');
    expect(storyPage).toContain('current="story-builder"');
    expect(scopePage).toContain('current="scope-manager"');
    expect(rfpPage).toContain('current="rfp-builder"');
  });

  it('RFPを急ぐ人は空の章立てではなくストーリー作成から入る', () => {
    const rfpGoal = TOOL_WIZARD_GOALS.find((goal) => goal.id === 'rfp');
    expect(rfpGoal?.recommendedHref).toBe('/tools/story-builder');
    expect(toolsIndex).not.toContain('単独でも基本情報だけ書いて');
  });
});
