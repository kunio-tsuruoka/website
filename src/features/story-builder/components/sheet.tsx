import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Sheet({
  children,
  className,
  accent = 'neutral',
}: {
  children: ReactNode;
  className?: string;
  accent?: 'neutral' | 'primary';
}) {
  return (
    <section
      className={cn(
        'rounded-lg border border-neutral-200 bg-white',
        accent === 'primary' && 'border-l-4 border-l-primary-500',
        accent === 'neutral' && 'border-l-4 border-l-neutral-300',
        className
      )}
    >
      {children}
    </section>
  );
}

export function SheetBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-5 md:p-7', className)}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 font-Poppins text-xs font-semibold tracking-[0.18em] text-primary-500">
      {children}
    </p>
  );
}

export function ToolButton({
  children,
  variant = 'outlinePrimary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outlinePrimary' | 'ghost';
}) {
  return (
    <Button size="sm" variant={variant} className="min-h-[44px]" {...props}>
      {children}
    </Button>
  );
}

export const fieldClass =
  'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm leading-relaxed text-accent-950 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300';

export function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="mb-1.5 text-xs font-semibold tracking-wide text-neutral-500">{children}</p>;
}
