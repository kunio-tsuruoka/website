import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { useChatStore } from '../store';
import type { Message } from '../types';
import { SuggestionPills } from './SuggestionPills';

type Props = {
  /** 初回表示時のサジェスト押下ハンドラ。 */
  onPickSuggestion: (text: string) => void;
  /** Turnstile 未取得時にサジェスト押下を不活性化するためのフラグ。 */
  suggestionsDisabled: boolean;
};

export function MessageList({ onPickSuggestion, suggestionsDisabled }: Props) {
  const messages = useChatStore((s) => s.messages);
  const loading = useChatStore((s) => s.loading);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // 新規メッセージが追加されたら下端へスクロール（既存挙動互換）。
  useEffect(() => {
    if (messages.length > 0) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="h-[480px] overflow-y-auto p-6 space-y-4 bg-gray-50">
      {messages.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">IT発注やシステム開発のお悩みを聞かせてください。</p>
          <SuggestionPills onPick={onPickSuggestion} disabled={suggestionsDisabled} />
        </div>
      )}
      {messages.map((m, i) => (
        <MessageBubble key={i} message={m} />
      ))}
      {loading && (
        <div className="flex justify-start">
          <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-500 text-sm">
            考え中...
          </div>
        </div>
      )}
    </div>
  );
}

// 文中の URL（/column/xxx や https://...）をクリック可能なリンクに変換する。
const LINK_PATTERN = /(https?:\/\/[^\s)]+|\/[a-z][a-z0-9-]*(?:\/[a-z0-9-]+)*)/gi;

function linkifyContent(text: string): Array<string | { href: string; label: string }> {
  const parts: Array<string | { href: string; label: string }> = [];
  let lastIndex = 0;
  for (const match of text.matchAll(LINK_PATTERN)) {
    const start = match.index ?? 0;
    if (start > lastIndex) parts.push(text.slice(lastIndex, start));
    parts.push({ href: match[0], label: match[0] });
    lastIndex = start + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const segments = isUser ? null : linkifyContent(message.content);
  return (
    <div className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[80%] px-4 py-3 rounded-2xl whitespace-pre-wrap',
          isUser
            ? 'bg-primary-500 text-white rounded-br-sm'
            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
        )}
      >
        {isUser
          ? message.content
          : segments?.map((seg, i) =>
              typeof seg === 'string' ? (
                <span key={i}>{seg}</span>
              ) : (
                <a
                  key={i}
                  href={seg.href}
                  target={seg.href.startsWith('http') ? '_blank' : undefined}
                  rel={seg.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-primary-600 underline hover:no-underline break-all"
                >
                  {seg.label}
                </a>
              )
            )}
      </div>
      {!isUser && message.references && message.references.length > 0 && (
        <div className="mt-2 max-w-[80%] w-full">
          <p className="text-xs text-gray-500 mb-1">参考にしたコラム</p>
          <ul className="space-y-1">
            {message.references.map((ref) => (
              <li key={ref.id}>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs hover:border-primary-300 hover:bg-primary-50/50 transition"
                >
                  <span className="text-primary-700 font-medium">{ref.title}</span>
                  <span className="block text-gray-500 mt-0.5 line-clamp-2">{ref.excerpt}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!isUser && (
        <div className="mt-3">
          <a
            href="/contact?source=tool-ai-it-advisor"
            className="inline-flex items-center gap-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-full transition"
          >
            具体的な発注支援を相談する
            <span aria-hidden="true">→</span>
          </a>
        </div>
      )}
    </div>
  );
}
