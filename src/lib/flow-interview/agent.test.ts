import type { FlowDiagram, FlowStep } from '@/features/flow-mapper/types';
import { describe, expect, test } from 'vitest';
import { computeCoverage, wantsToFinish } from './agent';

function step(type: FlowStep['type'], label = 'x'): FlowStep {
  return {
    id: `s_${Math.random().toString(36).slice(2, 7)}`,
    type,
    laneId: 'l1',
    phaseId: 'p1',
    label,
    durationMin: 0,
    tool: '',
    pain: '',
    improvement: '',
    next: [],
  };
}
function diagram(steps: FlowStep[], lanes = 1, title = '請求業務'): FlowDiagram {
  return {
    title,
    phases: [{ id: 'p1', name: 'フロー' }],
    lanes: Array.from({ length: lanes }, (_, i) => ({ id: `l${i + 1}`, name: `担当${i + 1}` })),
    steps,
  };
}

describe('wantsToFinish', () => {
  test('完了意図フレーズを検出する', () => {
    for (const msg of [
      '順序はそちらで考えて',
      'おまかせします',
      'これで作って',
      'もういいよ',
      '適当にお願い',
    ]) {
      expect(wantsToFinish([{ role: 'user', content: msg }]), msg).toBe(true);
    }
  });
  test('通常の業務説明は完了意図と判定しない', () => {
    expect(wantsToFinish([{ role: 'user', content: '営業がExcelに売上を入力します' }])).toBe(false);
  });
  test('直近のユーザー発言だけを見る', () => {
    const h = [
      { role: 'user' as const, content: 'これで作って' },
      { role: 'assistant' as const, content: '...' },
      { role: 'user' as const, content: '経理が処理します' },
    ];
    expect(wantsToFinish(h)).toBe(false);
  });
});

describe('computeCoverage', () => {
  test('ステップ0なら全体像を聞く・未完成', () => {
    const c = computeCoverage(diagram([], 0, '業務フロー'));
    expect(c.ready).toBe(false);
    expect(c.nextAspect).toContain('全体像');
  });
  test('start〜endが揃い3ステップ以上なら完成可能', () => {
    const c = computeCoverage(diagram([step('start'), step('task'), step('end')], 2));
    expect(c.hasStart).toBe(true);
    expect(c.hasEnd).toBe(true);
    expect(c.nextAspect).toBeNull();
    expect(c.ready).toBe(true);
  });
  test('start/end type が無くても3ステップ以上あれば完成可能（LLMはtype付けを省きがちなため）', () => {
    const c = computeCoverage(diagram([step('task'), step('task'), step('task')], 1));
    expect(c.ready).toBe(true);
    expect(c.nextAspect).toBeNull();
  });
  test('ステップが少なければ手順を聞く', () => {
    const c = computeCoverage(diagram([step('start'), step('task')], 1));
    expect(c.ready).toBe(false);
    expect(c.nextAspect).toContain('手順');
  });
});
