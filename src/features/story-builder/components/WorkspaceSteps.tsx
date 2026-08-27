import { cn } from '@/lib/utils';

type Step = 'input' | 'asis' | 'stories' | 'rfp';

const STEPS: { key: Step; n: string; label: string }[] = [
  { key: 'input', n: '01', label: '入力' },
  { key: 'asis', n: '02', label: '現状と目指す姿' },
  { key: 'stories', n: '03', label: 'ストーリーとGherkin' },
  { key: 'rfp', n: '04', label: 'RFP' },
];

export function WorkspaceSteps({
  step,
  hasSpec,
  onChange,
}: {
  step: Step;
  hasSpec: boolean;
  onChange: (step: Step) => void;
}) {
  return (
    <ol className="mb-6 grid grid-cols-2 border border-neutral-200 bg-white md:grid-cols-4">
      {STEPS.map((item, i) => {
        const enabled = item.key === 'input' || hasSpec;
        const active = step === item.key;
        return (
          <li
            key={item.key}
            className={cn(
              'border-neutral-200',
              i % 2 === 1 && 'border-l',
              i >= 2 && 'border-t md:border-t-0',
              i > 0 && 'md:border-l'
            )}
          >
            <button
              type="button"
              disabled={!enabled}
              onClick={() => onChange(item.key)}
              className={cn(
                'flex w-full min-h-[56px] flex-col items-start justify-center gap-0.5 border-l-4 px-4 py-3 text-left transition-colors',
                active && 'border-l-primary-500 bg-primary-50 text-accent-950',
                !active &&
                  enabled &&
                  'border-l-transparent bg-white text-accent-950 hover:bg-neutral-50',
                !enabled && 'cursor-not-allowed border-l-transparent bg-neutral-50 text-neutral-400'
              )}
            >
              <span
                className={cn(
                  'font-Poppins text-[11px] font-semibold tracking-[0.16em]',
                  active ? 'text-primary-500' : enabled ? 'text-neutral-500' : 'text-neutral-400'
                )}
              >
                {item.n}
              </span>
              <span className="truncate text-sm font-semibold">{item.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export type { Step };
