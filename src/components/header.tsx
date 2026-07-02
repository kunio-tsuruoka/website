import { trackCtaClick } from '@/lib/analytics';
import { useEffect, useRef, useState } from 'react';

const aiServiceItems = {
  featured: {
    label: '社内文書AI検索',
    description: 'PDF・マニュアル・規程集をAIで検索',
    href: '/services/internal-document-ai-search',
  },
  services: [
    { label: '生成AI受託開発', href: '/services/ai-development' },
    { label: 'RAGシステム構築', href: '/services/rag-system-development' },
    { label: 'AIチャットボット開発', href: '/services/ai-chatbot-development' },
    { label: 'OCR・帳票読み取りAI', href: '/services/ocr-ai-development' },
    { label: 'AIエージェント開発', href: '/services/ai-agent-development' },
  ],
};

const serviceItems = [
  { label: 'WEBアプリ・モバイルアプリ開発', href: '/services/web-mobile-development' },
  { label: 'CDP構築・顧客データ基盤開発', href: '/services/cdp-development' },
];

const columnItems = [
  { label: 'コラム一覧（発注者向け）', href: '/column' },
  { label: '生成AI導入', href: '/column/genai-adoption' },
  { label: 'Beekleのナレッジ', href: '/knowledge' },
];

const companyItems = [
  { label: '会社概要', href: '/company' },
  { label: 'Beekleの強み', href: '/strengths' },
  { label: 'メンバー紹介', href: '/members' },
  { label: 'お客様の声', href: '/testimonial' },
  { label: '採用情報', href: '/careers' },
  { label: '一問一答（よくある質問）', href: '/qa' },
  { label: 'ゼロスタート開発 資料DL', href: '/downloads/zero-start' },
  { label: '関連資料・資料ダウンロード', href: '/materials' },
  { label: '開発会社・SIer様へ（協業）', href: '/partner' },
];

