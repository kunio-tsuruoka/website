import type { ReactNode } from 'react';

interface PageHeroProps {
  /** 日本語タイトル（h1） */
  title: string | ReactNode;
  /** サブタイトル/説明文（オプション） */
  subtitle?: string;
  /** バッジテキスト（オプション） */
  badge?: string;
  /** 追加コンテンツ（CTAボタンなど） */
  children?: ReactNode;
}

export function PageHero({ title, subtitle, badge, children }: PageHeroProps) {
  return (
    <section className="relative bg-primary-500 py-20 overflow-hidden">
      {/* Grid pattern decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />

      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
        <div className="text-center">
          {/* バッジ */}
          {badge && (
            <div className="inline-block mb-6">
              <span className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                {badge}
              </span>
            </div>
          )}

          {/* タイトル */}
          <h1 className="text-4xl font-bold text-white sm:text-5xl mb-6">{title}</h1>

          {/* サブタイトル */}
          {subtitle && (
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">{subtitle}</p>
          )}

          {/* 追加コンテンツ（CTAボタンなど） */}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}
