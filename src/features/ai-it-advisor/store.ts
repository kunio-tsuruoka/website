import { create } from 'zustand';
import type { ColumnRef, Message } from './types';

/**
 * AI IT 発注相談チャットの feature 単位 store。
 *
 * 永続化は不要（リロードで履歴が消えていい設計）。
 * UIは MessageList / MessageInput / SuggestionPills など複数のサブコンポーネントから
 * messages/input/loading/error を読み書きするので useState ではなく Zustand に集約する。
 */
type ChatState = {
  messages: Message[];
  input: string;
  loading: boolean;
  error: string | null;
};

type ChatActions = {
  setInput: (value: string) => void;
  setError: (value: string | null) => void;
  clearError: () => void;
  setLoading: (value: boolean) => void;
  appendUserMessage: (content: string) => void;
  appendAssistantMessage: (content: string, references?: ColumnRef[]) => void;
  /** 送信前の history（直前までのメッセージ列）を返す。fetch ペイロード用。 */
  getHistory: () => Message[];
  reset: () => void;
};

const INITIAL_STATE: ChatState = {
  messages: [],
  input: '',
  loading: false,
  error: null,
};

export const useChatStore = create<ChatState & ChatActions>()((set, get) => ({
  ...INITIAL_STATE,

  setInput: (value) => set({ input: value }),
  setError: (value) => set({ error: value }),
  clearError: () => set({ error: null }),
  setLoading: (value) => set({ loading: value }),

  appendUserMessage: (content) =>
    set((s) => ({ messages: [...s.messages, { role: 'user', content }] })),
  appendAssistantMessage: (content, references) =>
    set((s) => ({ messages: [...s.messages, { role: 'assistant', content, references }] })),

  getHistory: () => get().messages,

  reset: () => set(INITIAL_STATE),
}));
