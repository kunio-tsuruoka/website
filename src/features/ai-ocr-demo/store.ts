import { create } from 'zustand';
import type { OcrResult } from './types';

/**
 * AI 領収書 OCR デモの feature 単位 store。
 *
 * UploadPanel が file/error を読み書きし、ResultPanel が result/rawText/loading を読む。
 * 複数のサブコンポーネントから参照されるため Zustand に集約する。
 */
type OcrState = {
  file: File | null;
  /** `URL.createObjectURL(file)` の生成結果。file 変更時に同期する。 */
  previewUrl: string | null;
  result: OcrResult | null;
  rawText: string | null;
  loading: boolean;
  error: string | null;
};

type OcrActions = {
  setFile: (file: File | null) => void;
  setPreviewUrl: (url: string | null) => void;
  setResult: (result: OcrResult | null) => void;
  setRawText: (text: string | null) => void;
  setLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
  clearError: () => void;
  /** 解析開始時に「結果領域」を全部クリア（既存挙動互換）。 */
  clearResult: () => void;
};

const INITIAL_STATE: OcrState = {
  file: null,
  previewUrl: null,
  result: null,
  rawText: null,
  loading: false,
  error: null,
};

export const useOcrStore = create<OcrState & OcrActions>()((set) => ({
  ...INITIAL_STATE,

  setFile: (file) => set({ file }),
  setPreviewUrl: (url) => set({ previewUrl: url }),
  setResult: (result) => set({ result }),
  setRawText: (text) => set({ rawText: text }),
  setLoading: (value) => set({ loading: value }),
  setError: (value) => set({ error: value }),
  clearError: () => set({ error: null }),
  clearResult: () => set({ result: null, rawText: null }),
}));
