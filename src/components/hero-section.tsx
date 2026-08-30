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
      className="pointer-events-none absolute inset-0 h-full w-full object-cover object-left md:object-center"
    />
    <div className="home-hero-veil pointer-events-none absolute inset-0" aria-hidden="true" />

    <div className="container relative mx-auto flex min-h-[420px] items-center px-8 py-14 lg:min-h-[560px] lg:px-12">
      <div className="w-full max-w-[20rem] xl:max-w-[26rem]">
        <h1 className="text-4xl font-bold leading-[1.35] text-accent-950 sm:text-5xl xl:text-6xl">
          数百万円を
          <br />
          <span className="text-primary-500">発注する前に、</span>
          <br />
          まず動くものを。
        </h1>

        <p className="mt-6 text-base font-semibold leading-relaxed text-neutral-700 md:text-lg">
          要件が固まっていなくても、最短1日でデモ、1週間程度で触れる形へ。
          <br />
          作る・見送る・範囲を変える判断材料を揃えます。
        </p>

        <a
          href="/contact?source=home-hero"
          data-cta-source="home-hero"
          data-cta-id="contact"
          className="page-cta group mt-8 inline-flex min-h-[52px] items-center justify-center rounded-md bg-primary-500 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-primary-600"
        >
          発注前の判断材料をつくる
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            <ArrowRight className="ml-2 h-5 w-5" />
          </span>
        </a>
      </div>
    </div>
  </section>
);

export default HeroSection;
