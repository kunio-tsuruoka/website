import { useTurnstile } from '@/lib/use-turnstile';
import { MessageInput } from './components/MessageInput';
import { MessageList } from './components/MessageList';
import { useChatSubmit } from './hooks/useChatSubmit';
import { useChatStore } from './store';

/**
 * AI IT 発注相談チャットの公開エントリ。
 * Astro ページから `import { AiItAdvisor } from '@/features/ai-it-advisor'` で読み込む。
 */
export function AiItAdvisor({ sitekey }: { sitekey: string }) {
  const turnstile = useTurnstile(sitekey);
  const error = useChatStore((s) => s.error);
  const send = useChatSubmit();

  const submit = (text: string) => {
    void send(text, turnstile.token, turnstile.reset);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
      <MessageList onPickSuggestion={submit} suggestionsDisabled={!turnstile.token} />

      <div className="border-t border-gray-200 p-4 space-y-3">
        <div ref={turnstile.containerRef} className="flex justify-center" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <MessageInput canSubmit={Boolean(turnstile.token)} onSubmit={submit} />
        <p className="text-xs text-gray-500">
          ※ AIによる一次回答です。具体的な発注支援は
          <a
            href="/contact?source=tool-ai-it-advisor"
            className="text-primary-600 underline hover:no-underline"
          >
            お問い合わせ
          </a>
          からどうぞ。
        </p>
      </div>
    </div>
  );
}
