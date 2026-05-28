import { useCallback } from 'react';
import { useHearingStore } from '../store';
import type { ChatApiResponse, HearingProfile, SubmitApiResponse } from '../types';

export function useHearingFlow() {
  const store = useHearingStore;

  const start = useCallback(
    async (turnstileToken: string | null, resetTurnstile: () => void): Promise<void> => {
      const { loading } = store.getState();
      if (loading) return;
      if (!turnstileToken) {
        store.setState({ error: 'セキュリティチェックを完了してください。' });
        return;
      }
      store.setState({ loading: true, error: null });
      try {
        const res = await fetch('/api/hearing/start', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'cf-turnstile-response': turnstileToken },
          body: JSON.stringify({ turnstileToken }),
        });
        const data = (await res.json()) as ChatApiResponse;
        if (!res.ok) {
          store.setState({
            error: 'error' in data ? translate(res.status, data.error) : '開始に失敗しました。',
            loading: false,
          });
          resetTurnstile();
          return;
        }
        if ('sessionId' in data) {
          store.getState().hydrateFromStart({
            sessionId: data.sessionId,
            assistantMessage: data.assistantMessage,
            profile: data.profile,
          });
          store.setState({
            progress: data.progress,
            loading: false,
          });
        }
        resetTurnstile();
      } catch {
        store.setState({
          error: '通信エラーが発生しました。時間をおいて再度お試しください。',
          loading: false,
        });
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
        const res = await fetch('/api/hearing/answer', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sessionId, message: trimmed }),
        });
        const data = (await res.json()) as ChatApiResponse;
        if (!res.ok) {
          store.setState({
            error: 'error' in data ? translate(res.status, data.error) : '送信に失敗しました。',
            loading: false,
          });
          return;
        }
        if ('assistantMessage' in data) {
          store.getState().appendAssistant(data.assistantMessage);
          store.setState({
            profile: data.profile,
            progress: data.progress,
            loading: false,
          });
        }
      } catch {
        store.setState({
          error: '通信エラーが発生しました。時間をおいて再度お試しください。',
          loading: false,
        });
      }
    },
    [store]
  );

  const goReview = useCallback(() => {
    store.setState({ step: 'reviewing' });
  }, [store]);

  const submit = useCallback(
    async (args: {
      contactEmail: string;
      contactName?: string;
      contactCompany?: string;
      editedProfile?: Partial<HearingProfile>;
    }): Promise<void> => {
      const { loading, sessionId } = store.getState();
      if (loading || !sessionId) return;
      if (!args.contactEmail.trim()) {
        store.setState({ error: 'メールアドレスを入力してください。' });
        return;
      }
      store.setState({ loading: true, error: null });
      try {
        const res = await fetch('/api/hearing/submit', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            contact: {
              contactEmail: args.contactEmail,
              ...(args.contactName ? { contactName: args.contactName } : {}),
              ...(args.contactCompany ? { contactCompany: args.contactCompany } : {}),
            },
            ...(args.editedProfile ? { editedProfile: args.editedProfile } : {}),
          }),
        });
        const data = (await res.json()) as SubmitApiResponse;
        if (!res.ok) {
          store.setState({
            error: 'error' in data ? translate(res.status, data.error) : '送信に失敗しました。',
            loading: false,
          });
          return;
        }
        store.setState({ step: 'done', loading: false });
      } catch {
        store.setState({
          error: '通信エラーが発生しました。時間をおいて再度お試しください。',
          loading: false,
        });
      }
    },
    [store]
  );

  return { start, answer, goReview, submit };
}

function translate(status: number, code: string): string {
  switch (code) {
    case 'rate_limited':
      return '短時間に多くの操作が行われました。少し待ってからお試しください。';
    case 'budget_exceeded':
      return 'AIデモは月次の利用上限に達しました。担当者に通知済みです。来月以降にお試しください。';
    case 'session_not_found':
      return 'セッションの有効期限が切れました。最初からやり直してください。';
    case 'too_many_turns':
      return '対話の上限に達しました。サマリ確認へ進んでください。';
    case 'already_submitted':
      return '送信済みのセッションです。';
    case 'webhook_missing':
      return '送信先の設定に問題があります。お問い合わせフォームをご利用ください。';
    case 'webhook_failed':
      return '送信に失敗しました。時間をおいて再度お試しください。';
    default:
      return status >= 500
        ? 'サーバー側で一時的な問題が発生しています。'
        : '入力内容に問題があるようです。';
  }
}
