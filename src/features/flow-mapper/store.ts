import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { EMPTY, SAMPLE, STORAGE_KEY } from './constants';
import type {
  DiagramTarget,
  FlowDiagram,
  FlowStep,
  SolutionTemplate,
  State,
  StepType,
  View,
} from './types';
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
  moveStep: (t: DiagramTarget, id: string, toLaneId: string, toPhaseId: string) => void;
  renameStep: (t: DiagramTarget, id: string, label: string) => void;
  handleStepClick: (t: DiagramTarget, id: string) => void;

  applySolutionToToBe: (asIsStepId: string, sol: SolutionTemplate) => void;
  loadSample: () => void;
  resetAll: () => void;
  copyToBeFromAsIs: () => void;
  importStateFromJson: (parsed: State) => void;
};

type StoreState = {
  asIs: FlowDiagram;
  toBe: FlowDiagram;
  view: View;
  editingId: string | null;
  connectMode: boolean;
  connectFromId: string | null;
  fullscreen: boolean;
  onboardingOpen: boolean;
};

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
          const dismissed = localStorage.getItem('beekle-flow-mapper-onboarding-dismissed');
          if (dismissed === '1') set({ onboardingOpen: false });
        } catch {
          /* ignore */
        }
      },
      dismissOnboarding: () => {
        set({ onboardingOpen: false });
        try {
          localStorage.setItem('beekle-flow-mapper-onboarding-dismissed', '1');
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
      updateLaneRate: (t, id, rateYenPerHour) =>
        set((s) =>
          updateDiagram(s, t, (d) => ({
            ...d,
            lanes: d.lanes.map((l) => (l.id === id ? { ...l, rateYenPerHour } : l)),
          }))
        ),
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
        };
        // 直前の終端ステップ (next 空 & end 以外) があれば自動接続。
        // 既に分岐があるなら触らない（明示的構造を尊重）。
        set((s) => ({
          ...updateDiagram(s, t, (dd) => {
            const prev = [...dd.steps]
              .reverse()
              .find((step) => step.next.length === 0 && step.type !== 'end');
            const stepsWithLink = prev
              ? dd.steps.map((step) =>
                  step.id === prev.id ? { ...step, next: [newStep.id] } : step
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

      moveStep: (t: DiagramTarget, id: string, toLaneId: string, toPhaseId: string) =>
        set((s) =>
          updateDiagram(s, t, (d) => ({
            ...d,
            steps: d.steps.map((step) =>
              step.id === id ? { ...step, laneId: toLaneId, phaseId: toPhaseId } : step
            ),
          }))
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

      resetAll: () => set({ asIs: EMPTY.asIs, toBe: EMPTY.toBe, editingId: null }),

      copyToBeFromAsIs: () =>
        set((prev) => {
          const cloned: FlowDiagram = JSON.parse(JSON.stringify(prev.asIs));
          cloned.title = `${prev.asIs.title}（改善後）`;
          cloned.steps = cloned.steps.map((s) => ({ ...s, pain: '', improvement: '' }));
          return { toBe: cloned, view: 'toBe' };
        }),

      importStateFromJson: (parsed: State) => set({ asIs: parsed.asIs, toBe: parsed.toBe }),
    }),
    {
      name: STORAGE_KEY,
      version: 0,
      // ドメイン状態のみ永続化。UI状態 (view/editingId/...) はセッションごとにリセット。
      partialize: (s) => ({ asIs: s.asIs, toBe: s.toBe }),
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
