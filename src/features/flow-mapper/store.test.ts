import { beforeEach, describe, expect, test } from 'vitest';
import { unwrapPersistedValue, useFlowStore } from './store';
import type { FlowDiagram, FlowStep } from './types';

describe('unwrapPersistedValue', () => {
  test('null はそのまま null', () => {
    expect(unwrapPersistedValue(null)).toBeNull();
  });

  test('壊れた JSON は null に倒して初期値にフォールバック', () => {
    expect(unwrapPersistedValue('{not-json')).toBeNull();
  });

  test('zustand 形状 ({ state, version }) はそのまま素通し', () => {
    const wrapped = JSON.stringify({
      state: {
        asIs: { title: 'a', phases: [], lanes: [{ id: 'l1', name: 'A' }], steps: [] },
        toBe: { title: 'b', phases: [], lanes: [{ id: 'l1', name: 'A' }], steps: [] },
      },
      version: 0,
    });
    expect(unwrapPersistedValue(wrapped)).toBe(wrapped);
  });

  test('旧形状 (bare { asIs, toBe }) は { state, version } に詰め替えられる', () => {
    const legacy = JSON.stringify({
      asIs: {
        title: '現状',
        phases: [{ id: 'p1', name: '①' }],
        lanes: [{ id: 'l1', name: '担当者A' }],
        steps: [],
      },
      toBe: {
        title: '改善後',
        phases: [{ id: 'p1', name: '①' }],
        lanes: [{ id: 'l1', name: '担当者A' }],
        steps: [],
      },
    });
    const out = unwrapPersistedValue(legacy);
    expect(out).not.toBeNull();
    const parsed = JSON.parse(out as string);
    expect(parsed.version).toBe(0);
    expect(parsed.state.asIs.title).toBe('現状');
    expect(parsed.state.toBe.title).toBe('改善後');
    expect(parsed.state.asIs.lanes[0].name).toBe('担当者A');
  });

  test('lanes が無い空オブジェクトは旧形状とは判定されず素通し', () => {
    const raw = JSON.stringify({ asIs: {}, toBe: {} });
    expect(unwrapPersistedValue(raw)).toBe(raw);
  });
});

// swapSteps: 別レーン／別フェーズの作業をドラッグで重ねたとき、(laneId, phaseId) を入れ替える。
// `next`（接続）はステップに紐づいて移動するので、矢印関係はそのまま温存される。
function makeStep(overrides: Partial<FlowStep> & { id: string }): FlowStep {
  return {
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
    phases: [
      { id: 'p1', name: 'P1' },
      { id: 'p2', name: 'P2' },
    ],
    lanes: [
      { id: 'l1', name: 'L1', rateYenPerHour: 6000 },
      { id: 'l2', name: 'L2', rateYenPerHour: 3000 },
    ],
    steps,
  };
}

