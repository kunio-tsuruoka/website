import { trackCtaClick } from '@/lib/analytics';

type CTASectionProps = {
  source?: string;
};

export const CTASection = ({ source = 'process-cta-section' }: CTASectionProps) => {
  return (
    <div className="bg-navy-950">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
          <span className="block">作るべきか、発注前に整理しませんか？</span>
          <span className="block text-white/90">PoCや本開発の前に、判断材料を整理します</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="inline-flex">
            <a
              href={`/contact?source=${encodeURIComponent(source)}`}
              onClick={() => trackCtaClick({ source, cta: 'contact' })}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-6 py-3 text-base font-semibold text-navy-950 transition-colors hover:bg-gray-50"
            >
              初回相談・簡易デモの範囲を確認する
            </a>
          </div>
          <div className="ml-3 inline-flex">
            <a
              href="/case-studies"
              className="inline-flex items-center justify-center rounded-md border-2 border-white bg-transparent px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white hover:text-navy-950"
            >
              導入事例を見る
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
