import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const storyPage = readFileSync(
  resolve(import.meta.dirname, '../pages/tools/story-builder.astro'),
  'utf8'
);
const toolsIndex = readFileSync(resolve(import.meta.dirname, '../pages/tools/index.astro'), 'utf8');

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
});
