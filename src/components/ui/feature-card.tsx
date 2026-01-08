import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardIcon, CardLink } from './card';

/**
 * FeatureCard コンポーネント
 *
 * 特徴・不安カード（index.astroの「こんな不安、ありませんか？」セクション用）
 */
interface FeatureCardProps {
  href: string;
  icon: React.ReactNode;
  title: React.ReactNode;
  description: string;
  linkText?: string;
  iconVariant?: 'purple' | 'cyan' | 'navy' | 'yellow' | 'gradient';
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  href,
  icon,
  title,
  description,
  linkText = 'ゼロスタートで解決',
  iconVariant = 'purple',
  className,
}) => {
  return (
    <a href={href} className={cn('group relative block', className)}>
      {/* グラデーションオーバーレイ（ブランドカラー：パープル） */}
      <div className="absolute inset-0 bg-accent-600 rounded-[32px] blur opacity-20 group-hover:opacity-30 transition-opacity" />

      <Card variant="default" padding="md" hover="shadow" className="relative h-full flex flex-col">
        <CardIcon variant={iconVariant} className="mx-auto">
          {icon}
        </CardIcon>

        <h3 className="text-xl font-bold text-neutral-900 mb-4 text-center">{title}</h3>

        <p className="text-neutral-600 leading-relaxed text-center flex-grow">{description}</p>

        <div className="mt-6 text-center">
          <CardLink>{linkText}</CardLink>
        </div>
      </Card>
    </a>
  );
};

/**
 * FAQCard コンポーネント
 *
 * よくあるお悩みカード
 */
interface FAQCardProps {
  question: string;
  answer: string;
  accentColor?: 'purple' | 'cyan' | 'navy' | 'yellow';
  className?: string;
}

export const FAQCard: React.FC<FAQCardProps> = ({
  question,
  answer,
  accentColor = 'purple',
  className,
}) => {
  const colorClasses = {
    purple: 'text-accent-600',
    cyan: 'text-secondary-500',
    navy: 'text-navy-950',
    yellow: 'text-highlight-500',
  };

  return (
    <div className={cn('group relative', className)}>
      {/* グラデーションオーバーレイ（パープル） */}
      <div className="absolute inset-0 rounded-[32px] bg-accent-600 blur opacity-20 group-hover:opacity-30 transition-opacity" />

      <Card variant="default" padding="md" hover="shadow" className="relative">
        <div className="flex items-start">
          <span className={cn('text-4xl mr-4 font-bold', colorClasses[accentColor])}>Q</span>
          <div>
            <h4 className="text-xl font-bold text-neutral-900 mb-3">{question}</h4>
            <p className="text-neutral-600 leading-relaxed">{answer}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

/**
 * CTABox コンポーネント
 *
 * グラデーション背景のCTAボックス
 */
interface CTABoxProps {
  title: string;
  description: React.ReactNode;
  primaryButton: {
    href: string;
    text: string;
  };
  secondaryButton?: {
    href: string;
    text: string;
  };
  className?: string;
}

export const CTABox: React.FC<CTABoxProps> = ({
  title,
  description,
  primaryButton,
  secondaryButton,
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-navy-950 rounded-[40px] p-10 shadow-strong text-center',
        className
      )}
    >
      <h3 className="text-3xl font-bold text-white mb-4">{title}</h3>
      <p className="text-lg text-white/90 mb-8 leading-relaxed">{description}</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href={primaryButton.href}
          className="inline-flex items-center justify-center px-10 py-5 text-xl font-semibold text-navy-950 bg-white rounded-full hover:bg-gray-50 transition-all shadow-medium hover:shadow-strong hover:scale-105 transform"
        >
          {primaryButton.text}
          <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </a>
        {secondaryButton && (
          <a
            href={secondaryButton.href}
            className="inline-flex items-center justify-center px-10 py-5 text-xl font-semibold text-white bg-transparent border-2 border-white rounded-full hover:bg-white hover:text-navy-950 transition-all"
          >
            {secondaryButton.text}
          </a>
        )}
      </div>
    </div>
  );
};

export default FeatureCard;
