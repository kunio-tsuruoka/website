import { describe, expect, test } from 'vitest';
import type { FlowDiagram, FlowLane, FlowStep } from '../types';
import {
  computeAggregates,
  stepCost,
  stepCostMode,
  stepLaborCost,
  stepVariableCost,
  totalMinutes,
} from './cost';

const lanes: FlowLane[] = [
  { id: 'l1', name: '営業', rateYenPerHour: 4500 },
  { id: 'l2', name: '事務', rateYenPerHour: 3000 },
  { id: 'l3', name: '顧客', rateYenPerHour: 0 },
];

function makeStep(overrides: Partial<FlowStep>): FlowStep {
  return {
    id: overrides.id ?? 's1',
    type: 'task',
    laneId: 'l1',
    phaseId: 'p1',
    label: 'step',
    durationMin: 60,
    tool: '',
    pain: '',
    improvement: '',
    next: [],
    ...overrides,
  };
}

describe('stepLaborCost', () => {
  test('時給×時間で計算', () => {
    expect(stepLaborCost(makeStep({ laneId: 'l1', durationMin: 60 }), lanes)).toBe(4500);
    expect(stepLaborCost(makeStep({ laneId: 'l1', durationMin: 30 }), lanes)).toBe(2250);
    expect(stepLaborCost(makeStep({ laneId: 'l2', durationMin: 120 }), lanes)).toBe(6000);
  });

  test('時給0なら人件費0', () => {
    expect(stepLaborCost(makeStep({ laneId: 'l3', durationMin: 60 }), lanes)).toBe(0);
  });

  test('レーンが無い場合は0扱い', () => {
    expect(stepLaborCost(makeStep({ laneId: 'unknown', durationMin: 60 }), lanes)).toBe(0);
  });
});

describe('stepVariableCost', () => {
  test('個数 × 単価で計算', () => {
    expect(stepVariableCost(makeStep({ quantity: 100, unitCostYen: 5 }))).toBe(500);
    expect(stepVariableCost(makeStep({ quantity: 50, unitCostYen: 200 }))).toBe(10000);
  });

  test('片方が未定義なら0', () => {
    expect(stepVariableCost(makeStep({ quantity: 100 }))).toBe(0);
    expect(stepVariableCost(makeStep({ unitCostYen: 5 }))).toBe(0);
    expect(stepVariableCost(makeStep({}))).toBe(0);
  });
});

describe('stepCost', () => {
  test('人件費 + 個数×単価', () => {
    const s = makeStep({ laneId: 'l1', durationMin: 60, quantity: 100, unitCostYen: 5 });
    expect(stepCost(s, lanes)).toBe(4500 + 500);
  });
});

describe('stepCostMode', () => {
  test('未指定時は both', () => {
    expect(stepCostMode(makeStep({}))).toBe('both');
  });

  test('明示指定はそのまま', () => {
    expect(stepCostMode(makeStep({ costMode: 'labor' }))).toBe('labor');
    expect(stepCostMode(makeStep({ costMode: 'variable' }))).toBe('variable');
    expect(stepCostMode(makeStep({ costMode: 'both' }))).toBe('both');
  });
});

describe('costMode 反映', () => {
  test("costMode='labor' は人件費のみ（個数×単価は0）", () => {
    const s = makeStep({
      laneId: 'l1',
      durationMin: 60,
      quantity: 100,
      unitCostYen: 5,
      costMode: 'labor',
    });
    expect(stepLaborCost(s, lanes)).toBe(4500);
    expect(stepVariableCost(s)).toBe(0);
    expect(stepCost(s, lanes)).toBe(4500);
  });

  test("costMode='variable' は個数×単価のみ（人件費は0）", () => {
    const s = makeStep({
      laneId: 'l1',
      durationMin: 60,
      quantity: 100,
      unitCostYen: 5,
      costMode: 'variable',
    });
    expect(stepLaborCost(s, lanes)).toBe(0);
    expect(stepVariableCost(s)).toBe(500);
    expect(stepCost(s, lanes)).toBe(500);
  });

  test("costMode='both' は両方加算（既定動作）", () => {
    const s = makeStep({
      laneId: 'l1',
      durationMin: 60,
      quantity: 100,
      unitCostYen: 5,
      costMode: 'both',
    });
    expect(stepCost(s, lanes)).toBe(4500 + 500);
  });
});

