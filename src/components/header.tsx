// src/components/Header.tsx
interface NavigationItem {
  label: string;
  href: string;
}

const navigation: NavigationItem[] = [
  { label: 'HOME', href: '/' },
  { label: '開発ガイド', href: '/knowledge' },
  { label: '会社概要', href: '/company' },
  { label: '導入事例', href: '/case-studies' },
  { label: 'CONTACT', href: '/contact' },
];

export function Header() {
  return (
    <header className="fixed w-full bg-white/90 backdrop-blur-sm shadow-sm z-50">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* ロゴ部分 */}
        <a href="/" className="flex items-center space-x-2">
          <img src="logo.png" className="h-9 w-auto" />
        </a>

        {/* ナビゲーションメニュー */}
        <ul className="flex items-center space-x-8">
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
    </header>
  );
}
