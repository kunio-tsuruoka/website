import { AskAiButton } from '@/components/ask-ai-button';
import { ArrowRight } from 'lucide-react';

export const HeroSection = () => (
  <section className="relative overflow-hidden border-b border-neutral-300 bg-neutral-100 pt-20 text-accent-950">
    <img
      src="/images/home-hero-background.webp"
      alt=""
      width={1672}
      height={941}
      fetchPriority="high"
      decoding="async"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[70%_center] opacity-30 md:opacity-80 lg:opacity-100"
    />
    <div
      className="pointer-events-none absolute inset-y-0 left-0 w-full bg-neutral-100/80 md:w-3/5 md:bg-neutral-100/55 lg:w-[44%] lg:bg-neutral-100/15"
      aria-hidden="true"
    />

    <div className="container relative mx-auto px-8 py-10 md:py-14 lg:flex lg:min-h-[640px] lg:items-center lg:px-12">
      <div className="max-w-xl xl:max-w-2xl">
        <p className="border-l-8 border-primary-500 pl-5 text-sm font-bold text-primary-700">
          要件が固まる前のAI・DX・業務システム相談
        </p>

        <h1 className="mt-6 text-4xl font-bold leading-[1.05] text-accent-950 sm:text-5xl md:text-6xl xl:text-7xl">
          AI・DXで、
          <br />
          <span className="text-primary-500">何を作るべきかから</span>
          <br />
          <span className="text-primary-500">一緒に考える。</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-700 md:text-xl">
          要件が固まる前から、業務課題を整理し、まず動く形で検証します。
          作ってから後悔するのではなく、試してから本開発を決めるためのAI・業務システム開発です。
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <a
            href="/contact?source=home-hero"
            data-cta-source="home-hero"
            data-cta-id="contact"
            className="page-cta group inline-flex items-center justify-center rounded-md bg-primary-500 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-primary-600"
          >
            発注前に相談する
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              <ArrowRight className="ml-2 h-5 w-5" />
            </span>
          </a>
          <a
            href="/case-studies"
            className="inline-flex min-h-[52px] items-center justify-center border-b border-accent-950 text-base font-semibold text-accent-950 transition hover:border-primary-500 hover:text-primary-500"
          >
            実案件の判断材料を見る
          </a>
          <AskAiButton
            source="home-hero"
            variant="link"
            pageTitle="AI・DXで、何を作るべきかから一緒に考える。"
            pageSummary="要件が固まる前から、業務課題を整理し、まず動く形で検証します。作ってから後悔するのではなく、試してから本開発を決めるためのAI・業務システム開発です。"
          />
        </div>

        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-600">
          初回相談・簡易デモは無料。NDA可。要件未確定でも可。PoCが必要な場合は、目的・範囲・判断基準を別途整理します。見送り条件がある場合も、開発前に理由を残します。
        </p>
      </div>
    </div>
  </section>
);

export default HeroSection;
