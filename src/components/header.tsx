import { useEffect, useRef, useState } from 'react';

const serviceItems = [
  { label: 'WEBアプリ・モバイルアプリ開発', href: '/services/web-mobile-development' },
  { label: '生成AI受託サービス', href: '/services/ai-development' },
  { label: 'プロトタイプ・PoC開発', href: '/services/prototype-poc' },
  { label: 'AI搭載BtoBサイト制作', href: '/services/ai-b2b-website' },
  { label: 'CDP開発', href: '/services/cdp-development' },
  { label: 'グローバルサービス', href: '/services/global-service' },
];

const companyItems = [
  { label: '会社概要', href: '/company' },
  { label: 'Beekleの強み', href: '/strengths' },
  { label: 'メンバー紹介', href: '/members' },
  { label: '関連資料', href: '/materials' },
];

function Dropdown({
  label,
  items,
}: {
  label: string;
  items: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <li ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-neutral-600 hover:text-accent-600 transition-colors text-xs font-medium flex items-center gap-1 py-0 leading-normal"
      >
        {label}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-500 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </li>
  );
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header
      className={`fixed w-full bg-white/90 backdrop-blur-sm shadow-sm z-50 ${isOpen ? 'min-h-screen' : 'h-auto'}`}
    >
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* ロゴ */}
        <a href="/" className="flex-shrink-0 flex items-center space-x-2">
          <img src="/logo.png" alt="logo" className="h-9 w-auto" />
        </a>

        {/* ハンバーガーメニュー */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-neutral-600 hover:text-accent-600 focus:outline-none"
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
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* デスクトップナビ */}
        <ul
          className={`lg:flex flex-col lg:flex-row items-center gap-5 lg:mt-0 mt-4 transition-all duration-300 whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}
        >
          <li>
            <a
              href="/"
              className="text-neutral-600 hover:text-accent-600 transition-colors text-xs font-medium"
            >
              HOME
            </a>
          </li>
          <Dropdown label="サービス" items={serviceItems} />
          <li>
            <a
              href="/prooffirst"
              className="text-neutral-600 hover:text-accent-600 transition-colors text-xs font-medium"
            >
              ゼロスタート
            </a>
          </li>
          <li>
            <a
              href="/column"
              className="text-neutral-600 hover:text-accent-600 transition-colors text-xs font-medium"
            >
              コラム
            </a>
          </li>
          <li>
            <a
              href="/case-studies"
              className="text-neutral-600 hover:text-accent-600 transition-colors text-xs font-medium"
            >
              導入事例
            </a>
          </li>
          <li>
            <a
              href="/testimonial"
              className="text-neutral-600 hover:text-accent-600 transition-colors text-xs font-medium"
            >
              お客様の声
            </a>
          </li>
          <Dropdown label="会社情報" items={companyItems} />
          <li>
            <a
              href="/contact"
              className="px-4 py-2 bg-primary-500 text-white rounded-full text-sm font-semibold hover:bg-primary-600 transition-colors shadow-soft hover:shadow-medium"
            >
              お問い合わせ
            </a>
          </li>
        </ul>
      </nav>

      {/* モバイルモーダル */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-navy-950 text-white p-8 rounded-[32px] w-full h-full flex flex-col justify-center items-center overflow-y-auto">
            <h2 className="text-3xl font-bold mb-4">メニュー</h2>
            <ul className="flex flex-col items-center space-y-4">
              <li>
                <a
                  href="/"
                  className="hover:text-accent-300 transition-colors text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  HOME
                </a>
              </li>
              <li>
                <a
                  href="/prooffirst"
                  className="hover:text-accent-300 transition-colors text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  ゼロスタート
                </a>
              </li>
              <li>
                <a
                  href="/column"
                  className="hover:text-accent-300 transition-colors text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  コラム
                </a>
              </li>
              <li>
                <a
                  href="/case-studies"
                  className="hover:text-accent-300 transition-colors text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  導入事例
                </a>
              </li>
              <li className="border-t border-white/20 pt-4 w-full text-center">
                <p className="text-white/60 text-sm mb-2">サービス</p>
                <ul className="space-y-2">
                  {serviceItems.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="hover:text-accent-300 transition-colors text-base"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="border-t border-white/20 pt-4 w-full text-center">
                <p className="text-white/60 text-sm mb-2">会社情報</p>
                <ul className="space-y-2">
                  {companyItems.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="hover:text-accent-300 transition-colors text-base"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <a
                  href="/contact"
                  className="px-4 py-2 bg-primary-500 rounded-full text-white hover:bg-primary-600 transition-colors shadow-soft"
                  onClick={() => setIsOpen(false)}
                >
                  お問い合わせ
                </a>
              </li>
            </ul>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white text-3xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
