import { cn } from '@/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

/**
 * Card コンポーネント
 *
 * Beekle Pop Style Design System
 * Primary: Beekle Purple (#3D4DB7)
 * Accent: Dark Navy (#001738)
 * Secondary: Cyan (#00c4cc)
 * Highlight: Yellow (#ffd600)
 */
const cardVariants = cva('relative overflow-hidden transition-all duration-300', {
  variants: {
    variant: {
      // 白背景（デフォルト）
      white: 'bg-white rounded-[32px] shadow-soft',

      // ライト背景
      light: 'bg-neutral-50 rounded-[32px]',

      // ライトパープル背景
      lightPurple: 'bg-gradient-to-br from-primary-50 via-white to-primary-50/30 rounded-[32px]',

      // ライトシアン背景
      lightCyan: 'bg-gradient-to-br from-secondary-50 via-white to-secondary-50/30 rounded-[32px]',

      // プライマリ背景: Beekle Purple
      primary: 'bg-primary-500 text-white rounded-[32px]',

      // ネイビー背景
      navy: 'bg-accent-950 text-white rounded-[32px]',

      // シアン背景
      cyan: 'bg-secondary-500 text-white rounded-[32px]',

      // イエロー背景
      yellow: 'bg-highlight-500 text-accent-950 rounded-[32px]',

      // グラデーション（パープル系）
      gradientPurple: 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-[32px]',

      // グラデーション（パープル → シアン）
      gradientMix:
        'bg-gradient-to-br from-primary-500 via-primary-400 to-secondary-500 text-white rounded-[32px]',

      // アウトライン
      outlined: 'bg-white rounded-[32px] border-2 border-neutral-200',

      // アウトライン（プライマリ）
      outlinedPrimary: 'bg-white rounded-[32px] border-2 border-primary-500',

      // アウトライン（セカンダリ）
      outlinedSecondary: 'bg-white rounded-[32px] border-2 border-secondary-500',

      // ガラス効果
      glass: 'bg-white/80 backdrop-blur-sm border border-white/20 rounded-[32px]',

      // 旧スタイル（後方互換）
      legacy: 'rounded-xl border bg-card text-card-foreground shadow',
    },

    padding: {
      none: '',
      sm: 'p-6',
      md: 'p-8',
      lg: 'p-10 md:p-12',
    },

    hover: {
      none: '',
      shadow: 'hover:shadow-medium',
      lift: 'hover:-translate-y-1 hover:shadow-medium',
      scale: 'hover:scale-[1.02]',
      glow: 'hover:shadow-[0_0_20px_rgba(61,77,183,0.3)]',
      border: 'hover:border-primary-500',
    },
  },
  defaultVariants: {
    variant: 'white',
    padding: 'md',
    hover: 'lift',
  },
});

// Pop装飾要素
const cardDecorations = {
  // 斜めバー（パープル）
  barPurple: (
    <div className="absolute -top-10 -right-10 w-24 h-48 bg-gradient-to-b from-primary-500/20 to-transparent rounded-full rotate-[25deg]" />
  ),
  // 斜めバー（シアン）
  barCyan: (
    <div className="absolute -top-10 -right-10 w-24 h-48 bg-gradient-to-b from-secondary-500/20 to-transparent rounded-full rotate-[25deg]" />
  ),
  // ドット群
  dots: (
    <>
      <div className="absolute top-4 right-4 w-3 h-3 bg-secondary-500 rounded-full opacity-50" />
      <div className="absolute top-8 right-10 w-2 h-2 bg-primary-500 rounded-full opacity-40" />
      <div className="absolute bottom-6 left-6 w-2 h-2 bg-highlight-500 rounded-full opacity-50" />
    </>
  ),
  // ダーク背景用ドット
  dotsDark: (
    <>
      <div className="absolute top-4 right-4 w-3 h-3 bg-secondary-400 rounded-full opacity-60" />
      <div className="absolute top-8 right-10 w-2 h-2 bg-white rounded-full opacity-30" />
      <div className="absolute bottom-6 left-6 w-2 h-2 bg-highlight-500 rounded-full opacity-50" />
    </>
  ),
  none: null,
};

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  as?: 'div' | 'a' | 'article';
  href?: string;
  decoration?: keyof typeof cardDecorations;
  number?: string;
  numberPosition?: 'topLeft' | 'topRight';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      padding,
      hover,
      as: Component = 'div',
      href,
      decoration = 'none',
      number,
      numberPosition = 'topLeft',
      children,
      ...props
    },
    ref
  ) => {
    const isDark =
      variant === 'navy' ||
      variant === 'primary' ||
      variant === 'cyan' ||
      variant === 'gradientPurple' ||
      variant === 'gradientMix';

    const content = (
      <>
        {/* Pop装飾要素 */}
        {decoration !== 'none' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[32px]">
            {cardDecorations[decoration]}
          </div>
        )}

        {/* ナンバーラベル */}
        {number && (
          <div
            className={cn(
              'absolute font-Poppins text-6xl font-bold',
              numberPosition === 'topLeft' ? 'top-4 left-6' : 'top-4 right-6',
              isDark ? 'text-white/20' : 'text-primary-500/20'
            )}
          >
            {number}
          </div>
        )}

        {/* コンテンツ */}
        <div className="relative">{children}</div>
      </>
    );

    if (Component === 'a' && href) {
      return (
        <a
          href={href}
          className={cn(cardVariants({ variant, padding, hover, className }), 'group block')}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, hover, className }))}
        {...props}
      >
        {content}
      </div>
    );
  }
);
Card.displayName = 'Card';

