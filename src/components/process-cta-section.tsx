export const CTASection = () => {
  return (
    <div className="bg-navy-950">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
          <span className="block">DXを始めませんか？</span>
          <span className="block text-white/90">まずは無料相談からスタート</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="inline-flex shadow-soft">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-full text-navy-950 bg-white hover:bg-gray-50 transition-colors"
            >
              無料相談を予約する
            </a>
          </div>
          <div className="ml-3 inline-flex">
            <a
              href="/case-studies"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-base font-semibold rounded-full text-white bg-transparent hover:bg-white hover:text-navy-950 transition-colors"
            >
              導入事例を見る
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
