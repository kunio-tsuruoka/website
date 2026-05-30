import type { FlowDiagram } from '@/features/flow-mapper/types';
import { create } from 'zustand';
import { EMPTY_DIAGRAM, type Message } from './types';

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
};

type Actions = {
  setInput: (v: string) => void;
  appendUser: (content: string) => void;
  reset: () => void;
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
};

export const useFlowInterviewStore = create<FlowInterviewState & Actions>()((set) => ({
  ...INITIAL,
  setInput: (v) => set({ input: v }),
  appendUser: (content) => set((s) => ({ messages: [...s.messages, { role: 'user', content }] })),
  reset: () => set({ ...INITIAL }),
}));
