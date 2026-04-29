import type { FlowStep, ScenarioKind } from '../types';

export type ScenarioDef = {
  kind: ScenarioKind;
  label: string;
  hint: string;
  // 数値入力に対するラベル（例: "削減率 %"）
  inputLabel: string;
  inputUnit: string;
  // デフォルトの数値（適用時の初期値）
  defaultValue: number;
  // 数値入力を使わないシナリオ (changeLane / eliminate) は false
  numeric: boolean;
};

// MECE 改善シナリオ。「何を」「どうする」を直交軸で網羅する6パターン。
export const SCENARIOS: ScenarioDef[] = [
  {
    kind: 'reduceTime',
    label: '時間を削減',
    hint: '自動化・効率化で所要時間を短くする',
    inputLabel: '削減率',
    inputUnit: '%',
    defaultValue: 60,
    numeric: true,
  },
  {
    kind: 'reduceQty',
    label: '個数を削減',
    hint: 'ペーパーレス・統合で処理対象数を減らす',
    inputLabel: '削減率',
    inputUnit: '%',
    defaultValue: 50,
    numeric: true,
  },
  {
    kind: 'reduceUnitCost',
    label: '単価を削減',
    hint: 'ベンダー切替・一括契約で1個あたりコストを下げる',
    inputLabel: '削減率',
    inputUnit: '%',
    defaultValue: 30,
    numeric: true,
  },
  {
    kind: 'increaseQty',
    label: '処理量を増加',
    hint: '並列化・能力増強で同時間内の処理数を増やす',
    inputLabel: '増加率',
    inputUnit: '%',
    defaultValue: 100,
    numeric: true,
  },
  {
    kind: 'changeLane',
    label: '担当を変更',
    hint: '高時給→低時給／外部委託に置換える',
    inputLabel: '',
    inputUnit: '',
    defaultValue: 0,
    numeric: false,
  },
  {
    kind: 'eliminate',
    label: '廃止する',
    hint: 'ステップ自体を不要にする（時間=0、個数=0）',
    inputLabel: '',
    inputUnit: '',
    defaultValue: 0,
    numeric: false,
  },
];

export function getScenario(kind: ScenarioKind): ScenarioDef {
  const s = SCENARIOS.find((x) => x.kind === kind);
  if (!s) throw new Error(`Unknown scenario: ${kind}`);
  return s;
}

// シナリオを step に適用する。As-Is の数値ではなく現在の To-Be step に対して比率適用。
// changeLane は params.laneId 必須。eliminate は数値不要。
export function applyScenarioToStep(
  step: FlowStep,
  kind: ScenarioKind,
  value: number,
  params?: { laneId?: string }
): Partial<FlowStep> {
  switch (kind) {
    case 'reduceTime': {
      const ratio = clamp01(value / 100);
      return { durationMin: Math.max(0, Math.round(step.durationMin * (1 - ratio))) };
    }
    case 'reduceQty': {
      const ratio = clamp01(value / 100);
      return { quantity: Math.max(0, Math.round((step.quantity ?? 0) * (1 - ratio))) };
    }
    case 'reduceUnitCost': {
      const ratio = clamp01(value / 100);
      return { unitCostYen: Math.max(0, Math.round((step.unitCostYen ?? 0) * (1 - ratio))) };
    }
    case 'increaseQty': {
      // 増加率は 0 以上で上限なし（例: 200% = 3倍）。
      const ratio = Math.max(0, value / 100);
      const base = step.quantity ?? 0;
      return { quantity: Math.max(0, Math.round(base * (1 + ratio))) };
    }
    case 'changeLane': {
      if (!params?.laneId) return {};
      return { laneId: params.laneId };
    }
    case 'eliminate': {
      return { durationMin: 0, quantity: 0 };
    }
  }
}

// improvement テキスト用にシナリオ適用の説明文を組み立てる。
export function describeScenario(
  kind: ScenarioKind,
  value: number,
  params?: { laneName?: string }
): string {
  switch (kind) {
    case 'reduceTime':
      return `時間を ${value}% 削減（自動化・効率化）`;
    case 'reduceQty':
      return `個数を ${value}% 削減（ペーパーレス・統合）`;
    case 'reduceUnitCost':
      return `単価を ${value}% 削減（ベンダー切替・契約見直し）`;
    case 'increaseQty':
      return `処理量を ${value}% 増加（並列化・能力増強）`;
    case 'changeLane':
      return params?.laneName ? `担当を「${params.laneName}」に変更` : '担当を変更';
    case 'eliminate':
      return 'ステップを廃止（不要化・他工程へ統合）';
  }
}

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}
