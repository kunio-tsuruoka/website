import type {
  FlowDiagram,
  FlowLane,
  FlowPhase,
  FlowStep,
  StepType,
} from '@/features/flow-mapper/types';
import { z } from 'zod';

// LLM には「名前」と「順序index」で出力させ、サーバ側で実IDに採番する。
// FlowStep の全フィールドを LLM に書かせるとIDの整合が壊れるため、最小限だけ出させて正規化で埋める。
const STEP_TYPES = ['start', 'task', 'decision', 'system', 'wait', 'end'] as const;

export const LlmStepSchema = z.object({
  label: z.string().min(1),
  type: z.enum(STEP_TYPES).default('task'),
  lane: z.string().default(''),
  phase: z.string().default(''),
  durationMin: z.number().nonnegative().optional(),
  tool: z.string().optional(),
  pain: z.string().optional(),
  // next は steps 配列の index 群。省略時は「次のステップへ直列接続」を正規化側で補う。
  next: z.array(z.number().int().nonnegative()).optional(),
});

export const LlmDiagramSchema = z.object({
  title: z.string().default('業務フロー'),
  lanes: z.array(z.string()).default([]),
  phases: z.array(z.string()).default([]),
  steps: z.array(LlmStepSchema).default([]),
});

export type LlmDiagram = z.infer<typeof LlmDiagramSchema>;

function genId(prefix: string): string {
  const uuid = (globalThis.crypto as Crypto | undefined)?.randomUUID?.();
  const tail = uuid ? uuid.slice(0, 8) : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${tail}`;
}

/**
 * LLM の簡易図 (名前 + index) を flow-mapper の FlowDiagram (実ID参照) に正規化する。
 * - lane/phase 名 → ID にマップ（重複排除、空なら既定1件）
 * - step.next の index → 実 step ID に解決（範囲外は捨てる）
 * - next 省略かつ end でない step は「次の index へ直列接続」を補完
 * - 不正な lane/phase 参照は先頭にフォールバック
 */
export function normalizeToFlowDiagram(llm: LlmDiagram): FlowDiagram {
  const laneNames = dedupeNonEmpty(llm.lanes);
  const phaseNames = dedupeNonEmpty(llm.phases);

  // step が参照する lane/phase 名も拾って、宣言漏れを補う
  for (const s of llm.steps) {
    if (s.lane && !laneNames.includes(s.lane)) laneNames.push(s.lane);
    if (s.phase && !phaseNames.includes(s.phase)) phaseNames.push(s.phase);
  }
  if (laneNames.length === 0) laneNames.push('担当');
  if (phaseNames.length === 0) phaseNames.push('フロー');

  const lanes: FlowLane[] = laneNames.map((name) => ({ id: genId('lane'), name }));
  const phases: FlowPhase[] = phaseNames.map((name) => ({ id: genId('phase'), name }));
  const laneIdByName = new Map(lanes.map((l, i) => [laneNames[i], l.id]));
  const phaseIdByName = new Map(phases.map((p, i) => [phaseNames[i], p.id]));

  // 先に全 step の ID を採番（next 解決で前方参照が必要）
  const stepIds = llm.steps.map(() => genId('step'));

  const steps: FlowStep[] = llm.steps.map((s, i) => {
    const laneId = (s.lane && laneIdByName.get(s.lane)) || lanes[0].id;
    const phaseId = (s.phase && phaseIdByName.get(s.phase)) || phases[0].id;

    let next: string[];
    if (s.next && s.next.length > 0) {
      next = s.next
        .filter((idx) => idx >= 0 && idx < stepIds.length && idx !== i)
        .map((idx) => stepIds[idx]);
    } else if (s.type !== 'end' && i + 1 < stepIds.length) {
      next = [stepIds[i + 1]]; // 直列接続の既定
    } else {
      next = [];
    }

    return {
      id: stepIds[i],
      type: s.type as StepType,
      laneId,
      phaseId,
      label: s.label.trim(),
      durationMin: s.durationMin ?? 0,
      tool: s.tool?.trim() ?? '',
      pain: s.pain?.trim() ?? '',
      improvement: '',
      next: dedupe(next),
    };
  });

  return {
    title: llm.title.trim() || '業務フロー',
    phases,
    lanes,
    steps,
  };
}

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

function dedupeNonEmpty(arr: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of arr) {
    const t = (v ?? '').trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}
