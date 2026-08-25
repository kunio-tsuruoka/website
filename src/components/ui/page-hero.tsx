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
    <section className="relative overflow-hidden border-b border-neutral-300 bg-neutral-100 py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-8 lg:px-12">
        <div className="max-w-4xl">
          {/* バッジ */}
          {badge && (
            <p className="border-l-8 border-primary-500 pl-5 text-sm font-bold text-primary-700">
              {badge}
            </p>
          )}

          {/* タイトル */}
          <h1 className="mt-6 text-4xl font-bold leading-tight text-accent-950 sm:text-5xl">
            {title}
          </h1>

          {/* サブタイトル */}
          {subtitle && (
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-neutral-700 md:text-xl">
              {subtitle}
            </p>
          )}

          {/* 追加コンテンツ（CTAボタンなど） */}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}