/**
 * CardHeader コンポーネント
 */
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  dark?: boolean;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, dark = false, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

/**
 * CardTitle コンポーネント
 */
interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  dark?: boolean;
}

const CardTitle = React.forwardRef<HTMLDivElement, CardTitleProps>(
  ({ className, dark = false, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-xl font-bold leading-tight',
        dark ? 'text-white' : 'text-accent-950',
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

/**
 * CardDescription コンポーネント
 */
interface CardDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {
  dark?: boolean;
}

const CardDescription = React.forwardRef<HTMLDivElement, CardDescriptionProps>(
  ({ className, dark = false, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('leading-relaxed', dark ? 'text-white/90' : 'text-neutral-600', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

/**
 * CardContent コンポーネント
 */
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  dark?: boolean;
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, dark = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(dark ? 'text-white/90' : 'text-neutral-700', className)}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

/**
 * CardFooter コンポーネント
 */
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center mt-6 pt-4', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

/**
 * CardIcon コンポーネント
 *
 * カード内のアイコンコンテナ
 */
interface CardIconProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'purple' | 'cyan' | 'navy' | 'yellow' | 'white';
}

const CardIcon = React.forwardRef<HTMLDivElement, CardIconProps>(
  ({ className, variant = 'purple', children, ...props }, ref) => {
    const styles = {
      purple: 'bg-primary-100 text-primary-500',
      cyan: 'bg-secondary-100 text-secondary-600',
      navy: 'bg-accent-100 text-accent-950',
      yellow: 'bg-highlight-100 text-accent-950',
      white: 'bg-white/20 text-white',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center mb-6',
          styles[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardIcon.displayName = 'CardIcon';

/**
 * CardLink コンポーネント
 *
 * カード内の「続きを読む」リンク
 */
interface CardLinkProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}

const CardLink: React.FC<CardLinkProps> = ({ children, className, dark = false }) => (
  <span
    className={cn(
      'inline-flex items-center font-semibold transition-colors',
      dark ? 'text-white hover:text-secondary-400' : 'text-primary-500 hover:text-primary-600',
      className
    )}
  >
    {children}
    <svg
      className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  </span>
);

/**
 * FeatureCard コンポーネント（便利なプリセット）
 *
 * 特徴やサービス紹介用のカード
 */
interface FeatureCardProps {
  number?: string;
  icon?: React.ReactNode;
  title: string;
  description: string;
  variant?: 'white' | 'primary' | 'navy' | 'cyan';
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  number,
  icon,
  title,
  description,
  variant = 'white',
  className,
}) => {
  const isDark = variant === 'primary' || variant === 'navy' || variant === 'cyan';

  return (
    <Card
      variant={variant}
      number={number}
      decoration={isDark ? 'dotsDark' : 'dots'}
      className={className}
    >
      {icon && <CardIcon variant={isDark ? 'white' : 'purple'}>{icon}</CardIcon>}
      <CardTitle dark={isDark} className="text-2xl mb-4">
        {title}
      </CardTitle>
      <CardDescription dark={isDark}>{description}</CardDescription>
    </Card>
  );
};

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardIcon,
  CardLink,
  FeatureCard,
  cardVariants,
};
