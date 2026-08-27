type Step = 'input' | 'asis' | 'stories' | 'rfp';

const STEPS: { key: Step; n: number; label: string }[] = [
  { key: 'input', n: 1, label: '入力' },
  { key: 'asis', n: 2, label: '現状と目指す姿' },
  { key: 'stories', n: 3, label: 'ストーリーとGherkin' },
  { key: 'rfp', n: 4, label: 'RFP' },
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
    <ol className="flex flex-col sm:flex-row gap-2 mb-6">
      {STEPS.map((item, i) => {
        const enabled = item.key === 'input' || hasSpec;
        const active = step === item.key;
        return (
          <li key={item.key} className="flex items-center flex-1 gap-2">
            <button
              type="button"
              disabled={!enabled}
              onClick={() => onChange(item.key)}
              className={`flex items-center gap-2 w-full min-h-[44px] rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-primary-500 text-white'
                  : enabled
                    ? 'bg-white border border-neutral-200 text-gray-700 hover:border-primary-300'
                    : 'bg-neutral-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                  active ? 'bg-white text-primary-600' : 'bg-primary-100 text-primary-700'
                }`}
              >
                {item.n}
              </span>
              <span className="truncate">{item.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <span className="hidden sm:block w-4 h-px bg-neutral-300 flex-shrink-0" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export type { Step };
