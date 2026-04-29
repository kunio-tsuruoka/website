export type StepType = 'start' | 'task' | 'decision' | 'system' | 'wait' | 'end';

export type FlowStep = {
  id: string;
  type: StepType;
  laneId: string;
  phaseId: string;
  label: string;
  durationMin: number;
  tool: string;
  pain: string;
  improvement: string;
  next: string[];
  // 1回の実行あたり「個数 × 単価」型のコストを加算する。
  // 例: 紙100枚×5円、配送50件×200円、材料費 等。時間ベースの人件費とは別計上。
  quantity?: number;
  unitCostYen?: number;
  unitLabel?: string;
};

// rateYenPerHour: 担当ごとの人件費単価（円/時）。空または0 ならコスト計算から除外。
export type FlowLane = { id: string; name: string; rateYenPerHour?: number };

export type FlowPhase = { id: string; name: string };

export type FlowDiagram = {
  title: string;
  phases: FlowPhase[];
  lanes: FlowLane[];
  steps: FlowStep[];
};

export type View = 'asIs' | 'toBe' | 'compare';
export type State = { asIs: FlowDiagram; toBe: FlowDiagram };

export type SuggestionKind = 'automation' | 'ai' | 'parallel' | 'priority' | 'tool';
export type Suggestion = {
  stepId: string;
  kind: SuggestionKind;
  title: string;
  message: string;
};

export type SolutionTemplate = {
  name: string;
  description: string;
  examples: string;
  reductionPct: number;
  reductionRange: string;
};

export type AggBucket = { name: string; minutes: number; yen: number; stepCount: number };

export type Aggregates = {
  totalMinutes: number;
  totalYen: number;
  byPhase: AggBucket[];
  byLane: AggBucket[];
  byType: AggBucket[];
  topSteps: {
    id: string;
    label: string;
    phaseName: string;
    laneName: string;
    minutes: number;
    yen: number;
  }[];
};
