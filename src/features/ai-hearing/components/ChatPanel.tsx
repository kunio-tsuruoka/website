import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { useHearingStore } from '../store';
import { ProgressBar } from './ProgressBar';

type Props = {
  onSubmit: (text: string) => void;
  onProceed: () => void;
};

export function ChatPanel({ onSubmit, onProceed }: Props) {
  const messages = useHearingStore((s) => s.messages);
  const loading = useHearingStore((s) => s.loading);
  const error = useHearingStore((s) => s.error);
  const input = useHearingStore((s) => s.input);
  const setInput = useHearingStore((s) => s.setInput);
  const progress = useHearingStore((s) => s.progress);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messages.length > 0) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
      <ProgressBar />

      <div ref={scrollRef} className="h-[460px] overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] px-4 py-3 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed',
                m.role === 'user'
                  ? 'bg-primary-500 text-white rounded-br-sm'
                  : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-500 text-sm">
              考えています...
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-4 space-y-3">
        {error && <p className="text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力..."
            disabled={loading}
            maxLength={800}
            className="flex-1 px-4 py-3 min-h-[44px] rounded-full border border-gray-300 focus:outline-none focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500 text-sm"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 min-h-[44px] bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white text-sm font-semibold rounded-full transition"
          >
            送信
          </button>
        </form>

        {progress.ready && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-600 mb-2">
              主要項目が揃いました。整理した内容を確認しますか?
            </p>
            <button
              type="button"
              onClick={onProceed}
              className="w-full px-5 py-3 min-h-[44px] bg-accent-950 hover:bg-accent-900 text-white text-sm font-semibold rounded-full transition"
            >
              サマリを確認する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
