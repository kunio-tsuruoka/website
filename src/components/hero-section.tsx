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
      className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[54%] object-cover object-[42%_center] md:block xl:w-[52%]"
    />

    <div className="container relative mx-auto flex min-h-[420px] items-center px-8 py-14 lg:min-h-[480px] lg:px-12">
      <div className="w-full max-w-[16.5rem] sm:max-w-[18rem] md:max-w-[20rem] xl:max-w-[22rem]">
        <h1 className="text-4xl font-bold leading-[1.4] text-accent-950 sm:text-5xl">
          爆速開発。
          <br />
          <span className="text-primary-500">だから、</span>
          <br />
          <span className="text-primary-500">開発費を</span>
          <br />
          <span className="text-primary-500">抑えられる。</span>
        </h1>

        <p className="mt-6 text-base font-semibold leading-relaxed text-neutral-700 md:text-lg">
          AI前提で開発工数を圧縮。
          <br />
          1日でデモ、1週間で触れる形に。
        </p>

        <a
          href="/contact?source=home-hero"
          data-cta-source="home-hero"
          data-cta-id="contact"
          className="page-cta group mt-8 inline-flex min-h-[52px] items-center justify-center rounded-md bg-primary-500 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-primary-600"
        >
          相談する
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            <ArrowRight className="ml-2 h-5 w-5" />
          </span>
        </a>
      </div>
    </div>
  </section>
);

export default HeroSection;
