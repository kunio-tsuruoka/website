import { STEP_TYPE_LABEL } from '../constants';
import type { Aggregates, FlowDiagram, FlowLane, FlowStep, StepCostMode, StepType } from '../types';

// 既存データ互換のため未指定時は 'both'。
export function stepCostMode(step: FlowStep): StepCostMode {
  return step.costMode ?? 'both';
}

// 新規ステップを作るときの costMode の初期値。
// system: 自動処理は人件費なし → variable（API 利用料・サブスク等のみ）
// wait:  待ち時間に人件費はかからない → variable（保管料・滞留コスト等）
// それ以外 (start/end/task/decision) は labor を初期値にする。
export function defaultCostMode(type: StepType): StepCostMode {
  if (type === 'system' || type === 'wait') return 'variable';
  return 'labor';
}

export function stepLaborCost(step: FlowStep, lanes: FlowLane[]): number {
  if (stepCostMode(step) === 'variable') return 0;
  const lane = lanes.find((l) => l.id === step.laneId);
  const rate = lane?.rateYenPerHour ?? 0;
  return (step.durationMin / 60) * rate;
}

export function stepVariableCost(step: FlowStep): number {
  if (stepCostMode(step) === 'labor') return 0;
  return (step.quantity ?? 0) * (step.unitCostYen ?? 0);
}

// 1ステップのコスト = 人件費（時給×時間）＋ 個数×単価（材料費・手数料・配送費など）
// costMode により片方のみ集計に含めることもできる。
export function stepCost(step: FlowStep, lanes: FlowLane[]): number {
  return stepLaborCost(step, lanes) + stepVariableCost(step);
}

export function totalMinutes(d: FlowDiagram): number {
  return d.steps.reduce((acc, s) => acc + (Number.isFinite(s.durationMin) ? s.durationMin : 0), 0);
}

type AggBucketMut = {
  name: string;
  minutes: number;
  yen: number;
  stepCount: number;
};

export function computeAggregates(d: FlowDiagram): Aggregates {
  let total_minutes = 0;
  let total_yen = 0;
  const phaseAcc = new Map<string, AggBucketMut>();
  const laneAcc = new Map<string, AggBucketMut>();
  const typeAcc = new Map<StepType, AggBucketMut>();
  const stepRows: Aggregates['topSteps'] = [];

  for (const phase of d.phases) {
    phaseAcc.set(phase.id, { name: phase.name, minutes: 0, yen: 0, stepCount: 0 });
  }
  for (const lane of d.lanes) {
    laneAcc.set(lane.id, { name: lane.name, minutes: 0, yen: 0, stepCount: 0 });
  }

  for (const s of d.steps) {
    const m = Number.isFinite(s.durationMin) ? s.durationMin : 0;
    const y = stepCost(s, d.lanes);
    total_minutes += m;
    total_yen += y;
    const ph = phaseAcc.get(s.phaseId);
    if (ph) {
      ph.minutes += m;
      ph.yen += y;
      ph.stepCount += 1;
    }
    const ln = laneAcc.get(s.laneId);
    if (ln) {
      ln.minutes += m;
      ln.yen += y;
      ln.stepCount += 1;
    }
    const tp = typeAcc.get(s.type) ?? {
      name: STEP_TYPE_LABEL[s.type],
      minutes: 0,
      yen: 0,
      stepCount: 0,
    };
    tp.minutes += m;
    tp.yen += y;
    tp.stepCount += 1;
    typeAcc.set(s.type, tp);
    stepRows.push({
      id: s.id,
      label: s.label,
      phaseName: d.phases.find((p) => p.id === s.phaseId)?.name ?? '-',
      laneName: d.lanes.find((l) => l.id === s.laneId)?.name ?? '-',
      minutes: m,
      yen: y,
    });
  }

  // ボトルネック: コスト降順、コスト同値なら時間降順
  const byCostThenTime = [...stepRows].sort((a, b) => b.yen - a.yen || b.minutes - a.minutes);

  return {
    totalMinutes: total_minutes,
    totalYen: total_yen,
    byPhase: Array.from(phaseAcc.values()),
    byLane: Array.from(laneAcc.values()),
    byType: Array.from(typeAcc.values()),
    topSteps: byCostThenTime.slice(0, 5),
  };
}
