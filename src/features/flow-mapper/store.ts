import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { EMPTY, type FlowTemplate, ONBOARDING_KEY, SAMPLE, STORAGE_KEY } from './constants';
import type {
  DiagramTarget,
  FlowDiagram,
  FlowStep,
  SolutionTemplate,
  State,
  StepType,
  View,
} from './types';
import { defaultCostMode } from './utils/cost';
import { uid } from './utils/format';

type Actions = {
  setView: (v: View) => void;
  setEditingId: (id: string | null) => void;
  setConnectMode: (b: boolean) => void;
  setConnectFromId: (id: string | null) => void;
  toggleConnectMode: () => void;
  startConnectFrom: (id: string) => void;
  setFullscreen: (b: boolean) => void;
  toggleFullscreen: () => void;
  dismissOnboarding: () => void;
  hydrateOnboardingFromStorage: () => void;

  addLane: (t: DiagramTarget) => void;
  renameLane: (t: DiagramTarget, id: string, name: string) => void;
  updateLaneRate: (t: DiagramTarget, id: string, rateYenPerHour: number) => void;
  deleteLane: (t: DiagramTarget, id: string) => void;

  addPhase: (t: DiagramTarget) => void;
  renamePhase: (t: DiagramTarget, id: string, name: string) => void;
  deletePhase: (t: DiagramTarget, id: string) => void;

  setDiagramTitle: (t: DiagramTarget, title: string) => void;

  addStep: (t: DiagramTarget, laneId?: string, phaseId?: string, type?: StepType) => void;
  updateStep: (t: DiagramTarget, id: string, patch: Partial<FlowStep>) => void;
  deleteStep: (t: DiagramTarget, id: string) => void;
  moveStep: (
    t: DiagramTarget,
    id: string,
    toLaneId: string,
    toPhaseId: string,
    beforeStepId?: string | null
  ) => void;
  swapSteps: (t: DiagramTarget, idA: string, idB: string) => void;
  renameStep: (t: DiagramTarget, id: string, label: string) => void;
  handleStepClick: (t: DiagramTarget, id: string) => void;

  applySolutionToToBe: (asIsStepId: string, sol: SolutionTemplate) => void;
  loadSample: () => void;
  loadTemplate: (template: FlowTemplate) => void;
  resetAll: () => void;
  copyToBeFromAsIs: () => void;
  importStateFromJson: (parsed: State) => void;
  setExecutionsPerMonth: (n: number) => void;
};

type StoreState = {
  asIs: FlowDiagram;
  toBe: FlowDiagram;
  // 業務フローの月間実行回数（経営インパクト計算用、年間 = ×12）。
  executionsPerMonth: number;
  view: View;
  editingId: string | null;
  connectMode: boolean;
  connectFromId: string | null;
  fullscreen: boolean;
  onboardingOpen: boolean;
};

const DEFAULT_EXECUTIONS_PER_MONTH = 100;

// 旧バージョン (zustand persist 導入前) は { asIs, toBe } をそのまま JSON 保存していた。
// 新バージョンは zustand persist が { state: { asIs, toBe }, version: 0 } で包む。
// 既存ユーザーのデータ消失を防ぐため、getItem 時に旧形状を検知して新形状に詰め替える。
function isLegacyBareShape(parsed: unknown): parsed is State {
  if (parsed === null || typeof parsed !== 'object') return false;
  const obj = parsed as Record<string, unknown>;
  if ('state' in obj) return false;
  const asIs = obj.asIs as { lanes?: unknown } | undefined;
  const toBe = obj.toBe as { lanes?: unknown } | undefined;
  return Boolean(
    asIs &&
      toBe &&
      typeof asIs === 'object' &&
      typeof toBe === 'object' &&
      Array.isArray(asIs.lanes) &&
      Array.isArray(toBe.lanes)
  );
}

// テストから流用できるようにエクスポート。LocalStorage の生文字列を受けて、
// zustand persist が期待する `{ state, version }` 形に正規化する。
export function unwrapPersistedValue(raw: string | null): string | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isLegacyBareShape(parsed)) {
      return JSON.stringify({ state: { asIs: parsed.asIs, toBe: parsed.toBe }, version: 0 });
    }
    return raw;
  } catch {
    // 壊れた JSON は捨てて初期値にフォールバック。
    return null;
  }
}

function updateDiagram(
  s: StoreState,
  t: DiagramTarget,
  mutator: (d: FlowDiagram) => FlowDiagram
): Partial<StoreState> {
  return { [t]: mutator(s[t]) };
}

