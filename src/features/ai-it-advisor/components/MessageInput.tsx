import { MAX_INPUT_LEN } from '../constants';
import { useChatStore } from '../store';

type Props = {
  /** Turnstile token 未取得時に送信ボタンを不活性化するためのフラグ。 */
  canSubmit: boolean;
  onSubmit: (text: string) => void;
};

export function MessageInput({ canSubmit, onSubmit }: Props) {
  const input = useChatStore((s) => s.input);
  const loading = useChatStore((s) => s.loading);
  const setInput = useChatStore((s) => s.setInput);

  function trySubmit() {
    onSubmit(input);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        trySubmit();
      }}
      className="flex gap-2"
    >
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            trySubmit();
          }
        }}
        placeholder="例: 200万円の見積もりが妥当かわからない…"
        rows={2}
        maxLength={MAX_INPUT_LEN}
        disabled={loading}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none disabled:bg-gray-100"
      />
      <button
        type="submit"
        disabled={loading || !input.trim() || !canSubmit}
        className="px-5 py-2 bg-primary-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition"
      >
        送信
      </button>
    </form>
  );
}
