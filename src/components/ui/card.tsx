import { cn } from '@/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

/**
 * Card コンポーネント
 */
const cardVariants = cva('relative overflow-hidden transition-all duration-300', {
  variants: {
    variant: {
      white: 'bg-white rounded-lg border border-neutral-200',

      light: 'bg-neutral-50 rounded-lg border border-neutral-200',

      lightPurple: 'bg-neutral-50 rounded-lg border border-neutral-200',

      lightCyan: 'bg-neutral-50 rounded-lg border border-neutral-200',

      primary: 'bg-primary-500 text-white rounded-lg border border-primary-500',

      navy: 'bg-accent-950 text-white rounded-lg border border-accent-950',

      cyan: 'bg-secondary-500 text-white rounded-lg border border-secondary-500',

      yellow: 'bg-highlight-500 text-accent-950 rounded-lg border border-highlight-500',

      gradientPurple: 'bg-primary-500 text-white rounded-lg border border-primary-500',

      gradientMix: 'bg-accent-950 text-white rounded-lg border border-accent-950',

      outlined: 'bg-white rounded-lg border border-neutral-200',

      outlinedPrimary: 'bg-white rounded-lg border border-primary-500',

      outlinedSecondary: 'bg-white rounded-lg border border-secondary-500',

      glass: 'bg-white border border-neutral-200 rounded-lg',

      glassDark: 'bg-white/10 border border-white/30 rounded-lg',

      legacy: 'rounded-lg border bg-card text-card-foreground',
    },

    padding: {
      none: '',
      sm: 'p-6',
      md: 'p-8',
      lg: 'p-10 md:p-12',
    },

    hover: {
      none: '',
      shadow: 'hover:border-primary-300',
      lift: 'hover:border-primary-300',
      scale: 'hover:border-primary-300',
      glow: 'hover:border-primary-300',
      border: 'hover:border-primary-500',
    },
  },
  defaultVariants: {
    variant: 'white',
    padding: 'md',
    hover: 'lift',
  },
});

// 旧装飾名は互換性のため残し、現行デザインでは描画しない。
const cardDecorations = {
  barPurple: null,
  barCyan: null,
  dots: null,
  dotsDark: null,
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
      variant === 'gradientMix' ||
      variant === 'glassDark';

    const content = (
      <>
        {decoration !== 'none' && cardDecorations[decoration] && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
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
          'w-14 h-14 rounded-lg flex items-center justify-center mb-6',
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
