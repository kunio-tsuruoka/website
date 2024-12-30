// src/components/Header.tsx
interface NavigationItem {
	label: string;
	href: string;
  }
  
  const navigation: NavigationItem[] = [
	{ label: "HOME", href: "/" },
	{ label: "開発ガイド", href: "/knowledge" },
	{ label: "会社概要", href: "/company" },
	{ label: "CONTACT", href: "/contact" }
  ];
  
  export function Header() {
	return (
	  <header className="fixed w-full bg-white/90 backdrop-blur-sm shadow-sm z-50">
		<nav className="container mx-auto px-4 py-4 flex items-center justify-between">
		  {/* ロゴ部分 */}
		  <a href="/" className="flex items-center space-x-2">
			<div className="flex items-center space-x-2">
			  <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="50" cy="50" r="45" fill="#6366F1" />
				<circle cx="50" cy="50" r="35" fill="white" opacity="0.3" />
				<circle cx="50" cy="50" r="25" fill="white" opacity="0.5" />
				<circle cx="50" cy="50" r="15" fill="white" />
			  </svg>
			  <span className="text-2xl font-bold text-gray-800">Beekle</span>
			  <span className="text-lg text-gray-600">Inc.</span>
			</div>
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
				href="contact"
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