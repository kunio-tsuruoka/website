import { cn } from '@/lib/utils';

export function Metric({
  label,
  asIs,
  toBe,
  delta,
  good,
}: {
  label: string;
  asIs: string;
  toBe: string;
  delta: string;
  good: boolean;
}) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-soft">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-xs text-gray-400">As-Is</span>
        <span className="text-sm font-semibold text-gray-700">{asIs}</span>
        <span className="text-xs text-gray-400 mx-1">→</span>
        <span className="text-xs text-gray-400">To-Be</span>
        <span className="text-base font-bold text-primary-600">{toBe}</span>
      </div>
      <p className={cn('mt-2 text-xs font-bold', good ? 'text-emerald-600' : 'text-gray-500')}>
        {good ? '↓改善' : ''} {delta}
      </p>
    </div>
  );
}
