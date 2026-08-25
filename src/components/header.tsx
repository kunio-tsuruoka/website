import { consultationNavigationItems } from '@/data/consultation-situations';

// グローバルナビは「課題から探す」を起点に、進め方 → サービス → 事例 → 判断材料の順で辿れる構成。
// 検索ランディングページ (OCR/チャットボット等のSEO LP) はナビに全部載せず、footerと本文導線で内部リンクを保つ。
const problemItems = consultationNavigationItems;

const methodItems = [
  { label: '進め方の全体像', href: '/strengths' },
  { label: '動くもので判断するゼロスタート', href: '/prooffirst' },
  { label: '要件定義から伴走する開発', href: '/services/requirements-definition-support' },
  { label: '進行管理と仕様の見える化', href: '/strengths' },
];

const serviceItems = [
  { label: 'MVP・PoC・プロトタイプ開発', href: '/services/mvp-poc-development' },
  { label: '生成AI受託開発', href: '/services/ai-development' },
  { label: 'RAGシステム構築', href: '/services/rag-system-development' },
  { label: 'Webアプリ・モバイルアプリ開発', href: '/services/web-mobile-development' },
  { label: 'CDP構築・顧客データ基盤開発', href: '/services/cdp-development' },
];

const knowledgeItems = [
  { label: 'コラム（発注者向け）', href: '/column' },
  { label: 'ブログ（雑記）', href: '/blog' },
  { label: '生成AI導入', href: '/column/genai-adoption' },
  { label: 'Beekleのナレッジ', href: '/knowledge' },
  { label: 'AIデモ', href: '/demos' },
  { label: '資料・判断材料', href: '/materials' },
];

const aboutItems = [
  { label: '会社概要', href: '/company' },
  { label: 'メンバー紹介', href: '/members' },
  { label: 'お客様の声', href: '/testimonial' },
  { label: '採用情報', href: '/careers' },
  { label: '一問一答（よくある質問）', href: '/qa' },
  { label: '開発会社・SIer様へ（協業）', href: '/partner' },
];

const mobileSections: { heading: string; items: { label: string; href: string }[] }[] = [
  { heading: '課題から探す', items: problemItems },
  { heading: '進め方', items: methodItems },
  { heading: 'サービス', items: serviceItems },
  { heading: '判断材料', items: knowledgeItems },
  { heading: 'Beekleについて', items: aboutItems },
];

function Dropdown({
  label,
  items,
}: {
  label: string;
  items: { label: string; href: string }[];
}) {
  return (
    <li className="group relative">
      <button
        type="button"
        className="inline-flex cursor-pointer items-baseline gap-1 text-sm font-medium text-neutral-600 transition-colors hover:text-accent-600"
      >
        {label}
        <svg
          className="h-2.5 w-2.5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="invisible absolute left-0 top-full z-50 w-72 pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="rounded-lg border border-neutral-200 bg-white py-2">
          {items.map((item) => (
            <a
              key={`${item.href}-${item.label}`}
              href={item.href}
              {...(item.href.startsWith('http') ? { rel: 'noopener' } : {})}
              className="block px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-neutral-100 hover:text-primary-600"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </li>
  );
}

export function Header() {
  return (
    <header className="fixed z-50 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-sm">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        <a href="/" className="flex min-h-[44px] flex-shrink-0 items-center space-x-2">
          <img src="/logo.png" alt="logo" width={640} height={166} className="h-9 w-auto" />
        </a>

        <details className="group lg:hidden">
          <summary
            aria-label="メニューを開閉"
            className="-m-3 cursor-pointer list-none p-3 text-neutral-600 hover:text-accent-600 focus:outline-none [&::-webkit-details-marker]:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <title>メニュー</title>
              <path
                className="group-open:hidden"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                className="hidden group-open:block"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </summary>
          <div className="fixed inset-x-0 top-[76px] max-h-[calc(100vh-76px)] overflow-y-auto bg-navy-950 px-8 py-8 text-white">
            <h2 className="mb-5 text-center text-2xl font-bold">メニュー</h2>
            <ul className="mx-auto flex w-full max-w-sm flex-col items-center space-y-4 pb-6">
              <li>
                <a href="/case-studies" className="text-lg transition-colors hover:text-accent-300">
                  導入事例
                </a>
              </li>
              {mobileSections.map((section) => (
                <li
                  key={section.heading}
                  className="w-full border-t border-white/20 pt-4 text-center"
                >
                  <p className="mb-2 text-sm text-white/60">{section.heading}</p>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={`${section.heading}-${item.href}-${item.label}`}>
                        <a
                          href={item.href}
                          {...(item.href.startsWith('http') ? { rel: 'noopener' } : {})}
                          className="text-base transition-colors hover:text-accent-300"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              <li className="flex w-full flex-col items-center gap-3 pt-2">
                <a
                  href="/contact?source=header-mobile"
                  data-cta-source="header-mobile"
                  data-cta-id="contact"
                  className="inline-flex min-h-[48px] w-full max-w-xs items-center justify-center rounded-md bg-primary-500 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-600"
                >
                  実現可否を相談する
                </a>
              </li>
            </ul>
          </div>
        </details>

        <ul className="hidden items-center gap-5 whitespace-nowrap transition-all duration-300 lg:flex lg:flex-row lg:gap-3 lg:mt-0 xl:gap-5">
          <Dropdown label="課題別" items={problemItems} />
          <Dropdown label="進め方" items={methodItems} />
          <Dropdown label="サービス" items={serviceItems} />
          <li>
            <a
              href="/case-studies"
              className="text-neutral-600 hover:text-accent-600 transition-colors text-sm font-medium"
            >
              導入事例
            </a>
          </li>
          <Dropdown label="判断材料" items={knowledgeItems} />
          <li>
            <a
              href="/contact?source=header-desktop"
              data-cta-source="header-desktop"
              data-cta-id="contact"
              className="inline-flex min-h-[44px] items-center rounded-md bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 sm:min-h-0 sm:py-2"
            >
              実現可否を相談する
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