describe('swapSteps', () => {
  beforeEach(() => {
    useFlowStore.setState({
      asIs: makeDiagram([]),
      toBe: makeDiagram([]),
      editingId: null,
    });
  });

  test('別レーン・別フェーズの作業の (laneId, phaseId) が入れ替わる', () => {
    const a = makeStep({ id: 'a', laneId: 'l1', phaseId: 'p1', label: 'A' });
    const b = makeStep({ id: 'b', laneId: 'l2', phaseId: 'p2', label: 'B' });
    useFlowStore.setState({ asIs: makeDiagram([a, b]) });

    useFlowStore.getState().swapSteps('asIs', 'a', 'b');
    const after = useFlowStore.getState().asIs.steps;
    const aAfter = after.find((s) => s.id === 'a');
    const bAfter = after.find((s) => s.id === 'b');
    expect(aAfter?.laneId).toBe('l2');
    expect(aAfter?.phaseId).toBe('p2');
    expect(bAfter?.laneId).toBe('l1');
    expect(bAfter?.phaseId).toBe('p1');
  });

  test('同一 ID への swap は no-op', () => {
    const a = makeStep({ id: 'a', laneId: 'l1', phaseId: 'p1' });
    const before = makeDiagram([a]);
    useFlowStore.setState({ asIs: before });
    useFlowStore.getState().swapSteps('asIs', 'a', 'a');
    expect(useFlowStore.getState().asIs.steps[0].laneId).toBe('l1');
    expect(useFlowStore.getState().asIs.steps[0].phaseId).toBe('p1');
  });

  test('存在しない id を渡しても何もしない（クラッシュしない）', () => {
    const a = makeStep({ id: 'a', laneId: 'l1', phaseId: 'p1' });
    useFlowStore.setState({ asIs: makeDiagram([a]) });
    useFlowStore.getState().swapSteps('asIs', 'a', 'ghost');
    expect(useFlowStore.getState().asIs.steps[0].laneId).toBe('l1');
  });

  test('next（接続）はステップに紐づいて移動する＝矢印関係が壊れない', () => {
    // a → b の接続。swap後も a.next には b.id が残るので、
    // 「lane/phase が入れ替わった a が b を指す」という矢印が継続する。
    const a = makeStep({ id: 'a', laneId: 'l1', phaseId: 'p1', next: ['b'] });
    const b = makeStep({ id: 'b', laneId: 'l2', phaseId: 'p2' });
    useFlowStore.setState({ asIs: makeDiagram([a, b]) });
    useFlowStore.getState().swapSteps('asIs', 'a', 'b');
    const aAfter = useFlowStore.getState().asIs.steps.find((s) => s.id === 'a');
    expect(aAfter?.next).toEqual(['b']);
  });

  test('asIs と toBe は独立（toBe 側を swap しても asIs は変わらない）', () => {
    const a = makeStep({ id: 'a', laneId: 'l1', phaseId: 'p1' });
    const b = makeStep({ id: 'b', laneId: 'l2', phaseId: 'p2' });
    useFlowStore.setState({
      asIs: makeDiagram([a, b]),
      toBe: makeDiagram([{ ...a }, { ...b }]),
    });
    useFlowStore.getState().swapSteps('toBe', 'a', 'b');
    const asIs = useFlowStore.getState().asIs.steps;
    expect(asIs.find((s) => s.id === 'a')?.laneId).toBe('l1');
    expect(asIs.find((s) => s.id === 'a')?.phaseId).toBe('p1');
    const toBe = useFlowStore.getState().toBe.steps;
    expect(toBe.find((s) => s.id === 'a')?.laneId).toBe('l2');
    expect(toBe.find((s) => s.id === 'a')?.phaseId).toBe('p2');
  });

  test('同レーン・同フェーズ間の swap は座標的には変化しない（laneId/phaseId が同値）', () => {
    const a = makeStep({ id: 'a', laneId: 'l1', phaseId: 'p1' });
    const b = makeStep({ id: 'b', laneId: 'l1', phaseId: 'p1' });
    useFlowStore.setState({ asIs: makeDiagram([a, b]) });
    useFlowStore.getState().swapSteps('asIs', 'a', 'b');
    const after = useFlowStore.getState().asIs.steps;
    expect(after.find((s) => s.id === 'a')?.laneId).toBe('l1');
    expect(after.find((s) => s.id === 'b')?.phaseId).toBe('p1');
  });

  test('双方向接続 (a↔b) でも next 配列はそのまま温存される', () => {
    const a = makeStep({ id: 'a', laneId: 'l1', phaseId: 'p1', next: ['b'] });
    const b = makeStep({ id: 'b', laneId: 'l2', phaseId: 'p2', next: ['a'] });
    useFlowStore.setState({ asIs: makeDiagram([a, b]) });
    useFlowStore.getState().swapSteps('asIs', 'a', 'b');
    const after = useFlowStore.getState().asIs.steps;
    expect(after.find((s) => s.id === 'a')?.next).toEqual(['b']);
    expect(after.find((s) => s.id === 'b')?.next).toEqual(['a']);
  });
});

