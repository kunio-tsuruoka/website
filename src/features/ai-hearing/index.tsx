import { useTurnstile } from '@/lib/use-turnstile';
import { ChatPanel } from './components/ChatPanel';
import { CompletionPanel } from './components/CompletionPanel';
import { SummaryPanel } from './components/SummaryPanel';
import { useHearingFlow } from './hooks/useHearingFlow';
import { useHearingStore } from './store';

/**
 * AI ヒアリング自動化デモの公開エントリ。
 * Astro ページから `<AiHearing client:load sitekey={...} />` で読み込む。
 */
export function AiHearing({ sitekey }: { sitekey: string }) {
  const turnstile = useTurnstile(sitekey);
  const step = useHearingStore((s) => s.step);
  const loading = useHearingStore((s) => s.loading);
  const error = useHearingStore((s) => s.error);
  const { start, answer, goReview, submit } = useHearingFlow();

  const handleStart = () => {
    void start(turnstile.token, turnstile.reset);
  };

  if (step === 'done') {
    return <CompletionPanel />;
  }

  if (step === 'reviewing') {
    return (
      <SummaryPanel
        onSubmit={submit}
        onBack={() => useHearingStore.setState({ step: 'chatting' })}
      />
    );
  }

  if (step === 'chatting') {
    return <ChatPanel onSubmit={(t) => void answer(t)} onProceed={goReview} />;
  }

  // idle: 開始前 (Turnstile + 開始ボタン)
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6 sm:p-8 max-w-2xl mx-auto">
      <h2 className="text-lg font-bold text-navy-950 mb-2">AIによる発注前ヒアリング</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        BeekleのヒアリングAIが、いまの業務課題と発注要件を整理します。会話で答えるだけで、必要な情報が揃った段階で「Beekleに相談する」ボタンが現れます。所要時間の目安は3〜5分です。
      </p>

      <ul className="text-xs text-gray-600 space-y-1 mb-6">
        <li>・専門用語は不要、普段の言葉で大丈夫です</li>
        <li>・最後に連絡先(メールアドレス)を入力します</li>
        <li>・送信前にAIがまとめた内容を確認・編集できます</li>
      </ul>

      <div className="mb-4 flex flex-col items-center gap-2">
        <div ref={turnstile.containerRef} className="min-h-[65px] flex items-center" />
        {!turnstile.token && (
          <p className="text-xs text-gray-500">セキュリティチェックを読み込んでいます...</p>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <button
        type="button"
        onClick={handleStart}
        disabled={!turnstile.token || loading}
        className="w-full px-5 py-3 min-h-[48px] bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white text-sm font-semibold rounded-full transition"
      >
        {loading
          ? '準備中...'
          : !turnstile.token
            ? 'セキュリティチェック待ち...'
            : 'ヒアリングを開始する'}
      </button>

      <p className="text-xs text-gray-500 mt-4 text-center">
        ※ 入力内容はBeekle社内で確認のみに利用します。
        <br />
        通常のフォームでのお問い合わせは
        <a href="/contact" className="text-primary-600 underline hover:no-underline">
          こちら
        </a>
        。
      </p>
    </div>
  );
}