const DEFAULT_LABEL: Record<StepType, string> = {
  start: '開始',
  task: '新しい作業',
  decision: '判断',
  system: 'システム処理',
  wait: '待ち',
  end: '完了',
};

export const useFlowStore = create<StoreState & Actions>()(
  persist(
    (set, get) => ({
      asIs: EMPTY.asIs,
      toBe: EMPTY.toBe,
      executionsPerMonth: DEFAULT_EXECUTIONS_PER_MONTH,
      view: 'asIs',
      editingId: null,
      connectMode: false,
      connectFromId: null,
      fullscreen: false,
      onboardingOpen: true,

      setView: (v) => set({ view: v, editingId: null }),
      setEditingId: (id) => set({ editingId: id }),
      setConnectMode: (b) => set({ connectMode: b, connectFromId: null, editingId: null }),
      setConnectFromId: (id) => set({ connectFromId: id }),
      toggleConnectMode: () =>
        set((s) => ({ connectMode: !s.connectMode, connectFromId: null, editingId: null })),
      startConnectFrom: (id) => set({ connectMode: true, connectFromId: id }),
      setFullscreen: (b) => set({ fullscreen: b }),
      toggleFullscreen: () => set((s) => ({ fullscreen: !s.fullscreen })),

      hydrateOnboardingFromStorage: () => {
        if (typeof window === 'undefined') return;
        try {
          const dismissed = localStorage.getItem(ONBOARDING_KEY);
          if (dismissed === '1') set({ onboardingOpen: false });
        } catch {
          /* ignore */
        }
      },
      dismissOnboarding: () => {
        set({ onboardingOpen: false });
        try {
          localStorage.setItem(ONBOARDING_KEY, '1');
        } catch {
          /* ignore */
        }
      },

      addLane: (t) =>
        set((s) =>
          updateDiagram(s, t, (d) => ({
            ...d,
            lanes: [...d.lanes, { id: uid(), name: `担当者${d.lanes.length + 1}` }],
          }))
        ),
      renameLane: (t, id, name) =>
        set((s) =>
          updateDiagram(s, t, (d) => ({
            ...d,
            lanes: d.lanes.map((l) => (l.id === id ? { ...l, name } : l)),
          }))
        ),
      updateLaneRate: (t, id, rateYenPerHour) => {
        // NaN / Infinity は 0 に倒す（永続化前に弾く）。stepLaborCost にも保険があるが二重防御。
        const safe = Number.isFinite(rateYenPerHour) && rateYenPerHour >= 0 ? rateYenPerHour : 0;
        set((s) =>
          updateDiagram(s, t, (d) => ({
            ...d,
            lanes: d.lanes.map((l) => (l.id === id ? { ...l, rateYenPerHour: safe } : l)),
          }))
        );
      },
      deleteLane: (t, id) =>
        set((s) =>
          updateDiagram(s, t, (d) => {
            if (d.lanes.length <= 1) return d;
            return {
              ...d,
              lanes: d.lanes.filter((l) => l.id !== id),
              steps: d.steps
                .filter((step) => step.laneId !== id)
                .map((step) => ({
                  ...step,
                  next: step.next.filter((nid) =>
                    d.steps.some((x) => x.id === nid && x.laneId !== id)
                  ),
                })),
            };
          })
        ),

      addPhase: (t) =>
        set((s) =>
          updateDiagram(s, t, (d) => ({
            ...d,
            phases: [...d.phases, { id: uid(), name: `フェーズ${d.phases.length + 1}` }],
          }))
        ),
      renamePhase: (t, id, name) =>
        set((s) =>
          updateDiagram(s, t, (d) => ({
            ...d,
            phases: d.phases.map((p) => (p.id === id ? { ...p, name } : p)),
          }))
        ),
      deletePhase: (t, id) =>
        set((s) =>
          updateDiagram(s, t, (d) => {
            if (d.phases.length <= 1) return d;
            return {
              ...d,
              phases: d.phases.filter((p) => p.id !== id),
              steps: d.steps
                .filter((step) => step.phaseId !== id)
                .map((step) => ({
                  ...step,
                  next: step.next.filter((nid) =>
                    d.steps.some((x) => x.id === nid && x.phaseId !== id)
                  ),
                })),
            };
          })
        ),

      setDiagramTitle: (t, title) => set((s) => updateDiagram(s, t, (d) => ({ ...d, title }))),

      addStep: (t: DiagramTarget, laneId?: string, phaseId?: string, type: StepType = 'task') => {
        const current = get();
        const d = current[t];
        const newStep: FlowStep = {
          id: uid(),
          type,
          laneId: laneId ?? d.lanes[0]?.id ?? '',
          phaseId: phaseId ?? d.phases[0]?.id ?? '',
          label: DEFAULT_LABEL[type],
          durationMin: type === 'start' || type === 'end' || type === 'system' ? 0 : 10,
          tool: '',
          pain: '',
          improvement: '',
          next: [],
          costMode: defaultCostMode(type),
        };
        // ツールバー (図形パレット) からの追加だけ自動接続。
        // 空セルの「ここに追加」のように lane+phase を明示した呼び出しは
        // 「その場所に置きたい」意図なので接続を生やさない。
        const isToolbarAdd = laneId === undefined && phaseId === undefined;
        set((s) => ({
          ...updateDiagram(s, t, (dd) => {
            const last = dd.steps.length > 0 ? dd.steps[dd.steps.length - 1] : null;
            const shouldLink =
              isToolbarAdd && last !== null && last.type !== 'end' && last.next.length === 0;
            const stepsWithLink = shouldLink
              ? dd.steps.map((step) =>
                  step.id === last.id ? { ...step, next: [newStep.id] } : step
                )
              : dd.steps;
            return { ...dd, steps: [...stepsWithLink, newStep] };
          }),
          editingId: newStep.id,
        }));
      },

      updateStep: (t: DiagramTarget, id: string, patch: Partial<FlowStep>) =>
        set((s) =>
          updateDiagram(s, t, (d) => ({
            ...d,
            steps: d.steps.map((step) => (step.id === id ? { ...step, ...patch } : step)),
          }))
        ),

      deleteStep: (t: DiagramTarget, id: string) =>
        set((s) => {
          const next = updateDiagram(s, t, (d) => ({
            ...d,
            steps: d.steps
              .filter((step) => step.id !== id)
              .map((step) => ({ ...step, next: step.next.filter((nid) => nid !== id) })),
          }));
          return {
            ...next,
            ...(s.editingId === id ? { editingId: null } : null),
            ...(s.connectFromId === id ? { connectFromId: null } : null),
          };
        }),

      moveStep: (
        t: DiagramTarget,
        id: string,
        toLaneId: string,
        toPhaseId: string,
        beforeStepId?: string | null
      ) =>
        set((s) =>
          updateDiagram(s, t, (d) => {
            const target = d.steps.find((step) => step.id === id);
            if (!target) return d;
            const updated: FlowStep = { ...target, laneId: toLaneId, phaseId: toPhaseId };
            const without = d.steps.filter((step) => step.id !== id);
            // beforeStepId が指定されていればそのステップの直前に挿入。
            // 未指定 / 見つからない場合は末尾に追加（同セル内での「最後尾へ」相当）。
            const insertIdx =
              beforeStepId == null
                ? without.length
                : (() => {
                    const idx = without.findIndex((step) => step.id === beforeStepId);
                    return idx === -1 ? without.length : idx;
                  })();
            const reordered = [
              ...without.slice(0, insertIdx),
              updated,
              ...without.slice(insertIdx),
            ];
            return { ...d, steps: reordered };
          })
        ),

      // 別レーン／別フェーズのステップにドロップした際、互いの (laneId, phaseId)
      // を入れ替える。next（接続）は各ステップが保持しているのでそのまま温存される。
      swapSteps: (t: DiagramTarget, idA: string, idB: string) =>
        set((s) =>
          updateDiagram(s, t, (d) => {
            if (idA === idB) return d;
            const a = d.steps.find((step) => step.id === idA);
            const b = d.steps.find((step) => step.id === idB);
            if (!a || !b) return d;
            return {
              ...d,
              steps: d.steps.map((step) => {
                if (step.id === idA) return { ...step, laneId: b.laneId, phaseId: b.phaseId };
                if (step.id === idB) return { ...step, laneId: a.laneId, phaseId: a.phaseId };
                return step;
              }),
            };
          })
        ),

      renameStep: (t: DiagramTarget, id: string, label: string) =>
        set((s) =>
          updateDiagram(s, t, (d) => ({
            ...d,
            steps: d.steps.map((step) => (step.id === id ? { ...step, label } : step)),
          }))
        ),

      // 接続モード時のクリックは「1回目で source、2回目で next をトグル」。
      // 通常時は editor を開く。
      handleStepClick: (t: DiagramTarget, id: string) => {
        const s = get();
        if (!s.connectMode) {
          set({ editingId: id });
          return;
        }
        if (s.connectFromId === null) {
          set({ connectFromId: id });
          return;
        }
        if (s.connectFromId === id) {
          set({ connectFromId: null });
          return;
        }
        const fromId = s.connectFromId;
        set((prev) => ({
          ...updateDiagram(prev, t, (d) => ({
            ...d,
            steps: d.steps.map((step) => {
              if (step.id !== fromId) return step;
              const nextSet = new Set(step.next);
              if (nextSet.has(id)) nextSet.delete(id);
              else nextSet.add(id);
              return { ...step, next: Array.from(nextSet) };
            }),
          })),
          connectFromId: null,
        }));
      },

      // To-Be 改善ヒント適用: To-Be に対応ステップが無ければ As-Is を複製してから上書き。
      applySolutionToToBe: (asIsStepId: string, sol: SolutionTemplate) => {
        set((prev) => {
          const asIsStep = prev.asIs.steps.find((s) => s.id === asIsStepId);
          if (!asIsStep) return prev;
          let toBe = prev.toBe;
          const hasMatching = toBe.steps.some((s) => s.id === asIsStepId);
          if (!hasMatching) {
            const cloned: FlowDiagram = JSON.parse(JSON.stringify(prev.asIs));
            cloned.title = `${prev.asIs.title}（改善後）`;
            cloned.steps = cloned.steps.map((s) => ({ ...s, pain: '', improvement: '' }));
            toBe = cloned;
          }
          const reducedMin = Math.max(
            0,
            Math.round(asIsStep.durationMin * (1 - sol.reductionPct / 100))
          );
          toBe = {
            ...toBe,
            steps: toBe.steps.map((s) =>
              s.id === asIsStepId
                ? {
                    ...s,
                    improvement: `${sol.name}: ${sol.description}（${sol.reductionRange}削減見込み・参考実装: ${sol.examples}）`,
                    durationMin: reducedMin,
                  }
                : s
            ),
          };
          return { ...prev, toBe, view: 'toBe' };
        });
      },

      loadSample: () =>
        set({ asIs: SAMPLE.asIs, toBe: SAMPLE.toBe, view: 'asIs', editingId: null }),

      // テンプレートを As-Is に流し込む。To-Be は EMPTY のままにする
      // （ユーザーが As-Is を見ながら改善後を作る前提）。
      // 静的 ID 衝突を避けるため deep clone して store に置く。
      loadTemplate: (template) => {
        const cloned: FlowDiagram = JSON.parse(JSON.stringify(template.diagram));
        set({
          asIs: cloned,
          toBe: JSON.parse(JSON.stringify(EMPTY.toBe)),
          view: 'asIs',
          editingId: null,
        });
      },

      resetAll: () => set({ asIs: EMPTY.asIs, toBe: EMPTY.toBe, editingId: null }),

      copyToBeFromAsIs: () =>
        set((prev) => {
          const cloned: FlowDiagram = JSON.parse(JSON.stringify(prev.asIs));
          cloned.title = `${prev.asIs.title}（改善後）`;
          cloned.steps = cloned.steps.map((s) => ({ ...s, pain: '', improvement: '' }));
          return { toBe: cloned, view: 'toBe' };
        }),

      importStateFromJson: (parsed: State) =>
        set({
          asIs: parsed.asIs,
          toBe: parsed.toBe,
          executionsPerMonth: parsed.executionsPerMonth ?? DEFAULT_EXECUTIONS_PER_MONTH,
        }),

      setExecutionsPerMonth: (n: number) =>
        set({ executionsPerMonth: Math.max(0, Number.isFinite(n) ? n : 0) }),
    }),
    {
      name: STORAGE_KEY,
      version: 0,
      // ドメイン状態のみ永続化。UI状態 (view/editingId/...) はセッションごとにリセット。
      partialize: (s) => ({
        asIs: s.asIs,
        toBe: s.toBe,
        executionsPerMonth: s.executionsPerMonth,
      }),
      // 旧形状 (zustand persist 導入前の bare `{ asIs, toBe }`) を検知して
      // 新形状 (`{ state: { asIs, toBe }, version: 0 }`) に詰め替えてから読み込む。
      // これによりデプロイ後の既存ユーザーのデータ消失を防ぐ。
      storage: createJSONStorage(() => ({
        getItem: (key: string): string | null => {
          if (typeof window === 'undefined') return null;
          return unwrapPersistedValue(window.localStorage.getItem(key));
        },
        setItem: (key: string, value: string): void => {
          if (typeof window === 'undefined') return;
          window.localStorage.setItem(key, value);
        },
        removeItem: (key: string): void => {
          if (typeof window === 'undefined') return;
          window.localStorage.removeItem(key);
        },
      })),
    }
  )
);
