import {
  ASK_AI_PROVIDERS,
  type AskAiProviderId,
  buildAskAiPrompt,
  buildAskAiProviderUrl,
  getAskAiProvider,
} from '@/lib/ask-ai';
import { cn } from '@/lib/utils';
import { Sparkles, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

export type AskAiButtonProps = {
  source: string;
  tone?: 'light' | 'dark';
  variant?: 'button' | 'link';
  size?: 'md' | 'lg';
  label?: string;
  pageTitle?: string;
  pageSummary?: string;
  serviceName?: string;
  className?: string;
};

function resolvePageContext(overrides: {
  pageTitle?: string;
  pageSummary?: string;
  serviceName?: string;
}) {
  const pageTitle =
    overrides.pageTitle?.trim() ||
    (typeof document !== 'undefined' ? document.title.replace(/\s*\|\s*Beekle.*$/, '') : 'Beekle');
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://beekle.jp/';
  return {
    pageTitle,
    pageUrl,
    pageSummary: overrides.pageSummary,
    serviceName: overrides.serviceName,
  };
}

export function AskAiButton({
  source,
  tone = 'light',
  variant = 'button',
  size = 'md',
  label = 'AIに相談する',
  pageTitle,
  pageSummary,
  serviceName,
  className,
}: AskAiButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedHint, setCopiedHint] = useState('');
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) {
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
      }
      closeRef.current?.focus();
    } else if (dialog.open) {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    }
  }, [open]);

  const copyPrompt = async (prompt: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(prompt);
      return true;
    } catch {
      return false;
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setCopied(false);
    setCopiedHint('');
  };

  const handleCopy = async () => {
    const prompt = buildAskAiPrompt(resolvePageContext({ pageTitle, pageSummary, serviceName }));
    const ok = await copyPrompt(prompt);
    setCopied(ok);
    setCopiedHint(
      ok ? 'プロンプトをコピーしました' : 'コピーできませんでした。手動で選択してください。'
    );
  };

  const handleProvider = (providerId: AskAiProviderId) => {
    const prompt = buildAskAiPrompt(resolvePageContext({ pageTitle, pageSummary, serviceName }));
    const provider = getAskAiProvider(providerId);
    // クリック同期で開く。await の後だとポップアップブロックされる。
    window.open(buildAskAiProviderUrl(providerId, prompt), '_blank', 'noopener,noreferrer');
    if (!provider.prefill) {
      void copyPrompt(prompt).then((ok) => {
        setCopied(ok);
        setCopiedHint(
          ok
            ? 'プロンプトをコピーしました。開いた画面に貼り付けてください。'
            : 'プロンプトをコピーできませんでした。下のコピーボタンから試してください。'
        );
      });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        data-cta-source={source}
        data-cta-id="ask-ai-open"
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all',
          variant === 'link'
            ? tone === 'dark'
              ? 'min-h-[52px] text-base text-white underline-offset-4 hover:underline'
              : 'min-h-[52px] border-b border-accent-950 text-base text-accent-950 hover:border-primary-500 hover:text-primary-500'
            : cn(
                'rounded-md',
                size === 'lg'
                  ? 'min-h-[52px] px-8 py-4 text-lg'
                  : 'min-h-[52px] px-6 py-3 text-base',
                tone === 'dark'
                  ? 'border border-white bg-transparent text-white hover:bg-white hover:text-accent-950'
                  : 'border border-neutral-300 bg-white text-accent-950 hover:border-primary-500 hover:text-primary-700'
              ),
          className
        )}
      >
        {variant === 'button' && <Sparkles className="mr-2 h-5 w-5" aria-hidden="true" />}
        {label}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="relative w-[calc(100%-2rem)] max-w-lg rounded-lg border border-neutral-300 bg-white p-6 backdrop:bg-accent-950/60 sm:p-8"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
        }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={() => setOpen(false)}
          aria-label="閉じる"
          className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-navy-950"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="border-l-8 border-primary-500 pl-4 text-sm font-bold text-primary-700">
          AIに相談する
        </p>
        <h2 id={titleId} className="mt-3 pr-10 text-2xl font-bold leading-snug text-navy-950">
          普段使っているAIに、合うか聞いてみてください
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600 md:text-base">
          社内の事情を知っているAIに「なぜ合うのか／合わないのか」を聞くと、問い合わせ前に判断材料が揃います。確認用の質問はこちらで用意しています。
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {ASK_AI_PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              type="button"
              onClick={() => handleProvider(provider.id)}
              data-cta-source={source}
              data-cta-id={`ask-ai-${provider.id}`}
              className="inline-flex min-h-[52px] items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-3 text-base font-bold text-accent-950 transition hover:border-primary-500 hover:text-primary-700"
            >
              {provider.label}で聞く
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          data-cta-source={source}
          data-cta-id="ask-ai-copy"
          className="mt-3 inline-flex min-h-[48px] w-full items-center justify-center rounded-md border border-neutral-300 px-4 py-3 text-sm font-bold text-navy-950 transition hover:border-neutral-400 hover:bg-neutral-50"
        >
          {copied ? 'プロンプトをコピーしました' : 'プロンプトだけコピーする'}
        </button>
        {copiedHint && (
          <output className="mt-3 block text-sm leading-relaxed text-neutral-600">
            {copiedHint}
          </output>
        )}
      </dialog>
    </>
  );
}

export default AskAiButton;
