import { useCallback } from 'react';
import { useOcrStore } from '../store';
import type { OcrApiResponse } from '../types';
import { translateOcrError } from '../utils/translate-error';

/**
 * OCR 送信フック。既存 `ai-ocr-demo.tsx` の `submit()` をそのまま移植。
 *
 * - file 未選択 / loading 中 / turnstile 未取得 ならガード
 * - multipart/form-data で `/api/ai/ocr` に POST
 * - 成功 → result/rawText を store に反映
 * - 失敗 → error を翻訳してセット、Turnstile を reset
 */
export function useOcrSubmit() {
  const setLoading = useOcrStore((s) => s.setLoading);
  const setError = useOcrStore((s) => s.setError);
  const clearError = useOcrStore((s) => s.clearError);
  const clearResult = useOcrStore((s) => s.clearResult);
  const setResult = useOcrStore((s) => s.setResult);
  const setRawText = useOcrStore((s) => s.setRawText);

  return useCallback(
    async (turnstileToken: string | null, resetTurnstile: () => void): Promise<void> => {
      const { file, loading } = useOcrStore.getState();
      if (!file || loading) return;
      if (!turnstileToken) {
        setError('セキュリティチェックを完了してください。');
        return;
      }

      clearError();
      clearResult();
      setLoading(true);

      const form = new FormData();
      form.set('image', file);
      form.set('cf-turnstile-response', turnstileToken);

      try {
        const res = await fetch('/api/ai/ocr', { method: 'POST', body: form });
        const data = (await res.json()) as OcrApiResponse;
        if (!res.ok) {
          setError(translateOcrError(res.status, data.error, data.message));
          resetTurnstile();
          return;
        }
        setResult(data.data ?? null);
        setRawText(data.rawText ?? null);
        resetTurnstile();
      } catch {
        setError('通信エラーが発生しました。時間をおいて再度お試しください。');
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, clearError, clearResult, setResult, setRawText]
  );
}
