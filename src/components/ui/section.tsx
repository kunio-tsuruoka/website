import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Section コンポーネント
 *
 * Beekle Pop Style Design System
 * Primary: Beekle Purple (#3D4DB7)
 * Accent: Dark Navy (#001738)
 * Secondary: Cyan (#00c4cc)
 * Highlight: Yellow (#ffd600)
 */
const sectionVariants = cva('relative overflow-hidden', {
  variants: {
    // 背景バリアント（ブランドガイドライン準拠）
    variant: {
      // 白背景
      white: 'bg-white',

      // ライトグレー
      light: 'bg-neutral-50',

      // ライトパープル（Primary薄め）
      lightPurple: 'bg-gradient-to-br from-primary-50 via-white to-primary-50/30',

      // ライトシアン
      lightCyan: 'bg-gradient-to-br from-secondary-50 via-white to-secondary-50/30',

      // Primary背景: Beekle Purple
      primary: 'bg-primary-500',

      // ネイビー背景: Dark Navy (Accent)
      navy: 'bg-accent-950',

      // シアン背景
      cyan: 'bg-secondary-500',

      // ミュート背景
      muted: 'bg-neutral-100',
    },

    // パディングバリアント
    padding: {
      none: '',
      sm: 'py-16 md:py-20',
      md: 'py-20 md:py-24',
      lg: 'py-24 md:py-32',
    },

    // グリッドパターンオーバーレイ
    grid: {
      none: '',
      light: '[&>.grid-pattern]:opacity-5',
      medium: '[&>.grid-pattern]:opacity-10',
      dark: '[&>.grid-pattern]:opacity-20',
    },
  },
  defaultVariants: {
    variant: 'white',
    padding: 'lg',
    grid: 'none',
  },
});

// Pop装飾要素バリアント（ブランドガイドライン Pop Decorations）
const decorationVariants = {
  // パープルぼかし
  blursPurple: (
    <>
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl" />
    </>
  ),
  // シアンぼかし
  blursCyan: (
    <>
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-50/50 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-50/50 rounded-full blur-3xl" />
    </>
  ),
  // ミックス（パープル＋シアン）
  blursMix: (
    <>
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-50/40 rounded-full blur-3xl" />
    </>
  ),
  // 斜めバー（Pop Style - Beekle Purple系）
  bars: (
    <>
      <div className="absolute -top-10 right-10 w-32 h-96 decoration-bar-purple opacity-20" />
      <div className="absolute top-20 right-32 w-20 h-64 decoration-bar-cyan opacity-20" />
      <div className="absolute -top-5 right-64 w-16 h-48 decoration-bar-yellow opacity-15" />
    </>
  ),
  // ダーク背景用バー
  barsDark: (
    <>
      <div className="absolute -top-20 -right-10 w-40 h-80 decoration-bar-purple opacity-30" />
      <div className="absolute top-40 right-32 w-24 h-64 decoration-bar-cyan opacity-25" />
      <div className="absolute bottom-20 left-10 w-32 h-72 decoration-bar-yellow opacity-20" />
    </>
  ),
  // ドット（Pop Style）
  dots: (
    <>
      <div className="absolute top-20 left-10 w-4 h-4 bg-primary-500 rounded-full opacity-60" />
      <div className="absolute top-32 left-24 w-6 h-6 bg-secondary-500 rounded-full opacity-50" />
      <div className="absolute bottom-20 right-16 w-5 h-5 bg-highlight-500 rounded-full opacity-70" />
      <div className="absolute bottom-40 right-32 w-3 h-3 bg-primary-300 rounded-full opacity-40" />
    </>
  ),
  // ダーク背景用ドット
  dotsDark: (
    <>
      <div className="absolute top-32 left-20 w-4 h-4 bg-secondary-500 rounded-full opacity-60" />
      <div className="absolute top-48 left-32 w-6 h-6 bg-highlight-500 rounded-full opacity-50" />
      <div className="absolute bottom-40 right-40 w-5 h-5 bg-primary-300 rounded-full opacity-50" />
    </>
  ),
  // フル装飾（バー＋ドット）
  full: (
    <>
      <div className="absolute -top-10 right-10 w-32 h-96 decoration-bar-purple opacity-15" />
      <div className="absolute top-20 right-32 w-20 h-64 decoration-bar-cyan opacity-15" />
      <div className="absolute bottom-10 left-20 w-24 h-48 decoration-bar-yellow opacity-10" />
      <div className="absolute top-40 left-16 w-4 h-4 bg-secondary-500 rounded-full opacity-40" />
      <div className="absolute bottom-32 right-24 w-5 h-5 bg-highlight-500 rounded-full opacity-50" />
      <div className="absolute top-60 right-48 w-3 h-3 bg-primary-500 rounded-full opacity-30" />
    </>
  ),
  // ダーク背景用フル装飾
  fullDark: (
    <>
      <div className="absolute -top-20 -left-10 w-48 h-96 decoration-bar-purple opacity-25" />
      <div className="absolute top-20 right-10 w-40 h-80 decoration-bar-cyan opacity-25" />
      <div className="absolute bottom-10 left-1/3 w-32 h-64 decoration-bar-yellow opacity-20" />
      <div className="absolute top-32 right-32 w-6 h-6 bg-secondary-500 rounded-full opacity-50" />
      <div className="absolute bottom-40 left-40 w-5 h-5 bg-highlight-500 rounded-full opacity-40" />
      <div className="absolute top-48 left-24 w-4 h-4 bg-white rounded-full opacity-30" />
    </>
  ),
  none: null,
};

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  as?: 'section' | 'div' | 'article';
  container?: boolean;
  containerClass?: string;
  decoration?: keyof typeof decorationVariants;
  showGrid?: boolean;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      className,
      variant,
      padding,
      grid,
      as: Component = 'section',
      container = true,
      containerClass,
      decoration = 'none',
      showGrid = false,
      children,
      ...props
    },
    ref
  ) => {
    // ダーク背景かどうか
    const isDark = variant === 'navy' || variant === 'primary' || variant === 'cyan';

    return (
      <Component
        className={cn(sectionVariants({ variant, padding, grid, className }))}
        ref={ref as React.Ref<HTMLElement>}
        {...props}
      >
        {/* グリッドパターン */}
        {showGrid && (
          <div
            className={cn(
              'absolute inset-0 grid-pattern',
              isDark ? 'opacity-10' : 'opacity-5'
            )}
            style={{
              backgroundImage: `linear-gradient(rgba(${isDark ? '255, 255, 255' : '0, 0, 0'}, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(${isDark ? '255, 255, 255' : '0, 0, 0'}, 0.1) 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
            }}
          />
        )}

        {/* 装飾要素 */}
        {decoration !== 'none' && (
          <div className="absolute inset-0 pointer-events-none">
            {decorationVariants[decoration]}
          </div>
        )}

        {/* コンテンツ */}
        {container ? (
          <div className={cn('container mx-auto px-8 lg:px-12 relative', containerClass)}>
            {children}
          </div>
        ) : (
          <div className="relative">{children}</div>
        )}
      </Component>
    );
  }
);
Section.displayName = 'Section';

/**
 * SectionHeader コンポーネント
 *
 * セクションの見出し + サブテキスト + 番号ラベル（Pop Style）
 */
interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  highlight?: string;
  centered?: boolean;
  dark?: boolean;
  className?: string;
  // Pop Style: 番号ラベル
  number?: string;
  label?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  highlight,
  centered = true,
  dark = false,
  className,
  number,
  label,
}) => {
  return (
    <div className={cn(centered && 'text-center', 'mb-16', className)}>
      {/* Pop Style: 番号ラベル */}
      {(number || label) && (
        <div className="mb-4">
          {number && (
            <span className={cn(
              'font-Poppins text-5xl font-bold',
              dark ? 'text-white/80' : 'text-primary-500'
            )}>
              {number}
            </span>
          )}
          {label && (
            <span className={cn(
              'ml-4 text-sm font-semibold tracking-wide uppercase',
              dark ? 'text-white/70' : 'text-primary-500'
            )}>
              {label}
            </span>
          )}
        </div>
      )}
      <h2
        className={cn(
          'text-4xl lg:text-5xl font-bold mb-6',
          dark ? 'text-white' : 'text-navy-950'
        )}
      >
        {typeof title === 'string' && highlight ? (
          <>
            {title.split(highlight)[0]}
            <span className={dark ? 'text-secondary-400' : 'text-primary-500'}>
              {highlight}
            </span>
            {title.split(highlight)[1]}
          </>
        ) : (
          title
        )}
      </h2>
      {subtitle && (
        <p className={cn('text-xl', dark ? 'text-white/90' : 'text-neutral-600')}>{subtitle}</p>
      )}
    </div>
  );
};

export { Section, SectionHeader, sectionVariants };
