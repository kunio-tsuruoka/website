import { cn } from '@/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

/**
 * Button コンポーネント
 *
 * Beekle Pop Style Design System
 * Primary: Beekle Purple (#3D4DB7)
 * Accent: Dark Navy (#001738)
 * Secondary: Cyan (#00c4cc)
 * Highlight: Yellow (#ffd600)
 *
 * バリアント: primary, accent, secondary, white, outline系, ghost, link
 * サイズ: sm, md, lg, xl
 */
const buttonVariants = cva(
  // ベーススタイル（ブランドガイドライン準拠：rounded-full）
  'inline-flex items-center justify-center font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        // プライマリ: Beekle Purple（メインカラー）
        primary:
          'bg-primary-500 text-white shadow-soft hover:shadow-medium hover:bg-primary-600 focus:ring-primary-500',

        // アクセント: Dark Navy
        accent:
          'bg-accent-950 text-white shadow-soft hover:shadow-medium hover:bg-accent-900 focus:ring-accent-950',

        // セカンダリ: Cyan
        secondary:
          'bg-secondary-500 text-white shadow-soft hover:shadow-medium hover:bg-secondary-600 focus:ring-secondary-500',

        // ハイライト: Yellow
        highlight:
          'bg-highlight-500 text-accent-950 shadow-soft hover:shadow-medium hover:bg-highlight-400 focus:ring-highlight-500',

        // ホワイト: 白背景（ダーク背景用）
        white:
          'bg-white text-primary-500 shadow-soft hover:shadow-medium hover:bg-gray-50 focus:ring-primary-500',

        // アウトライン: 透明背景、白ボーダー（ダーク背景用）
        outline:
          'bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-500 focus:ring-white',

        // アウトライン（プライマリ）: 透明背景、パープルボーダー
        outlinePrimary:
          'bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white focus:ring-primary-500',

        // アウトライン（ネイビー）: 透明背景、ネイビーボーダー
        outlineNavy:
          'bg-transparent border-2 border-accent-950 text-accent-950 hover:bg-accent-950 hover:text-white focus:ring-accent-950',

        // ゴースト: 透明、ホバー時に背景
        ghost: 'text-primary-500 hover:bg-primary-50 focus:ring-primary-500',

        // リンク: テキストのみ
        link: 'text-primary-500 hover:text-primary-600 underline-offset-4 hover:underline focus:ring-primary-500',

        // デストラクティブ
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive',

        // ミュート
        muted: 'bg-muted text-muted-foreground cursor-not-allowed',
      },
      size: {
        sm: 'px-4 py-2 text-sm rounded-full',
        md: 'px-6 py-3 text-base rounded-full',
        lg: 'px-8 py-4 text-lg rounded-full',
        xl: 'px-10 py-5 text-xl font-semibold rounded-full',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      icon,
      iconPosition = 'right',
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </button>
    );
  }
);
Button.displayName = 'Button';

/**
 * ButtonLink コンポーネント
 *
 * aタグとしてレンダリングされるボタン
 */
export interface ButtonLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (
    { className, variant, size, fullWidth, icon, iconPosition = 'right', children, ...props },
    ref
  ) => {
    return (
      <a
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      >
        {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </a>
    );
  }
);
ButtonLink.displayName = 'ButtonLink';

export { Button, ButtonLink, buttonVariants };
