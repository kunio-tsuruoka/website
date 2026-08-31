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
      className="pointer-events-none absolute inset-0 h-full w-full object-cover object-left lg:object-center"
    />

    <div className="container relative mx-auto flex min-h-[420px] items-center px-8 py-14 lg:min-h-[560px] lg:px-12">
      <div className="w-full max-w-[24rem] lg:max-w-[28rem] xl:max-w-[36rem]">
        <h1 className="text-2xl font-bold leading-[1.35] text-accent-950 sm:text-3xl lg:text-4xl xl:text-5xl">
          資料より、まず<span className="text-primary-500">爆速デモ。</span>
          <br />
          見て決めたら、
          <br />
          <span className="text-primary-500">そのまま本番へ。</span>
        </h1>

        <a
          href="/contact?source=home-hero"
          data-cta-source="home-hero"
          data-cta-id="contact"
          className="page-cta group mt-8 inline-flex min-h-[56px] overflow-hidden rounded-md border border-primary-500 bg-primary-500 text-center text-lg font-semibold leading-snug text-white transition-colors hover:border-primary-600 hover:bg-primary-600"
        >
          <span className="flex items-center px-6 py-4 sm:px-8">爆速デモについて相談する</span>
          <span
            aria-hidden="true"
            className="flex items-center self-stretch border-l border-white/30 bg-primary-600 px-4 transition-colors group-hover:bg-accent-950"
          >
            <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </a>
      </div>
    </div>
  </section>
);

export default HeroSection;
