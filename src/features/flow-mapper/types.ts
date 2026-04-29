export type StepType = 'start' | 'task' | 'decision' | 'system' | 'wait' | 'end';

// コスト計算方式。'labor' は時間×レーン時給のみ、'variable' は個数×単価のみ、
// 'both' は両方を加算する（既存データの互換のため未指定時は 'both' と解釈）。
export type StepCostMode = 'labor' | 'variable' | 'both';

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
  costMode?: StepCostMode;
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
export type DiagramTarget = 'asIs' | 'toBe';
// executionsPerMonth: この業務フローを月に何回実行するか（=年間インパクト換算用）。
// 未指定 (旧データ) は 100 とみなす。
export type State = { asIs: FlowDiagram; toBe: FlowDiagram; executionsPerMonth?: number };

// 改善シナリオ MECE: 「何を」「どうする」を直交軸で網羅。
// reduceTime: 所要時間を % 削減（自動化・効率化）
// reduceQty:  個数を % 削減（ペーパーレス・統合・紙→電子化）
// reduceUnitCost: 単価を % 削減（ベンダー切替・一括契約）
// increaseQty: 処理量を % 増加（並列化・能力増強でスループット↑）
// changeLane: 担当を別レーンへ（高時給→低時給／外部委託）
// eliminate: ステップ自体を廃止（durationMin=0, quantity=0）
export type ScenarioKind =
  | 'reduceTime'
  | 'reduceQty'
  | 'reduceUnitCost'
  | 'increaseQty'
  | 'changeLane'
  | 'eliminate';

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

export type LayoutBox = { x: number; y: number; w: number; h: number };
export type Layout = {
  width: number;
  height: number;
  phaseX: Map<string, { x: number; w: number }>;
  laneY: Map<string, { y: number; h: number }>;
  step: Map<string, LayoutBox>;
};
