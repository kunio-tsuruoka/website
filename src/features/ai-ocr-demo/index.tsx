import { useTurnstile } from '@/lib/use-turnstile';
import { ResultPanel } from './components/ResultPanel';
import { UploadPanel } from './components/UploadPanel';
import { useOcrSubmit } from './hooks/useOcrSubmit';

/**
 * AI 領収書 OCR デモの公開エントリ。
 * Astro ページから `import { AiOcrDemo } from '@/features/ai-ocr-demo'` で読み込む。
 */
export function AiOcrDemo({ sitekey }: { sitekey: string }) {
  const turnstile = useTurnstile(sitekey);
  const submitOcr = useOcrSubmit();

  const handleSubmit = () => {
    void submitOcr(turnstile.token, turnstile.reset);
  };

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
      <UploadPanel
        turnstileContainerRef={turnstile.containerRef}
        hasTurnstileToken={Boolean(turnstile.token)}
        onSubmit={handleSubmit}
      />
      <ResultPanel />
    </div>
  );
}
