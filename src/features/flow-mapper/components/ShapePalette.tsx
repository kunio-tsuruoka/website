import { cn } from '@/lib/utils';
import { STEP_TYPE_LABEL } from '../constants';
import type { StepType } from '../types';
import { StepIcon } from './StepIcon';

// Questetra ライクの形状パレット。クリックで該当 type のステップを追加。
export function ShapePalette({ onAdd }: { onAdd: (type: StepType) => void }) {
  const order: StepType[] = ['start', 'task', 'decision', 'system', 'wait', 'end'];
  return (
    <div
      className="inline-flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-soft"
      role="toolbar"
      aria-label="図形パレット"
    >
      {order.map((t, i) => (
        <button
          key={t}
          type="button"
          onClick={() => onAdd(t)}
          title={`${STEP_TYPE_LABEL[t]}を追加`}
          aria-label={`${STEP_TYPE_LABEL[t]}を追加`}
          className={cn(
            'flex flex-col items-center justify-center px-2.5 py-1.5 hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-700',
            i > 0 && 'border-l border-gray-200'
          )}
        >
          <StepIcon type={t} className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 font-medium">{STEP_TYPE_LABEL[t]}</span>
        </button>
      ))}
    </div>
  );
}
