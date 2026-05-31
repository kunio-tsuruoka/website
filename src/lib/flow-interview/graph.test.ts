import type { FlowDiagram, FlowStep } from '@/features/flow-mapper/types';
import { describe, expect, test } from 'vitest';
import { type FlowNode, MAX_USER_TURNS, transition, wantsToFinish } from './graph';

function step(over: Partial<FlowStep> = {}): FlowStep {
  return {
    id: `s_${Math.random().toString(36).slice(2, 7)}`,
    type: over.type ?? 'task',
    laneId: over.laneId ?? 'l1',
    phaseId: 'p1',
    label: over.label ?? 'x',
    durationMin: over.durationMin ?? 0,
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
const opt = (finish = false, turns = 1) => ({ finish, turns });

describe('wantsToFinish', () => {
  test('完了意図フレーズを検出', () => {
    for (const m of ['そちらで考えて', 'おまかせ', 'これで作って', 'もういい', '適当に'])
      expect(wantsToFinish([{ role: 'user', content: m }]), m).toBe(true);
  });
  test('通常の業務説明は検出しない', () => {
    expect(wantsToFinish([{ role: 'user', content: '営業がExcelに入力します' }])).toBe(false);
  });
});

describe('transition (state machine)', () => {
  test('完了意図はどのノードからでも done', () => {
    expect(transition('overview', diagram([]), opt(true))).toBe('done');
    expect(transition('steps', diagram([step()]), opt(true))).toBe('done');
  });
  test('往復上限で done', () => {
    expect(transition('overview', diagram([step()]), opt(false, MAX_USER_TURNS))).toBe('done');
  });
  test('overview: 情報不足なら留まる / 業務名+手順が出たら steps', () => {
    expect(transition('overview', diagram([], 0, '業務フロー'), opt())).toBe('overview');
    expect(transition('overview', diagram([step()]), opt())).toBe('steps');
  });
  test('steps: 3手順そろうと担当数で分岐（1→actors）', () => {
    expect(transition('steps', diagram([step(), step(), step()], 1), opt())).toBe('actors');
  });
  test('steps: 3手順+2担当+時間未収集 → duration', () => {
    const d = diagram([step(), step(), step()], 2);
    expect(transition('steps', d, opt())).toBe('duration');
  });
  test('actors: 一度通過したら前進。時間未収集なら duration', () => {
    expect(transition('actors', diagram([step(), step(), step()], 2), opt())).toBe('duration');
  });
  test('actors: 時間が揃っていれば done', () => {
    const d = diagram(
      [step({ durationMin: 30 }), step({ durationMin: 60 }), step({ durationMin: 10 })],
      2
    );
    expect(transition('actors', d, opt())).toBe('done');
  });
  test('duration: 一度聞いたら done', () => {
    expect(transition('duration', diagram([step(), step(), step()], 2), opt())).toBe('done');
  });
  test('done は done のまま', () => {
    expect(transition('done', diagram([step()]), opt())).toBe('done');
  });
});
