// As-Is と To-Be を step.id で突き合わせて、作業（ステップ）単位の削減効果を返す純粋関数。
// 片側にしか存在しない id は status: 'added' / 'removed'。
// ImpactPanel の「作業別 削減効果」テーブル用。

import type { FlowDiagram } from '../types';
import { stepCost } from './cost';

export type StepEffectRow = {
  stepId: string;
  label: string;
  asIsMin: number;
  asIsYen: number;
  toBeMin: number;
  toBeYen: number;
  deltaMin: number;
  deltaYen: number;
  status: 'kept' | 'added' | 'removed';
};

export function computeStepEffects(asIs: FlowDiagram, toBe: FlowDiagram): StepEffectRow[] {
  const seen = new Map<
    string,
    { label: string; asIs: { m: number; y: number } | null; toBe: { m: number; y: number } | null }
  >();
  for (const s of asIs.steps) {
    const m = Number.isFinite(s.durationMin) ? s.durationMin : 0;
    const y = stepCost(s, asIs.lanes);
    seen.set(s.id, { label: s.label, asIs: { m, y }, toBe: null });
  }
  for (const s of toBe.steps) {
    const m = Number.isFinite(s.durationMin) ? s.durationMin : 0;
    const y = stepCost(s, toBe.lanes);
    const prev = seen.get(s.id);
    if (prev) {
      prev.toBe = { m, y };
      prev.label = s.label;
    } else {
      seen.set(s.id, { label: s.label, asIs: null, toBe: { m, y } });
    }
  }
  const rows: StepEffectRow[] = [];
  for (const [stepId, meta] of seen) {
    const a = meta.asIs ?? { m: 0, y: 0 };
    const b = meta.toBe ?? { m: 0, y: 0 };
    rows.push({
      stepId,
      label: meta.label,
      asIsMin: a.m,
      asIsYen: a.y,
      toBeMin: b.m,
      toBeYen: b.y,
      deltaMin: b.m - a.m,
      deltaYen: b.y - a.y,
      status: meta.asIs && meta.toBe ? 'kept' : meta.toBe ? 'added' : 'removed',
    });
  }
  return rows.sort((x, y) => x.deltaYen - y.deltaYen || x.deltaMin - y.deltaMin);
}
