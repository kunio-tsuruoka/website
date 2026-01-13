import type { ReactNode } from 'react';

interface PageHeroProps {
  /** 大きな英字テキスト（例: "STRENGTHS", "WORKS"） */
  englishTitle: string;
  /** 日本語タイトル（h1） */
  title: string | ReactNode;
  /** サブタイトル/説明文（オプション） */
  subtitle?: string;
  /** デコレーションの種類 */
  decoration?: 'fullDark' | 'barsDark' | 'none';
  /** バッジテキスト（オプション） */
  badge?: string;
  /** 追加コンテンツ（CTAボタンなど） */
  children?: ReactNode;
}

export function PageHero({
  englishTitle,
  title,
  subtitle,
  decoration = 'fullDark',
  badge,
  children,
}: PageHeroProps) {
  const decorationClasses = {
    fullDark: 'before:absolute before:inset-0 before:bg-grid-pattern before:opacity-10',
    barsDark: 'before:absolute before:inset-0 before:bg-grid-pattern before:opacity-10',
    none: '',
  };

  return (
    <section
      className={`relative py-24 md:py-32 bg-primary-500 overflow-hidden ${decorationClasses[decoration]}`}
    >
      {/* Floating decorations */}
      <div className="absolute top-10 right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-10 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

      <div className="container mx-auto px-6 md:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* バッジ */}
          {badge && (
            <div className="inline-block mb-6">
              <span className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                {badge}
              </span>
            </div>
          )}

          {/* 英字タイトル */}
          <span className="font-Poppins text-7xl md:text-8xl lg:text-9xl font-bold text-white/20 block mb-4 select-none">
            {englishTitle}
          </span>

          {/* 日本語タイトル - デザイントークン typography.heading.h1 準拠 */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">{title}</h1>

          {/* サブタイトル */}
          {subtitle && (
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
              {subtitle}
            </p>
          )}

          {/* 追加コンテンツ（CTAボタンなど） */}
          {children}
        </div>
      </div>
    </section>
  );
}
