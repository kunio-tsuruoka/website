import { trackCtaClick } from '@/lib/analytics';
import { useEffect, useRef, useState } from 'react';

// グローバルナビは「課題から探す」を起点に、開発方法 → サービス → 事例 → ナレッジの順で辿れる構成 (tasks.md TASK-008)。
// 検索ランディングページ (OCR/チャットボット等のSEO LP) はナビに全部載せず、footerと本文導線で内部リンクを保つ。
const problemItems = [
  { label: '新規事業を早く検証したい', href: '/services/mvp-poc-development' },
  { label: 'AIで業務を効率化したい', href: '/services/ai-development' },
  { label: '属人業務をシステム化したい', href: '/services/web-mobile-development' },
  { label: '社内情報をAI活用したい', href: '/services/rag-system-development' },
  { label: 'データを活用したい', href: '/services/cdp-development' },
];

const methodItems = [
  { label: 'Beekleの開発方法（強み）', href: '/strengths' },
  { label: 'Proof-first・ゼロスタート', href: '/prooffirst' },
  { label: '要件定義から伴走する開発', href: '/services/requirements-definition-support' },
  { label: 'PM on Rails（自社開発のPM基盤）', href: 'https://pmonrails.com' },
];

const serviceItems = [
  { label: 'MVP・PoC・プロトタイプ開発', href: '/services/mvp-poc-development' },
  { label: '生成AI受託開発', href: '/services/ai-development' },
  { label: 'RAGシステム構築', href: '/services/rag-system-development' },
  { label: 'WEBアプリ・モバイルアプリ開発', href: '/services/web-mobile-development' },
  { label: 'CDP構築・顧客データ基盤開発', href: '/services/cdp-development' },
];

const knowledgeItems = [
  { label: 'コラム（発注者向け）', href: '/column' },
  { label: '生成AI導入', href: '/column/genai-adoption' },
  { label: 'Beekleのナレッジ', href: '/knowledge' },
  { label: 'AIデモ', href: '/demos' },
  { label: '発注準備キット（無料ツール）', href: '/tools' },
  { label: 'ゼロスタート開発 資料DL', href: '/downloads/zero-start' },
  { label: '資料・ツール', href: '/materials' },
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
  { heading: 'Beekleの開発方法', items: methodItems },
  { heading: 'サービス', items: serviceItems },
  { heading: 'ナレッジ', items: knowledgeItems },
  { heading: 'Beekleについて', items: aboutItems },
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
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              {...(item.href.startsWith('http') ? { rel: 'noopener' } : {})}
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
        <a href="/" className="flex-shrink-0 flex items-center space-x-2 min-h-[44px]">
          <img src="/logo.png" alt="logo" width={640} height={166} className="h-9 w-auto" />
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
          className={`lg:flex flex-col lg:flex-row items-center gap-5 lg:gap-3 xl:gap-5 lg:mt-0 mt-4 transition-all duration-300 whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}
        >
          <li>
            <a
              href="/"
              className="text-neutral-600 hover:text-accent-600 transition-colors text-sm font-medium"
            >
              HOME
            </a>
          </li>
          <Dropdown label="課題から探す" items={problemItems} />
          <Dropdown label="Beekleの開発方法" items={methodItems} />
          <Dropdown label="サービス" items={serviceItems} />
          <li>
            <a
              href="/case-studies"
              className="text-neutral-600 hover:text-accent-600 transition-colors text-sm font-medium"
            >
              導入事例
            </a>
          </li>
          <Dropdown label="ナレッジ" items={knowledgeItems} />
          <Dropdown label="Beekleについて" items={aboutItems} />
          <li>
            <a
              href="/contact?source=header-desktop"
              onClick={() => trackCtaClick({ source: 'header-desktop', cta: 'contact' })}
              className="inline-flex items-center px-4 py-3 sm:py-2 min-h-[44px] sm:min-h-0 bg-primary-500 text-white rounded-full text-sm font-semibold hover:bg-primary-600 transition-colors shadow-soft hover:shadow-medium"
            >
              業務課題を相談する
            </a>
          </li>
        </ul>
      </nav>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-navy-950 text-white p-8 rounded-[32px] w-full h-full flex flex-col items-center overflow-y-auto">
            <h2 className="text-3xl font-bold mb-4 mt-8">メニュー</h2>
            <ul className="flex flex-col items-center space-y-4 w-full max-w-sm pb-12">
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
                  href="/case-studies"
                  className="hover:text-accent-300 transition-colors text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  導入事例
                </a>
              </li>
              {mobileSections.map((section) => (
                <li
                  key={section.heading}
                  className="border-t border-white/20 pt-4 w-full text-center"
                >
                  <p className="text-white/60 text-sm mb-2">{section.heading}</p>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          {...(item.href.startsWith('http') ? { rel: 'noopener' } : {})}
                          className="hover:text-accent-300 transition-colors text-base"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              <li className="pt-2 flex flex-col items-center gap-3 w-full">
                <a
                  href="/contact?source=header-mobile"
                  className="inline-flex items-center justify-center w-full max-w-xs px-6 py-3 min-h-[48px] bg-primary-500 rounded-full text-white text-base font-semibold hover:bg-primary-600 transition-colors shadow-soft"
                  onClick={() => {
                    trackCtaClick({ source: 'header-mobile', cta: 'contact' });
                    setIsOpen(false);
                  }}
                >
                  業務課題を相談する
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
