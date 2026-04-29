import { cn } from '@/lib/utils';
import type { StepType } from '../types';

export function StepIcon({ type, className }: { type: StepType; className?: string }) {
  const cls = cn('inline-block flex-shrink-0', className);
  switch (type) {
    case 'start':
      return (
        <svg viewBox="0 0 16 16" className={cls} aria-hidden>
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'end':
      return (
        <svg viewBox="0 0 16 16" className={cls} aria-hidden>
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="3" />
        </svg>
      );
    case 'decision':
      return (
        <svg viewBox="0 0 16 16" className={cls} aria-hidden>
          <polygon points="8,2 14,8 8,14 2,8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case 'system':
      return (
        <svg viewBox="0 0 16 16" className={cls} aria-hidden>
          <rect
            x="2"
            y="3"
            width="12"
            height="10"
            rx="1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <line x1="5" y1="6.5" x2="11" y2="6.5" stroke="currentColor" strokeWidth="1.4" />
          <line x1="5" y1="9.5" x2="11" y2="9.5" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    case 'wait':
      return (
        <svg viewBox="0 0 16 16" className={cls} aria-hidden>
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <line x1="8" y1="8" x2="8" y2="4.5" stroke="currentColor" strokeWidth="1.6" />
          <line x1="8" y1="8" x2="11" y2="9" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 16 16" className={cls} aria-hidden>
          <rect
            x="2"
            y="4"
            width="12"
            height="8"
            rx="1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      );
  }
}
