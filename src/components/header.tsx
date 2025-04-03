import { useState } from 'react';

export function Header() {
  const [isOpen, setIsOpen] = useState(false); // ヘッダーの高さとモーダルの開閉を制御
  interface NavigationItem {
    label: string;
    href: string;
  }
  const navigation: NavigationItem[] = [
    { label: 'HOME', href: '/' },
    // { label: '開発ガイド', href: '/knowledge' },
    { label: '会社概要', href: '/company' },
    { label: '導入事例', href: '/case-studies' },
    { label: 'メンバー紹介', href: '/members' },
    { label: 'お客様の声', href: '/testimonial' },
  ];

  return (
    <header
      className={`fixed w-full bg-white/90 backdrop-blur-sm shadow-sm z-50 ${isOpen ? 'min-h-screen' : 'h-auto'}`}
    >
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap">
        {/* ロゴ部分 */}
        <a href="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="logo" className="h-9 w-auto" />
        </a>

        {/* ハンバーガーメニュー */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)} // isOpenをトグルして開閉
            className="text-gray-600 hover:text-indigo-600 focus:outline-none"
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
          className={`lg:flex flex-col lg:flex-row items-center space-x-8 lg:mt-0 mt-4 transition-all duration-300 ${isOpen ? 'block' : 'hidden'}`}
        >
          {navigation.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium"
              >
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="/contact"
              className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              お問い合わせ
            </a>
          </li>
        </ul>
      </nav>

      {/* モーダル */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-indigo-600 text-white p-8 rounded-lg w-full h-full flex flex-col justify-center items-center">
            <h2 className="text-3xl font-semibold mb-4">メニュー</h2>
            <ul className="flex flex-col items-center space-y-4">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="hover:text-indigo-300 transition-colors text-lg"
                    onClick={() => setIsOpen(false)} // ナビゲーションクリックでモーダル閉じる
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/contact"
                  className="px-4 py-2 bg-indigo-500 rounded-full text-white hover:bg-indigo-400 transition-colors"
                  onClick={() => setIsOpen(false)} // お問い合わせボタンでモーダル閉じる
                >
                  お問い合わせ
                </a>
              </li>
            </ul>
            <button
              type="button"
              onClick={() => setIsOpen(false)} // ×ボタンでモーダル閉じる
              className="absolute top-4 right-4 text-white text-3xl"
            >
              &times; {/* Close icon */}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