describe('addStep auto-link', () => {
  beforeEach(() => {
    useFlowStore.setState({
      asIs: makeDiagram([]),
      toBe: makeDiagram([]),
      editingId: null,
    });
  });

  test('toolbar 経由（laneId/phaseId 未指定）で2件追加すると、最初のステップから2件目へ自動接続される', () => {
    useFlowStore.getState().addStep('asIs', undefined, undefined, 'task');
    useFlowStore.getState().addStep('asIs', undefined, undefined, 'task');
    const steps = useFlowStore.getState().asIs.steps;
    expect(steps).toHaveLength(2);
    expect(steps[0].next).toContain(steps[1].id);
  });

  test('1件目が end 種別なら自動接続されない', () => {
    useFlowStore.getState().addStep('asIs', undefined, undefined, 'end');
    useFlowStore.getState().addStep('asIs', undefined, undefined, 'task');
    const steps = useFlowStore.getState().asIs.steps;
    expect(steps[0].next).toEqual([]);
  });

  test('セル指定で追加（laneId/phaseId を渡す）した場合は自動接続されない', () => {
    useFlowStore.getState().addStep('asIs', 'l1', 'p1', 'task');
    useFlowStore.getState().addStep('asIs', 'l2', 'p2', 'task');
    const steps = useFlowStore.getState().asIs.steps;
    expect(steps[0].next).toEqual([]);
  });

  test('1件目に既に next がある場合は自動接続されない', () => {
    const seed = makeStep({ id: 'seed', next: ['ghost'] });
    useFlowStore.setState({ asIs: makeDiagram([seed]) });
    useFlowStore.getState().addStep('asIs', undefined, undefined, 'task');
    const steps = useFlowStore.getState().asIs.steps;
    // seed.next は ['ghost'] のまま、新規追加分への自動接続はしない
    expect(steps[0].next).toEqual(['ghost']);
  });
});

describe('moveStep insert position', () => {
  beforeEach(() => {
    useFlowStore.setState({
      asIs: makeDiagram([]),
      toBe: makeDiagram([]),
      editingId: null,
    });
  });

  test('beforeStepId 指定でその直前に挿入される', () => {
    const a = makeStep({ id: 'a' });
    const b = makeStep({ id: 'b' });
    const c = makeStep({ id: 'c' });
    useFlowStore.setState({ asIs: makeDiagram([a, b, c]) });
    useFlowStore.getState().moveStep('asIs', 'c', 'l1', 'p1', 'b');
    const ids = useFlowStore.getState().asIs.steps.map((s) => s.id);
    // c は b の直前へ → [a, c, b]
    expect(ids).toEqual(['a', 'c', 'b']);
  });

  test('beforeStepId 未指定（null/undefined）は末尾に追加', () => {
    const a = makeStep({ id: 'a' });
    const b = makeStep({ id: 'b' });
    const c = makeStep({ id: 'c' });
    useFlowStore.setState({ asIs: makeDiagram([a, b, c]) });
    useFlowStore.getState().moveStep('asIs', 'a', 'l1', 'p1', null);
    const ids = useFlowStore.getState().asIs.steps.map((s) => s.id);
    // a は末尾へ → [b, c, a]
    expect(ids).toEqual(['b', 'c', 'a']);
  });

  test('存在しない beforeStepId は末尾扱い（クラッシュしない）', () => {
    const a = makeStep({ id: 'a' });
    const b = makeStep({ id: 'b' });
    useFlowStore.setState({ asIs: makeDiagram([a, b]) });
    useFlowStore.getState().moveStep('asIs', 'a', 'l1', 'p1', 'ghost');
    const ids = useFlowStore.getState().asIs.steps.map((s) => s.id);
    expect(ids).toEqual(['b', 'a']);
  });

  test('別レーン・別フェーズへの移動でも laneId/phaseId が反映される', () => {
    const a = makeStep({ id: 'a', laneId: 'l1', phaseId: 'p1' });
    useFlowStore.setState({ asIs: makeDiagram([a]) });
    useFlowStore.getState().moveStep('asIs', 'a', 'l2', 'p2', null);
    const after = useFlowStore.getState().asIs.steps[0];
    expect(after.laneId).toBe('l2');
    expect(after.phaseId).toBe('p2');
  });
});
