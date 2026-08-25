import { AskAiButton } from '@/components/ask-ai-button';

type AskAiSectionProps = {
  source: string;
  pageTitle?: string;
  pageSummary?: string;
  serviceName?: string;
};

export function AskAiSection({ source, pageTitle, pageSummary, serviceName }: AskAiSectionProps) {
  return (
    <section className="border-y border-neutral-300 bg-neutral-50 py-16 md:py-20">
      <div className="container mx-auto px-8 lg:px-12">
        <div className="mx-auto max-w-3xl rounded-md border border-neutral-300 bg-white p-6 md:p-8">
          <p className="border-l-8 border-primary-500 pl-4 text-sm font-bold text-primary-700">
            問い合わせの前に
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-navy-950 md:text-4xl">
            普段のAIへ、合うか聞いてみてください
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
