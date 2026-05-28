import { create } from 'zustand';
import type { HearingProfile, Message } from './types';

export type Step = 'idle' | 'chatting' | 'reviewing' | 'done' | 'error';

type State = {
  step: Step;
  sessionId: string | null;
  messages: Message[];
  input: string;
  loading: boolean;
  error: string | null;
  profile: HearingProfile | null;
  progress: { filled: number; total: number; ratio: number; ready: boolean };
};

type Actions = {
  setStep: (step: Step) => void;
  setSessionId: (id: string | null) => void;
  setInput: (v: string) => void;
  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
  clearError: () => void;
  appendUser: (content: string) => void;
  appendAssistant: (content: string) => void;
  setProfile: (p: HearingProfile) => void;
  setProgress: (p: State['progress']) => void;
  hydrateFromStart: (args: {
    sessionId: string;
    assistantMessage: string;
    profile: HearingProfile;
  }) => void;
  reset: () => void;
};

const INITIAL: State = {
  step: 'idle',
  sessionId: null,
  messages: [],
  input: '',
  loading: false,
  error: null,
  profile: null,
  progress: { filled: 0, total: 7, ratio: 0, ready: false },
};

export const useHearingStore = create<State & Actions>()((set) => ({
  ...INITIAL,
  setStep: (step) => set({ step }),
  setSessionId: (id) => set({ sessionId: id }),
  setInput: (v) => set({ input: v }),
  setLoading: (v) => set({ loading: v }),
  setError: (v) => set({ error: v }),
  clearError: () => set({ error: null }),
  appendUser: (content) => set((s) => ({ messages: [...s.messages, { role: 'user', content }] })),
  appendAssistant: (content) =>
    set((s) => ({ messages: [...s.messages, { role: 'assistant', content }] })),
  setProfile: (p) => set({ profile: p }),
  setProgress: (p) => set({ progress: p }),
  hydrateFromStart: ({ sessionId, assistantMessage, profile }) =>
    set({
      step: 'chatting',
      sessionId,
      messages: [{ role: 'assistant', content: assistantMessage }],
      profile,
    }),
  reset: () => set(INITIAL),
}));
