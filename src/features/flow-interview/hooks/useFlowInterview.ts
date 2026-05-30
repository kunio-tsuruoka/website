import { trackToolEvent } from '@/lib/analytics';
import { useCallback, useRef } from 'react';
import { useFlowInterviewStore } from '../store';
import type { FlowChatResponse } from '../types';

function translate(status: number, code: string): string {
  switch (code) {
    case 'rate_limited':
      return '短時間に多くの操作が行われました。少し待ってからお試しください。';
    case 'budget_exceeded':
      return 'AIデモは月次の利用上限に達しました。来月以降にお試しください。';
    case 'session_not_found':
      return 'セッションの有効期限が切れました。最初からやり直してください。';
    case 'too_many_turns':
      return '対話の上限に達しました。右の図を編集に進んでください。';
    default:
      return status >= 500
        ? 'サーバー側で一時的な問題が発生しています。'
        : '入力内容に問題があるようです。';
  }
}

export function useFlowInterview() {
  const store = useFlowInterviewStore;
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(
    async (turnstileToken: string | null, resetTurnstile: () => void): Promise<void> => {
      if (store.getState().loading) return;
      if (!turnstileToken) {
        store.setState({ error: 'セキュリティチェックを完了してください。' });
        return;
      }
      store.setState({ loading: true, error: null });
      try {
        const res = await fetch('/api/flow/start', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'cf-turnstile-response': turnstileToken },
          body: JSON.stringify({ turnstileToken }),
        });
        const data = (await res.json()) as FlowChatResponse;
        if (!res.ok || 'error' in data) {
          store.setState({
            error: 'error' in data ? translate(res.status, data.error) : '開始に失敗しました。',
            loading: false,
          });
          resetTurnstile();
          return;
        }
        store.setState({
          started: true,
          sessionId: data.sessionId,
          messages: [{ role: 'assistant', content: data.assistantMessage }],
          diagram: data.diagram,
          loading: false,
        });
        trackToolEvent('tool_start', { tool: 'flow-mapper', meta: { variant: 'flow-interview' } });
        resetTurnstile();
      } catch {
        store.setState({ error: '通信エラーが発生しました。', loading: false });
      }
    },
    [store]
  );

  const answer = useCallback(
    async (text: string): Promise<void> => {
      const trimmed = text.trim();
      const { loading, sessionId } = store.getState();
      if (!trimmed || loading || !sessionId) return;
      store.setState({ loading: true, error: null, input: '' });
      store.getState().appendUser(trimmed);
      try {
        const res = await fetch('/api/flow/answer', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sessionId, message: trimmed }),
        });
        const data = (await res.json()) as FlowChatResponse;
        if (!res.ok || 'error' in data) {
          store.setState({
            error: 'error' in data ? translate(res.status, data.error) : '送信に失敗しました。',
            loading: false,
          });
          return;
        }
        store.setState((s) => ({
          messages: [...s.messages, { role: 'assistant', content: data.assistantMessage }],
          diagram: data.diagram,
          isReady: data.isReady,
          loading: false,
        }));
      } catch {
        store.setState({ error: '通信エラーが発生しました。', loading: false });
      }
    },
    [store]
  );

  // 録音停止 → Whisper 文字起こし → 入力欄へ反映（自動送信はしない。ユーザーが確認して送る）
  const finishRecording = useCallback(async () => {
    const sessionId = store.getState().sessionId;
    const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || 'audio/webm' });
    chunksRef.current = [];
    for (const t of streamRef.current?.getTracks() ?? []) t.stop();
    streamRef.current = null;
    if (!sessionId || blob.size === 0) {
      store.setState({ recording: false });
      return;
    }
    store.setState({ recording: false, transcribing: true });
    try {
      const form = new FormData();
      form.append('audio', blob, 'speech.webm');
      form.append('sessionId', sessionId);
      const res = await fetch('/api/ai/transcribe', { method: 'POST', body: form });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || !data.text) {
        store.setState({
          transcribing: false,
          error: '音声を聞き取れませんでした。テキストで入力してください。',
        });
        return;
      }
      store.setState((s) => ({
        transcribing: false,
        input: s.input ? `${s.input} ${data.text}` : (data.text ?? ''),
      }));
    } catch {
      store.setState({ transcribing: false, error: '音声処理に失敗しました。' });
    }
  }, [store]);

  const suggest = useCallback(async (): Promise<void> => {
    const { sessionId, suggesting, diagram } = store.getState();
    if (!sessionId || suggesting || diagram.steps.length === 0) return;
    store.setState({ suggesting: true, error: null });
    trackToolEvent('tool_export', {
      tool: 'flow-mapper',
      meta: { variant: 'flow-interview', format: 'suggest-to-be' },
    });
    try {
      const res = await fetch('/api/flow/suggest', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = (await res.json()) as {
        summary?: string;
        suggestions?: import('@/lib/flow-interview/suggest').FlowSuggestion[];
        error?: string;
      };
      if (!res.ok || !data.suggestions) {
        store.setState({
          suggesting: false,
          error:
            data.error === 'rate_limited'
              ? '短時間に多くの操作が行われました。少し待ってからお試しください。'
              : '改善案の生成に失敗しました。時間をおいて再度お試しください。',
        });
        return;
      }
      store.setState({
        suggesting: false,
        suggestSummary: data.summary ?? null,
        suggestions: data.suggestions,
      });
    } catch {
      store.setState({ suggesting: false, error: '通信エラーが発生しました。' });
    }
  }, [store]);

  const generateRfp = useCallback(async (): Promise<void> => {
    const { sessionId, rfpLoading, diagram } = store.getState();
    if (!sessionId || rfpLoading || diagram.steps.length === 0) return;
    store.setState({ rfpLoading: true, error: null });
    trackToolEvent('tool_export', {
      tool: 'flow-mapper',
      meta: { variant: 'flow-interview', format: 'rfp-userstories' },
    });
    try {
      const res = await fetch('/api/flow/rfp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = (await res.json()) as { markdown?: string; error?: string };
      if (!res.ok || !data.markdown) {
        store.setState({
          rfpLoading: false,
          error:
            data.error === 'rate_limited'
              ? '短時間に多くの操作が行われました。少し待ってからお試しください。'
              : 'RFPの生成に失敗しました。時間をおいて再度お試しください。',
        });
        return;
      }
      store.setState({ rfpLoading: false, rfpMarkdown: data.markdown });
    } catch {
      store.setState({ rfpLoading: false, error: '通信エラーが発生しました。' });
    }
  }, [store]);

  const toggleRecording = useCallback(async () => {
    const { recording } = store.getState();
    if (recording) {
      mediaRecorderRef.current?.stop();
      return;
    }
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      store.setState({
        error: 'このブラウザは音声入力に対応していません。テキストで入力してください。',
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        void finishRecording();
      };
      recorder.start();
      store.setState({ recording: true, error: null });
    } catch {
      store.setState({ error: 'マイクへのアクセスが許可されませんでした。' });
    }
  }, [store, finishRecording]);

  return { start, answer, suggest, generateRfp, toggleRecording };
}
