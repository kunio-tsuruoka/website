import type { FlowDiagram, StepType } from '@/features/flow-mapper/types';
import type { FlowSuggestion } from '@/lib/flow-interview/suggest';
import { create } from 'zustand';
import { EMPTY_DIAGRAM, type Message } from './types';

function genId(prefix: string): string {
  const uuid = (globalThis.crypto as Crypto | undefined)?.randomUUID?.();
  const tail = uuid ? uuid.slice(0, 8) : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${tail}`;
}

type FlowInterviewState = {
  started: boolean;
  sessionId: string | null;
  messages: Message[];
  diagram: FlowDiagram;
  input: string;
  loading: boolean; // LLM ターン処理中
  recording: boolean; // マイク録音中
  transcribing: boolean; // 文字起こし処理中
  isReady: boolean;
  error: string | null;
  // To-Be 改善提案
  suggesting: boolean;
  suggestSummary: string | null;
  suggestions: FlowSuggestion[] | null;
  // ユーザーストーリ付き RFP
  rfpLoading: boolean;
  rfpMarkdown: string | null;
};

type Actions = {
  setInput: (v: string) => void;
  appendUser: (content: string) => void;
  reset: () => void;
  // 図のインライン編集（As-Is のみ）。RFP/改善案はサーバ同期後に最新図を使う。
  setDiagramTitle: (title: string) => void;
  updateStepLabel: (id: string, label: string) => void;
  setStepLane: (id: string, laneId: string) => void;
  setStepType: (id: string, type: StepType) => void;
  deleteStep: (id: string) => void;
  addStep: () => void;
  addLane: () => void;
  renameLane: (id: string, name: string) => void;
};

const INITIAL: FlowInterviewState = {
  started: false,
  sessionId: null,
  messages: [],
  diagram: EMPTY_DIAGRAM as FlowDiagram,
  input: '',
  loading: false,
  recording: false,
  transcribing: false,
  isReady: false,
  error: null,
  suggesting: false,
  suggestSummary: null,
  suggestions: null,
  rfpLoading: false,
  rfpMarkdown: null,
};

export const useFlowInterviewStore = create<FlowInterviewState & Actions>()((set) => ({
  ...INITIAL,
  setInput: (v) => set({ input: v }),
  appendUser: (content) => set((s) => ({ messages: [...s.messages, { role: 'user', content }] })),
  reset: () => set({ ...INITIAL }),

  setDiagramTitle: (title) => set((s) => ({ diagram: { ...s.diagram, title } })),

  updateStepLabel: (id, label) =>
    set((s) => ({
      diagram: {
        ...s.diagram,
        steps: s.diagram.steps.map((st) => (st.id === id ? { ...st, label } : st)),
      },
    })),

  setStepLane: (id, laneId) =>
    set((s) => ({
      diagram: {
        ...s.diagram,
        steps: s.diagram.steps.map((st) => (st.id === id ? { ...st, laneId } : st)),
      },
    })),

  setStepType: (id, type) =>
    set((s) => ({
      diagram: {
        ...s.diagram,
        steps: s.diagram.steps.map((st) => (st.id === id ? { ...st, type } : st)),
      },
    })),

  // 削除時は前後を再接続: このステップを next に持つ者は、このステップの next 先へ繋ぎ替える。
  deleteStep: (id) =>
    set((s) => {
      const removed = s.diagram.steps.find((st) => st.id === id);
      const targets = removed?.next ?? [];
      const steps = s.diagram.steps
        .filter((st) => st.id !== id)
        .map((st) => {
          if (!st.next.includes(id)) return st;
          const rewired = st.next.flatMap((n) => (n === id ? targets : [n]));
          return { ...st, next: Array.from(new Set(rewired)).filter((n) => n !== st.id) };
        });
      return { diagram: { ...s.diagram, steps } };
    }),

  // 末尾に task を1つ追加し、直前ステップ（end でなければ）から直列接続する。
  addStep: () =>
    set((s) => {
      const d = s.diagram;
      const laneId = d.lanes[0]?.id ?? genId('lane');
      const phaseId = d.phases[0]?.id ?? genId('phase');
      const lanes = d.lanes.length > 0 ? d.lanes : [{ id: laneId, name: '担当' }];
      const phases = d.phases.length > 0 ? d.phases : [{ id: phaseId, name: 'フロー' }];
      const newStep = {
        id: genId('step'),
        type: 'task' as StepType,
        laneId: lanes[0].id,
        phaseId: phases[0].id,
        label: '新しい作業',
        durationMin: 0,
        tool: '',
        pain: '',
        improvement: '',
        next: [] as string[],
      };
      const prev = d.steps[d.steps.length - 1];
      const steps = d.steps.map((st) =>
        prev && st.id === prev.id && st.type !== 'end'
          ? { ...st, next: Array.from(new Set([...st.next, newStep.id])) }
          : st
      );
      return { diagram: { ...d, lanes, phases, steps: [...steps, newStep] } };
    }),

  addLane: () =>
    set((s) => ({
      diagram: {
        ...s.diagram,
        lanes: [
          ...s.diagram.lanes,
          { id: genId('lane'), name: `担当${s.diagram.lanes.length + 1}` },
        ],
      },
    })),

  renameLane: (id, name) =>
    set((s) => ({
      diagram: {
        ...s.diagram,
        lanes: s.diagram.lanes.map((l) => (l.id === id ? { ...l, name } : l)),
      },
    })),
}));
