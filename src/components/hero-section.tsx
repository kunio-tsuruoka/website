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

    <div className="container relative mx-auto flex min-h-[420px] items-center px-8 py-14 lg:min-h-[480px] lg:px-12">
      <div className="max-w-xl xl:max-w-2xl">
        <h1 className="text-5xl font-bold leading-[1.05] text-accent-950 sm:text-6xl md:text-7xl xl:text-8xl">
          爆速開発。
          <br />
          <span className="text-primary-500">だから、開発費を抑えられる。</span>
        </h1>

        <p className="mt-7 max-w-3xl text-lg font-semibold leading-relaxed text-neutral-700 md:text-xl">
          AI前提で開発工数を圧縮。1日でデモ、1週間で触れる形に。
        </p>

        <a
          href="/contact?source=home-hero"
          data-cta-source="home-hero"
          data-cta-id="contact"
          className="page-cta group mt-8 inline-flex items-center justify-center rounded-md bg-primary-500 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-primary-600"
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
