import { useEffect, useRef } from 'react';
import { useFlowInterviewStore } from '../store';

type Props = {
  onSubmit: (text: string) => void;
  onToggleRecording: () => void;
};

export function ChatPanel({ onSubmit, onToggleRecording }: Props) {
  const messages = useFlowInterviewStore((s) => s.messages);
  const input = useFlowInterviewStore((s) => s.input);
  const loading = useFlowInterviewStore((s) => s.loading);
  const recording = useFlowInterviewStore((s) => s.recording);
  const transcribing = useFlowInterviewStore((s) => s.transcribing);
  const error = useFlowInterviewStore((s) => s.error);
  const setInput = useFlowInterviewStore((s) => s.setInput);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: メッセージ追加・処理状態変化のたびに最下部へ
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, loading]);

  const send = () => {
    const t = input.trim();
    if (!t || loading) return;
    onSubmit(t);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 min-h-[320px] overflow-y-auto space-y-3 pr-1">
        {messages.map((m, i) => (
          <div
            key={`${m.role}-${i}-${m.content.slice(0, 8)}`}
            className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
          >
            <div
              className={
                m.role === 'user'
                  ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-primary-500 text-white px-4 py-2.5 text-sm leading-relaxed'
                  : 'max-w-[85%] rounded-2xl rounded-bl-sm bg-gray-100 text-gray-800 px-4 py-2.5 text-sm leading-relaxed'
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-gray-100 text-gray-500 px-4 py-2.5 text-sm">
              考え中…
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      <div className="mt-3 border-t border-gray-100 pt-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            disabled={loading}
            placeholder={transcribing ? '音声を文字に変換中…' : '回答を入力（⌘/Ctrl+Enterで送信）'}
            className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-50"
          />
          <button
            type="button"
            onClick={onToggleRecording}
            disabled={loading || transcribing}
            aria-label={recording ? '録音を停止' : '音声で入力'}
            title={recording ? '録音を停止' : '音声で入力'}
            className={`shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full border transition ${
              recording
                ? 'bg-red-500 border-red-500 text-white animate-pulse'
                : 'bg-white border-gray-300 text-gray-600 hover:border-primary-400'
            }`}
          >
            {transcribing ? (
              <span className="text-[10px]">変換中</span>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <title>マイク</title>
                <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" />
                <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21a1 1 0 1 0 2 0v-3.08A7 7 0 0 0 19 11Z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={send}
            disabled={loading || !input.trim()}
            className="shrink-0 inline-flex items-center justify-center px-5 h-11 rounded-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white text-sm font-semibold transition"
          >
            送信
          </button>
        </div>
        <p className="mt-2 text-[11px] text-gray-400">
          マイクボタンで音声入力できます（対応ブラウザのみ）。聞き取った内容は送信前に編集できます。
        </p>
      </div>
    </div>
  );
}
