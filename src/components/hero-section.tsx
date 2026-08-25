import { AskAiButton } from '@/components/ask-ai-button';
import { ArrowRight } from 'lucide-react';

const sheetRows = [
  {
    label: '最初の不安',
    value: 'この要件で発注していいか',
  },
  {
    label: '判断の根拠',
    value: '対象業務、利用者、既存データ、月間工数',
  },
  {
    label: '返すもの',
    value: '判断シート / 検証用プロトタイプ / 受入条件',
  },
  {
    label: '見送り条件',
    value: 'データ不足、利用者不在、投資根拠不足',
  },
];

const outputItems = ['受入条件', '投資レンジ', '見送り条件'];

export const HeroSection = () => (
  <section className="relative overflow-hidden border-b border-neutral-300 bg-neutral-100 pt-20 text-accent-950">
    <div className="absolute inset-x-0 top-20 h-px bg-neutral-300" />

    <div className="container relative mx-auto grid gap-10 px-8 py-10 md:py-14 lg:min-h-[640px] lg:grid-cols-[0.9fr_0.85fr] lg:items-center lg:gap-16 lg:px-12">
      <div className="max-w-3xl">
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

        <div className="mt-6 border-y border-neutral-300 bg-white px-4 py-4 md:hidden">
          <p className="text-sm font-bold text-primary-500">発注判断シート</p>
          <p className="mt-2 text-base font-bold leading-relaxed text-accent-950">
            判断の根拠 / 受入条件 / 投資レンジ
          </p>
        </div>
      </div>

      <div className="hidden border-y border-neutral-300 bg-white md:block">
        <div className="grid grid-cols-[1fr_auto] items-start gap-4 border-b border-neutral-300 border-l-8 border-primary-500 px-5 py-4">
          <div>
            <p className="text-sm font-bold text-primary-700">発注判断シート</p>
            <p className="mt-1 text-2xl font-bold leading-tight text-accent-950">検証前ドラフト</p>
          </div>
          <p className="font-Poppins text-xs font-bold text-neutral-500">BEEKLE / 01</p>
        </div>

        <dl className="divide-y divide-neutral-300">
          {sheetRows.map((row) => (
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
          <p className="text-sm font-bold text-primary-700">初回相談で揃える材料</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {outputItems.map((item) => (
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
