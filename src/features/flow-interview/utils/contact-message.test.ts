import type { FlowDiagram } from '@/features/flow-mapper/types';
import { consumeContactPrefill, writeContactPrefill } from '@/lib/contact-prefill';
import { describe, expect, test } from 'vitest';
import { buildContactMessage } from './contact-message';

const diagram: FlowDiagram = {
  title: '請求業務',
  phases: [{ id: 'p1', name: 'フロー' }],
  lanes: [
    { id: 'l1', name: '営業' },
    { id: 'l2', name: '経理' },
  ],
  steps: [
    {
      id: 's1',
      type: 'start',
      laneId: 'l1',
      phaseId: 'p1',
      label: '売上入力',
      durationMin: 0,
      tool: 'スプレッドシート',
      pain: '',
      improvement: '',
      next: ['s2'],
    },
    {
      id: 's2',
      type: 'end',
      laneId: 'l2',
      phaseId: 'p1',
      label: '請求書送付',
      durationMin: 0,
      tool: 'メール',
      pain: '5営業日かかる',
      improvement: '',
      next: [],
    },
  ],
};

describe('buildContactMessage', () => {
  test('As-Is を担当・ツール・課題付きで含める', () => {
    const msg = buildContactMessage({ diagram });
    expect(msg).toContain('現状業務（As-Is）: 請求業務');
    expect(msg).toContain('[営業] 売上入力（ツール:スプレッドシート）');
    expect(msg).toContain('[経理] 請求書送付（ツール:メール / 課題:5営業日かかる）');
  });

  test('改善案とRFPがあれば追記、なければ省略', () => {
    const withAll = buildContactMessage({
      diagram,
      suggestions: [
        { kind: 'automation', target: '入力', title: '自動化', effect: '30%削減', detail: '...' },
      ],
      suggestSummary: '自動化方針',
      rfpMarkdown: '# RFP\n...',
    });
    expect(withAll).toContain('■ AI改善案（To-Be）');
    expect(withAll).toContain('- [automation] 自動化: 30%削減');
    expect(withAll).toContain('■ RFPドラフト');

    const asIsOnly = buildContactMessage({ diagram });
    expect(asIsOnly).not.toContain('AI改善案');
    expect(asIsOnly).not.toContain('RFPドラフト');
  });
});

describe('contact-prefill round-trip', () => {
  test('write→consume で取り出せ、consume後は消える', () => {
    writeContactPrefill('テスト引き継ぎ内容');
    expect(consumeContactPrefill()).toBe('テスト引き継ぎ内容');
    expect(consumeContactPrefill()).toBeNull(); // 一度だけ
  });
});
