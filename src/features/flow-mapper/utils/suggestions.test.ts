import { describe, expect, test } from 'vitest';
import type { FlowDiagram, FlowStep } from '../types';
import { SOLUTIONS, suggestImprovements } from './suggestions';

function makeStep(overrides: Partial<FlowStep>): FlowStep {
  return {
    id: overrides.id ?? 's1',
    type: 'task',
    laneId: 'l1',
    phaseId: 'p1',
    label: 'step',
    durationMin: 10,
    tool: '',
    pain: '',
    improvement: '',
    next: [],
    ...overrides,
  };
}

function makeDiagram(steps: FlowStep[]): FlowDiagram {
  return {
    title: 't',
    phases: [{ id: 'p1', name: 'P1' }],
    lanes: [{ id: 'l1', name: 'L1', rateYenPerHour: 0 }],
    steps,
  };
}

describe('suggestImprovements - automation', () => {
  test('Excelツール × 10分以上 → automation', () => {
    const d = makeDiagram([makeStep({ id: 's1', tool: 'Excel', durationMin: 15, label: '転記' })]);
    const sugs = suggestImprovements(d);
    expect(sugs.some((s) => s.kind === 'automation' && s.stepId === 's1')).toBe(true);
  });

  test('電話/FAX/紙/手書き/転記 もマッチ', () => {
    const tools = ['電話', 'FAX', '紙', '手書き', '転記', '印刷'];
    for (const tool of tools) {
      const d = makeDiagram([makeStep({ id: 's1', tool, durationMin: 15 })]);
      const sugs = suggestImprovements(d);
      expect(sugs.some((s) => s.kind === 'automation')).toBe(true);
    }
  });

  test('10分未満は対象外', () => {
    const d = makeDiagram([makeStep({ id: 's1', tool: 'Excel', durationMin: 5 })]);
    const sugs = suggestImprovements(d);
    expect(sugs.some((s) => s.kind === 'automation')).toBe(false);
  });

  test('label にパターンが含まれていてもマッチ', () => {
    const d = makeDiagram([makeStep({ id: 's1', label: 'Excelに転記', durationMin: 15 })]);
    const sugs = suggestImprovements(d);
    expect(sugs.some((s) => s.kind === 'automation')).toBe(true);
  });
});

describe('suggestImprovements - ai (decision)', () => {
  test('判断ステップは原則すべて AI 候補', () => {
    const d = makeDiagram([makeStep({ id: 's1', type: 'decision', label: '在庫あり？' })]);
    const sugs = suggestImprovements(d);
    expect(sugs.some((s) => s.kind === 'ai' && s.stepId === 's1')).toBe(true);
  });

  test('decision でないなら ai 候補は出ない', () => {
    const d = makeDiagram([makeStep({ id: 's1', type: 'task', label: '判断' })]);
    const sugs = suggestImprovements(d);
    expect(sugs.some((s) => s.kind === 'ai')).toBe(false);
  });
});

describe('suggestImprovements - parallel (wait)', () => {
  test('待ちステップで時間ありなら parallel 候補', () => {
    const d = makeDiagram([makeStep({ id: 's1', type: 'wait', durationMin: 30 })]);
    const sugs = suggestImprovements(d);
    expect(sugs.some((s) => s.kind === 'parallel')).toBe(true);
  });

  test('待ちでも時間0なら出さない', () => {
    const d = makeDiagram([makeStep({ id: 's1', type: 'wait', durationMin: 0 })]);
    const sugs = suggestImprovements(d);
    expect(sugs.some((s) => s.kind === 'parallel')).toBe(false);
  });
});

describe('suggestImprovements - priority (pain)', () => {
  test('pain あれば priority', () => {
    const d = makeDiagram([makeStep({ id: 's1', pain: '転記ミス月3件' })]);
    const sugs = suggestImprovements(d);
    expect(sugs.some((s) => s.kind === 'priority')).toBe(true);
  });

  test('pain 空白のみは対象外', () => {
    const d = makeDiagram([makeStep({ id: 's1', pain: '   ' })]);
    const sugs = suggestImprovements(d);
    expect(sugs.some((s) => s.kind === 'priority')).toBe(false);
  });
});

describe('suggestImprovements - tool (未設定)', () => {
  test('task型 ＋ tool 未設定 ＋ 5分以上 で tool 候補', () => {
    const d = makeDiagram([makeStep({ id: 's1', type: 'task', tool: '', durationMin: 10 })]);
    const sugs = suggestImprovements(d);
    expect(sugs.some((s) => s.kind === 'tool')).toBe(true);
  });

  test('5分未満は出さない', () => {
    const d = makeDiagram([makeStep({ id: 's1', type: 'task', tool: '', durationMin: 4 })]);
    const sugs = suggestImprovements(d);
    expect(sugs.some((s) => s.kind === 'tool')).toBe(false);
  });

  test('tool 設定済みなら出さない', () => {
    const d = makeDiagram([makeStep({ id: 's1', type: 'task', tool: 'Slack', durationMin: 10 })]);
    const sugs = suggestImprovements(d);
    expect(sugs.some((s) => s.kind === 'tool')).toBe(false);
  });
});

describe('SOLUTIONS', () => {
  test('automation/ai/parallel に候補がある', () => {
    expect(SOLUTIONS.automation.length).toBeGreaterThan(0);
    expect(SOLUTIONS.ai.length).toBeGreaterThan(0);
    expect(SOLUTIONS.parallel.length).toBeGreaterThan(0);
  });

  test('priority と tool は候補なし（情報のみ）', () => {
    expect(SOLUTIONS.priority).toHaveLength(0);
    expect(SOLUTIONS.tool).toHaveLength(0);
  });

  test('全ソリューションに reductionPct (0-100), reductionRange, examples が定義されている', () => {
    for (const kind of ['automation', 'ai', 'parallel'] as const) {
      for (const sol of SOLUTIONS[kind]) {
        expect(sol.name).toBeTruthy();
        expect(sol.description).toBeTruthy();
        expect(sol.examples).toBeTruthy();
        expect(sol.reductionPct).toBeGreaterThanOrEqual(0);
        expect(sol.reductionPct).toBeLessThanOrEqual(100);
        expect(sol.reductionRange).toMatch(/\d+〜\d+%/);
      }
    }
  });
});
