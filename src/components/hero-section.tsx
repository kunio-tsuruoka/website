import { AskAiButton } from '@/components/ask-ai-button';
import { ArrowRight } from 'lucide-react';

const speedRows = [
  {
    label: '速く作る',
    value: '1日でデモ化 / 1週間程度で触れる形にした実績',
  },
  {
    label: '工数を減らす',
    value: 'AIを前提に、調査・設計・実装・検証を高速化',
  },
  {
    label: '総額を抑える',
    value: '必要な人月を減らし、同じ予算で作れる範囲を広げる',
  },
  {
    label: '検証を増やす',
    value: '早く見せて、ズレを小さいうちに修正する',
  },
];

const proofItems = [
  '1日でデモ',
  '1週間程度で触れる形',
  '3週間で難航案件を立て直し',
];

export const HeroSection = () => (
  <section className="relative overflow-hidden border-b border-neutral-300 bg-neutral-100 pt-20 text-accent-950">
    <div className="absolute inset-x-0 top-20 h-px bg-neutral-300" />

    <div className="container relative mx-auto grid gap-10 px-8 py-10 md:py-14 lg:min-h-[640px] lg:grid-cols-[0.9fr_0.85fr] lg:items-center lg:gap-16 lg:px-12">
      <div className="max-w-3xl">
        <p className="border-l-8 border-primary-500 pl-5 text-sm font-bold text-primary-700">
          AI・DX・業務システムを、少ない工数で速く形にする
        </p>

        <h1 className="mt-6 text-4xl font-bold leading-[1.05] text-accent-950 sm:text-5xl md:text-6xl xl:text-7xl">
          開発が速い。
          <br />
          <span className="text-primary-500">だから、同じ予算で</span>
          <br />
          <span className="text-primary-500">より多く前に進める。</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-700 md:text-xl">
          Beekleは、業務課題の整理からプロトタイプ、本開発までをAIを前提に高速化します。
          必要な人月を減らし、その分、開発総額を抑えながら、検証と改善の回数を増やします。
          安いから速いのではなく、速いからコストを下げられる開発です。
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
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
            速さの実績を見る
          </a>
          <AskAiButton
            source="home-hero"
            variant="link"
            pageTitle="開発が速い。だから、同じ予算でより多く前に進める。"
            pageSummary="Beekleは、業務課題の整理からプロトタイプ、本開発までをAIを前提に高速化します。必要な人月を減らし、開発総額を抑えながら、検証と改善の回数を増やします。"
          />
        </div>

        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-600">
          初回相談・簡易デモは無料。NDA可。要件未確定でも可。まず業務と優先順位を絞り、最小単位を早く動かします。速さのために品質を落とすのではなく、手戻りと待ち時間を減らします。
        </p>

        <div className="mt-6 border-y border-neutral-300 bg-white px-4 py-4 md:hidden">
          <p className="text-sm font-bold text-primary-500">開発効率の構造</p>
          <p className="mt-2 text-base font-bold leading-relaxed text-accent-950">
            速く作る / 工数を減らす / 総額を抑える / 検証を増やす
          </p>
        </div>
      </div>

      <div className="hidden border-y border-neutral-300 bg-white md:block">
        <div className="grid grid-cols-[1fr_auto] items-start gap-4 border-b border-neutral-300 border-l-8 border-primary-500 px-5 py-4">
          <div>
            <p className="text-sm font-bold text-primary-700">開発効率の構造</p>
            <p className="mt-1 text-2xl font-bold leading-tight text-accent-950">
              速さがコストに効く理由
            </p>
          </div>
          <p className="font-Poppins text-xs font-bold text-neutral-500">BEEKLE / 01</p>
        </div>

        <dl className="divide-y divide-neutral-300">
          {speedRows.map((row) => (
            <div key={row.label} className="grid grid-cols-[128px_1fr]">
              <dt className="border-r border-neutral-200 bg-neutral-50 px-5 py-4 text-sm font-bold text-primary-700">
                {row.label}
              </dt>
              <dd className="px-5 py-4 text-base font-bold leading-relaxed text-accent-950">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="border-t border-neutral-300 px-5 py-4">
          <p className="text-sm font-bold text-primary-700">実案件で確認できる速度</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {proofItems.map((item) => (
              <span
                key={item}
                className="border-l-2 border-primary-500 pl-3 text-sm font-bold text-accent-950"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