describe('totalMinutes', () => {
  test('全ステップの所要時間合計', () => {
    const d: FlowDiagram = {
      title: 't',
      phases: [{ id: 'p1', name: 'P1' }],
      lanes,
      steps: [
        makeStep({ id: 's1', durationMin: 15 }),
        makeStep({ id: 's2', durationMin: 30 }),
        makeStep({ id: 's3', durationMin: 45 }),
      ],
    };
    expect(totalMinutes(d)).toBe(90);
  });

  test('NaN や Infinity は0扱い', () => {
    const d: FlowDiagram = {
      title: 't',
      phases: [],
      lanes,
      steps: [
        makeStep({ id: 's1', durationMin: 15 }),
        makeStep({ id: 's2', durationMin: Number.NaN }),
        makeStep({ id: 's3', durationMin: Number.POSITIVE_INFINITY }),
      ],
    };
    expect(totalMinutes(d)).toBe(15);
  });
});

describe('computeAggregates', () => {
  const diagram: FlowDiagram = {
    title: 't',
    phases: [
      { id: 'p1', name: '受注' },
      { id: 'p2', name: '出荷' },
    ],
    lanes,
    steps: [
      makeStep({ id: 's1', laneId: 'l1', phaseId: 'p1', durationMin: 60 }), // 4500
      makeStep({ id: 's2', laneId: 'l2', phaseId: 'p1', durationMin: 30 }), // 1500
      makeStep({
        id: 's3',
        laneId: 'l1',
        phaseId: 'p2',
        durationMin: 30,
        quantity: 10,
        unitCostYen: 100,
      }), // 2250 + 1000 = 3250
    ],
  };

  test('合計時間とコスト', () => {
    const agg = computeAggregates(diagram);
    expect(agg.totalMinutes).toBe(120);
    expect(agg.totalYen).toBe(4500 + 1500 + 3250);
  });

  test('フェーズ別集計', () => {
    const agg = computeAggregates(diagram);
    const p1 = agg.byPhase.find((p) => p.name === '受注');
    const p2 = agg.byPhase.find((p) => p.name === '出荷');
    expect(p1).toEqual({ name: '受注', minutes: 90, yen: 6000, stepCount: 2 });
    expect(p2).toEqual({ name: '出荷', minutes: 30, yen: 3250, stepCount: 1 });
  });

  test('担当別集計', () => {
    const agg = computeAggregates(diagram);
    const l1 = agg.byLane.find((l) => l.name === '営業');
    const l2 = agg.byLane.find((l) => l.name === '事務');
    expect(l1?.minutes).toBe(90);
    expect(l1?.yen).toBe(4500 + 3250);
    expect(l2?.minutes).toBe(30);
    expect(l2?.yen).toBe(1500);
  });

  test('ボトルネックはコスト降順', () => {
    const agg = computeAggregates(diagram);
    expect(agg.topSteps[0].id).toBe('s1'); // 4500
    expect(agg.topSteps[1].id).toBe('s3'); // 3250
    expect(agg.topSteps[2].id).toBe('s2'); // 1500
  });

  test('コスト同値なら時間降順', () => {
    const d: FlowDiagram = {
      title: 't',
      phases: [{ id: 'p1', name: 'P1' }],
      lanes: [{ id: 'l3', name: 'X', rateYenPerHour: 0 }],
      steps: [
        makeStep({ id: 's1', laneId: 'l3', phaseId: 'p1', durationMin: 30 }),
        makeStep({ id: 's2', laneId: 'l3', phaseId: 'p1', durationMin: 60 }),
      ],
    };
    const agg = computeAggregates(d);
    expect(agg.topSteps[0].id).toBe('s2'); // 60分が先頭
  });
});
