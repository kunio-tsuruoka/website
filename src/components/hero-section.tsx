import { ArrowRight } from 'lucide-react';

export const HeroSection = () => (
  <section className="relative overflow-hidden border-b border-neutral-300 bg-neutral-100 pt-20 text-accent-950">
    <div className="absolute inset-x-0 top-20 h-px bg-neutral-300" />

    <div className="container relative mx-auto flex min-h-[420px] items-center px-8 py-14 lg:min-h-[480px] lg:px-12">
      <div className="max-w-5xl">
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
