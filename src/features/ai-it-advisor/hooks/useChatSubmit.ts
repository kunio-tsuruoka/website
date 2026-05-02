import { useCallback } from 'react';
import { useChatStore } from '../store';
import type { ChatApiResponse } from '../types';
import { translateChatError } from '../utils/translate-error';

/**
 * チャット送信フック。
 *
 * - turnstileToken が無ければ送信せずエラーをセット
 * - 送信前に user message を履歴に積み、input をクリア
 * - 200 → assistant message を append、それ以外 → error をセット
 * - レスポンス到達時に Turnstile を reset（成功でも失敗でも）
 *
 * 既存 `ai-it-advisor.tsx` の `send()` をそのまま移植している。
 */
export function useChatSubmit() {
  const setLoading = useChatStore((s) => s.setLoading);
  const setError = useChatStore((s) => s.setError);
  const clearError = useChatStore((s) => s.clearError);
  const setInput = useChatStore((s) => s.setInput);
  const appendUserMessage = useChatStore((s) => s.appendUserMessage);
  const appendAssistantMessage = useChatStore((s) => s.appendAssistantMessage);

  return useCallback(
    async (
      text: string,
      turnstileToken: string | null,
      resetTurnstile: () => void
    ): Promise<void> => {
      const trimmed = text.trim();
      const { loading, messages } = useChatStore.getState();
      if (!trimmed || loading) return;
      if (!turnstileToken) {
        setError('セキュリティチェックを完了してください。');
        return;
      }

      clearError();
      setLoading(true);

      // 履歴は「ユーザー追加前のもの」を fetch に渡す（既存挙動互換）。
      const historyForRequest = messages;
      appendUserMessage(trimmed);
      setInput('');

      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            history: historyForRequest,
            turnstileToken,
          }),
        });
        const data = (await res.json()) as ChatApiResponse;
        if (!res.ok) {
          setError(translateChatError(res.status, data.error, data.message));
          resetTurnstile();
          return;
        }
        appendAssistantMessage(data.reply ?? '', data.references);
        resetTurnstile();
      } catch {
        setError('通信エラーが発生しました。時間をおいて再度お試しください。');
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, clearError, setInput, appendUserMessage, appendAssistantMessage]
  );
}
