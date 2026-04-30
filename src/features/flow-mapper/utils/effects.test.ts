import { describe, expect, test } from 'vitest';
import type { FlowDiagram, FlowLane, FlowStep } from '../types';
import { computeStepEffects } from './effects';

const lanes: FlowLane[] = [
  { id: 'l1', name: '営業', rateYenPerHour: 6000 }, // 1分=100円
  { id: 'l2', name: '事務', rateYenPerHour: 3000 }, // 1分=50円
];

function makeStep(overrides: Partial<FlowStep> & { id: string }): FlowStep {
  return {
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

function makeDiagram(steps: FlowStep[]): FlowDiagram {
  return {
    title: 't',
    phases: [{ id: 'p1', name: 'P1' }],
    lanes,
    steps,
  };
}

describe('computeStepEffects', () => {
  test('同じ id の作業を突き合わせて差分を出す（時間削減）', () => {
    const asIs = makeDiagram([makeStep({ id: 's1', durationMin: 60 })]);
    const toBe = makeDiagram([makeStep({ id: 's1', durationMin: 30 })]);
    const rows = computeStepEffects(asIs, toBe);
    expect(rows).toHaveLength(1);
    expect(rows[0].stepId).toBe('s1');
    expect(rows[0].asIsMin).toBe(60);
    expect(rows[0].toBeMin).toBe(30);
    expect(rows[0].deltaMin).toBe(-30);
    // 60min × 100円/min = 6000、 30min × 100円/min = 3000、差 -3000
    expect(rows[0].asIsYen).toBe(6000);
    expect(rows[0].toBeYen).toBe(3000);
    expect(rows[0].deltaYen).toBe(-3000);
    expect(rows[0].status).toBe('kept');
  });

  test('To-Be だけにある作業は status: added、As-Is 側は0', () => {
    const asIs = makeDiagram([makeStep({ id: 's1', durationMin: 60 })]);
    const toBe = makeDiagram([
      makeStep({ id: 's1', durationMin: 60 }),
      makeStep({ id: 's2', durationMin: 10, label: '新作業' }),
    ]);
    const rows = computeStepEffects(asIs, toBe);
    const added = rows.find((r) => r.stepId === 's2');
    expect(added).toBeDefined();
    expect(added?.status).toBe('added');
    expect(added?.asIsMin).toBe(0);
    expect(added?.asIsYen).toBe(0);
    expect(added?.toBeMin).toBe(10);
    expect(added?.deltaMin).toBe(10);
    expect(added?.deltaYen).toBeGreaterThan(0);
  });

  test('As-Is だけにある作業は status: removed（廃止＝マイナス効果）', () => {
    const asIs = makeDiagram([
      makeStep({ id: 's1', durationMin: 60 }),
      makeStep({ id: 's2', durationMin: 30, label: '消える作業' }),
    ]);
    const toBe = makeDiagram([makeStep({ id: 's1', durationMin: 60 })]);
    const rows = computeStepEffects(asIs, toBe);
    const removed = rows.find((r) => r.stepId === 's2');
    expect(removed?.status).toBe('removed');
    expect(removed?.asIsMin).toBe(30);
    expect(removed?.toBeMin).toBe(0);
    expect(removed?.deltaMin).toBe(-30);
    expect(removed?.deltaYen).toBeLessThan(0); // 廃止＝削減
  });

  test('レーン変更（時給ダウン）でコスト削減が出る', () => {
    // 同じ60分でも、l1（100円/min）→l2（50円/min）に移すと
    // 6000 → 3000、差 -3000
    const asIs = makeDiagram([makeStep({ id: 's1', durationMin: 60, laneId: 'l1' })]);
    const toBe = makeDiagram([makeStep({ id: 's1', durationMin: 60, laneId: 'l2' })]);
    const rows = computeStepEffects(asIs, toBe);
    expect(rows[0].deltaMin).toBe(0);
    expect(rows[0].deltaYen).toBe(-3000);
  });

  test('改善幅の大きい順（deltaYen 昇順）にソートされる', () => {
    const asIs = makeDiagram([
      makeStep({ id: 'big', durationMin: 100 }), // -10000円削減予定
      makeStep({ id: 'small', durationMin: 20 }), // -2000円削減予定
      makeStep({ id: 'none', durationMin: 30 }), // 変化なし
    ]);
    const toBe = makeDiagram([
      makeStep({ id: 'big', durationMin: 0 }),
      makeStep({ id: 'small', durationMin: 0 }),
      makeStep({ id: 'none', durationMin: 30 }),
    ]);
    const rows = computeStepEffects(asIs, toBe);
    expect(rows.map((r) => r.stepId)).toEqual(['big', 'small', 'none']);
  });

  test('無限・NaN の durationMin は 0 として扱う', () => {
    const asIs = makeDiagram([makeStep({ id: 's1', durationMin: Number.NaN })]);
    const toBe = makeDiagram([makeStep({ id: 's1', durationMin: 30 })]);
    const rows = computeStepEffects(asIs, toBe);
    expect(rows[0].asIsMin).toBe(0);
    expect(rows[0].asIsYen).toBe(0);
    expect(rows[0].deltaMin).toBe(30);
  });

  test('空フローは空配列', () => {
    expect(computeStepEffects(makeDiagram([]), makeDiagram([]))).toEqual([]);
  });

  test('同 id でも label は To-Be 側を採用（rename対応）', () => {
    const asIs = makeDiagram([makeStep({ id: 's1', label: '旧名' })]);
    const toBe = makeDiagram([makeStep({ id: 's1', label: '新名' })]);
    const rows = computeStepEffects(asIs, toBe);
    expect(rows[0].label).toBe('新名');
  });

  test('id がズレている（To-Be をゼロから組み直した）ケースは added/removed として並ぶ', () => {
    // 同じ label でも id が違うと突き合わせできず、As-Is 側はすべて removed、
    // To-Be 側はすべて added になる。これは「As-Isをコピー」してから編集することを
    // ユーザーに促す前提の挙動。
    const asIs = makeDiagram([makeStep({ id: 'old1', durationMin: 60, label: '同じ作業' })]);
    const toBe = makeDiagram([makeStep({ id: 'new1', durationMin: 30, label: '同じ作業' })]);
    const rows = computeStepEffects(asIs, toBe);
    expect(rows).toHaveLength(2);
    const removed = rows.find((r) => r.stepId === 'old1');
    const added = rows.find((r) => r.stepId === 'new1');
    expect(removed?.status).toBe('removed');
    expect(removed?.toBeMin).toBe(0);
    expect(added?.status).toBe('added');
    expect(added?.asIsMin).toBe(0);
    // 結果として「2件の変化」として現れ、「30分削減」とは認識されない（既知の制約）
  });
});
