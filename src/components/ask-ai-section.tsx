import { AskAiButton } from '@/components/ask-ai-button';

type AskAiSectionProps = {
  source: string;
  pageTitle?: string;
  pageSummary?: string;
  serviceName?: string;
};

export function AskAiSection({ source, pageTitle, pageSummary, serviceName }: AskAiSectionProps) {
  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-24">
      <div
        className="pointer-events-none absolute -right-16 top-8 h-64 w-64 rounded-full bg-primary-100/70 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-secondary-100/50 blur-3xl"
        aria-hidden="true"
      />
      <div className="container relative mx-auto px-8 lg:px-12">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-primary-200 bg-primary-50 p-8 shadow-soft md:p-10">
          <p className="text-xs font-bold tracking-wide text-primary-500">ASK YOUR AI</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-navy-950 md:text-4xl">
            問い合わせの前に、普段のAIへ聞いてみてください
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-700 md:text-lg">
            営業資料だけでは、自社に合うか判断しにくいことがあります。社内の制約や今の状況を知っているAIに聞くと、合う理由と合わない理由が先に見えます。
          </p>
          <div className="mt-8">
            <AskAiButton
              source={source}
              tone="light"
              size="lg"
              pageTitle={pageTitle}
              pageSummary={pageSummary}
              serviceName={serviceName}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default AskAiSection;
