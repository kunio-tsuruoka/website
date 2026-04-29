import type { Aggregates, FlowDiagram, FlowLane, FlowStep, StepType } from '../types';

export function stepLaborCost(step: FlowStep, lanes: FlowLane[]): number {
  const lane = lanes.find((l) => l.id === step.laneId);
  const rate = lane?.rateYenPerHour ?? 0;
  return (step.durationMin / 60) * rate;
}

export function stepVariableCost(step: FlowStep): number {
  return (step.quantity ?? 0) * (step.unitCostYen ?? 0);
}

// 1ステップのコスト = 人件費（時給×時間）＋ 個数×単価（材料費・手数料・配送費など）
export function stepCost(step: FlowStep, lanes: FlowLane[]): number {
  return stepLaborCost(step, lanes) + stepVariableCost(step);
}

export function totalMinutes(d: FlowDiagram): number {
  return d.steps.reduce((acc, s) => acc + (Number.isFinite(s.durationMin) ? s.durationMin : 0), 0);
}

const STEP_TYPE_LABEL: Record<StepType, string> = {
  start: '開始',
  task: '作業',
  decision: '判断',
  system: 'システム',
  wait: '待ち',
  end: '完了',
};

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
