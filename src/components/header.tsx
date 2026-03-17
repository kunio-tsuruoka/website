import { useEffect, useRef, useState } from 'react';

const serviceItems = [
  { label: 'WEBアプリ・モバイルアプリ開発', href: '/services/web-mobile-development' },
  { label: '生成AI受託サービス', href: '/services/ai-development' },
  { label: 'プロトタイプ・PoC開発', href: '/services/prototype-poc' },
  { label: 'AI搭載BtoBサイト制作', href: '/services/ai-b2b-website' },
  { label: 'CDP開発', href: '/services/cdp-development' },
  { label: 'グローバルサービス', href: '/services/global-service' },
];

interface NavigationItem {
  label: string;
  href: string;
}

const navigation: NavigationItem[] = [
  { label: 'HOME', href: '/' },
  { label: 'ゼロスタート', href: '/prooffirst' },
  { label: 'コラム', href: '/column' },
  { label: '関連資料', href: '/materials' },
  { label: '会社概要', href: '/company' },
  { label: 'Beekleの強み', href: '/strengths' },
  { label: '導入事例', href: '/case-studies' },
  { label: 'メンバー紹介', href: '/members' },
  { label: 'お客様の声', href: '/testimonial' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const serviceRef = useRef<HTMLLIElement>(null);

  // クリック外でドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (serviceRef.current && !serviceRef.current.contains(e.target as Node)) {
        setServiceOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`fixed w-full bg-white/90 backdrop-blur-sm shadow-sm z-50 ${isOpen ? 'min-h-screen' : 'h-auto'}`}
    >
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* ロゴ部分 */}
        <a href="/" className="flex items-center space-x-2">
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
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* ナビゲーションメニュー */}
        <ul
          className={`lg:flex flex-col lg:flex-row items-center gap-5 lg:mt-0 mt-4 transition-all duration-300 whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}
        >
          {/* HOME */}
          <li>
            <a
              href="/"
              className="text-neutral-600 hover:text-accent-600 transition-colors text-xs font-medium"
            >
              HOME
            </a>
          </li>

          {/* サービス ドロップダウン */}
          <li ref={serviceRef} className="relative">
            <button
              type="button"
              onClick={() => setServiceOpen(!serviceOpen)}
              className="text-neutral-600 hover:text-accent-600 transition-colors text-xs font-medium flex items-center gap-1"
            >
              サービス
              <svg
                className={`w-3.5 h-3.5 transition-transform ${serviceOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {serviceOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                {serviceItems.map((item) => (
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

          {/* 残りのナビ */}
          {navigation.slice(1).map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="text-neutral-600 hover:text-accent-600 transition-colors text-xs font-medium"
              >
                {item.label}
              </a>
            </li>
          ))}
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

      {/* モーダル */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-navy-950 text-white p-8 rounded-[32px] w-full h-full flex flex-col justify-center items-center overflow-y-auto">
            <h2 className="text-3xl font-bold mb-4">メニュー</h2>
            <ul className="flex flex-col items-center space-y-4">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="hover:text-accent-300 transition-colors text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
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
