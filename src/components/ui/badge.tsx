import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Badge コンポーネント
 *
 * タグ、ラベル、ステップ番号などに使用
 */
const badgeVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all',
  {
    variants: {
      variant: {
        // プライマリ: パープル背景（ブランドガイドライン準拠）
        primary: 'bg-accent-600 text-white',

        // プライマリライト: ライトパープル背景
        primaryLight: 'bg-accent-50 text-accent-700',

        // セカンダリ: シアン背景
        secondary: 'bg-secondary-500 text-white',

        // セカンダリライト: ライトシアン背景
        secondaryLight: 'bg-secondary-50 text-secondary-600',

        // アクセント: ネイビー背景
        accent: 'bg-navy-950 text-white',

        // アウトライン: パープルボーダー
        outline: 'border border-accent-600 text-accent-600 bg-transparent',

        // ミュート
        muted: 'bg-neutral-100 text-neutral-600',

        // サクセス
        success: 'bg-green-50 text-green-700',

        // 警告
        warning: 'bg-highlight-100 text-highlight-600',

        // エラー
        error: 'bg-red-50 text-red-700',

        // ステップ番号用: パープル
        step: 'bg-accent-600 text-white font-bold',
      },

      size: {
        xs: 'px-2 py-0.5 text-xs rounded-md',
        sm: 'px-3 py-1 text-xs rounded-full',
        md: 'px-4 py-1.5 text-sm rounded-full',
        lg: 'px-5 py-2 text-base rounded-full',
        // 円形（ステップ番号用）
        circle: 'w-8 h-8 rounded-full text-sm',
        circleLg: 'w-12 h-12 rounded-full text-lg',
      },

      hover: {
        none: '',
        scale: 'hover:scale-105',
        opacity: 'hover:opacity-80',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'sm',
      hover: 'none',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  as?: 'span' | 'div';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, hover, as: Component = 'span', ...props }, ref) => {
    return (
      <Component
        ref={ref as React.Ref<HTMLSpanElement>}
        className={cn(badgeVariants({ variant, size, hover, className }))}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

/**
 * StepBadge コンポーネント
 *
 * プロセスステップ用の番号バッジ
 */
interface StepBadgeProps {
  step: number | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StepBadge: React.FC<StepBadgeProps> = ({ step, size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-bold text-white bg-accent-600',
        sizeClasses[size],
        className
      )}
    >
      {step}
    </div>
  );
};

/**
 * CategoryBadge コンポーネント
 *
 * カテゴリ表示用バッジ
 */
interface CategoryBadgeProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  children,
  active = false,
  onClick,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-full text-sm font-medium transition-all',
        active
          ? 'bg-accent-600 text-white shadow-soft'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
        className
      )}
    >
      {children}
    </button>
  );
};

export { Badge, StepBadge, CategoryBadge, badgeVariants };