const toolsItems = [
  { label: '発注準備キット (全体像)', href: '/tools' },
  { label: '話すだけ発注準備（AI・音声対応）', href: '/tools/flow-interview' },
  { label: '1. 業務フロー可視化ツール', href: '/tools/flow-mapper' },
  { label: '2. ユーザーストーリー作成ツール', href: '/tools/story-builder' },
  { label: '3. スコープ管理ツール', href: '/tools/scope-manager' },
  { label: '4. RFPドラフト自動生成', href: '/tools/rfp-builder' },
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
        aria-expanded={open}
        className="text-neutral-600 hover:text-accent-600 transition-colors text-sm font-medium inline-flex items-baseline gap-1"
      >
        {label}
        <svg
          className={`w-2.5 h-2.5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
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

function AiDevDropdown() {
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
        aria-expanded={open}
        className="text-neutral-600 hover:text-accent-600 transition-colors text-sm font-medium inline-flex items-baseline gap-1"
      >
        生成AI開発
        <svg
          className={`w-2.5 h-2.5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-3 z-50">
          <div className="px-4 pb-2">
            <p className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-2">
              おすすめ
            </p>
            <a
              href={aiServiceItems.featured.href}
              className="block rounded-lg bg-primary-50 border border-primary-100 px-4 py-3 hover:bg-primary-100 transition-colors"
            >
              <span className="block text-sm font-bold text-navy-950">
                {aiServiceItems.featured.label}
              </span>
              <span className="block text-xs text-gray-500 mt-0.5">
                {aiServiceItems.featured.description}
              </span>
            </a>
          </div>
          <div className="border-t border-gray-100 mt-1 pt-2 px-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              サービス一覧
            </p>
            {aiServiceItems.services.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-500 rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);

  return (
    <header
      className={`fixed w-full bg-white/90 backdrop-blur-sm shadow-sm z-50 ${isOpen ? 'min-h-screen' : 'h-auto'}`}
    >
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" className="flex-shrink-0 flex items-center space-x-2 min-h-[44px]">
          <img src="/logo.png" alt="logo" className="h-9 w-auto" />
        </a>

        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="メニューを開閉"
            className="text-neutral-600 hover:text-accent-600 focus:outline-none p-3 -m-3"
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

        <ul
          className={`lg:flex flex-col lg:flex-row items-center gap-5 lg:mt-0 mt-4 transition-all duration-300 whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}
        >
          <li>
            <a
              href="/"
              className="text-neutral-600 hover:text-accent-600 transition-colors text-sm font-medium"
            >
              HOME
            </a>
          </li>
          <AiDevDropdown />
          <li>
            <a
              href="/demos"
              className="text-neutral-600 hover:text-accent-600 transition-colors text-sm font-medium"
            >
              AIデモ
            </a>
          </li>
          <Dropdown label="システム開発" items={serviceItems} />
          <li>
            <a
              href="/prooffirst"
              className="text-neutral-600 hover:text-accent-600 transition-colors text-sm font-medium"
            >
              ゼロスタート
            </a>
          </li>
          <li>
            <a
              href="/case-studies"
              className="text-neutral-600 hover:text-accent-600 transition-colors text-sm font-medium"
            >
              導入事例
            </a>
          </li>
          <Dropdown label="コラム" items={columnItems} />
          <Dropdown label="発注準備キット" items={toolsItems} />
          <Dropdown label="会社情報" items={companyItems} />
          <li>
            <a
              href="/contact?source=header-desktop"
              onClick={() => trackCtaClick({ source: 'header-desktop', cta: 'contact' })}
              className="inline-flex items-center px-4 py-3 sm:py-2 min-h-[44px] sm:min-h-0 bg-primary-500 text-white rounded-full text-sm font-semibold hover:bg-primary-600 transition-colors shadow-soft hover:shadow-medium"
            >
              お問い合わせ
            </a>
          </li>
        </ul>
      </nav>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-navy-950 text-white p-8 rounded-[32px] w-full h-full flex flex-col justify-center items-center overflow-y-auto">
            <h2 className="text-3xl font-bold mb-4">メニュー</h2>
            <ul className="flex flex-col items-center space-y-4 w-full max-w-sm">
              <li>
                <a
                  href="/"
                  className="hover:text-accent-300 transition-colors text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  HOME
                </a>
              </li>
              <li className="border-t border-white/20 pt-4 w-full text-center">
                <button
                  type="button"
                  onClick={() => setAiExpanded(!aiExpanded)}
                  className="text-lg font-medium hover:text-accent-300 transition-colors inline-flex items-center gap-1"
                >
                  生成AI開発
                  <svg
                    className={`w-3 h-3 transition-transform ${aiExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {aiExpanded && (
                  <div className="mt-3 space-y-3">
                    <a
                      href={aiServiceItems.featured.href}
                      className="block mx-auto max-w-xs rounded-lg bg-white/10 border border-white/20 px-4 py-3 hover:bg-white/20 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="block text-base font-bold text-white">
                        {aiServiceItems.featured.label}
                      </span>
                      <span className="block text-xs text-white/60 mt-0.5">
                        {aiServiceItems.featured.description}
                      </span>
                    </a>
                    <ul className="space-y-2">
                      {aiServiceItems.services.map((item) => (
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
                  </div>
                )}
              </li>
              <li className="border-t border-white/20 pt-4 w-full text-center">
                <a
                  href="/demos"
                  className="hover:text-accent-300 transition-colors text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  AIデモ
                </a>
              </li>
              <li className="border-t border-white/20 pt-4 w-full text-center">
                <p className="text-white/60 text-sm mb-2">システム開発</p>
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
                  href="/prooffirst"
                  className="hover:text-accent-300 transition-colors text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  ゼロスタート
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
              <li>
                <a
                  href="/column"
                  className="hover:text-accent-300 transition-colors text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  発注者向けコラム
                </a>
              </li>
              <li>
                <a
                  href="/column/genai-adoption"
                  className="hover:text-accent-300 transition-colors text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  生成AI導入
                </a>
              </li>
              <li>
                <a
                  href="/knowledge"
                  className="hover:text-accent-300 transition-colors text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  ナレッジ
                </a>
              </li>
              <li>
                <a
                  href="/testimonial"
                  className="hover:text-accent-300 transition-colors text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  お客様の声
                </a>
              </li>
              <li className="border-t border-white/20 pt-4 w-full text-center">
                <p className="text-white/60 text-sm mb-2">発注準備キット</p>
                <ul className="space-y-2">
                  {toolsItems.map((item) => (
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
              <li className="pt-2 flex flex-col items-center gap-3 w-full">
                <a
                  href="/contact?source=header-mobile"
                  className="inline-flex items-center justify-center w-full max-w-xs px-6 py-3 min-h-[48px] bg-primary-500 rounded-full text-white text-base font-semibold hover:bg-primary-600 transition-colors shadow-soft"
                  onClick={() => {
                    trackCtaClick({ source: 'header-mobile', cta: 'contact' });
                    setIsOpen(false);
                  }}
                >
                  お問い合わせ
                </a>
                <a
                  href="/downloads/zero-start?source=header-mobile"
                  className="inline-flex items-center justify-center w-full max-w-xs px-6 py-3 min-h-[48px] bg-white/10 border border-white/40 rounded-full text-white text-base font-medium hover:bg-white/20 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  資料ダウンロード（無料）
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
