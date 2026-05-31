import { useEffect, useState } from 'react';
import { useFlowInterviewStore } from '../store';
import { DiagramPreview } from './DiagramPreview';
import { RfpPanel } from './RfpPanel';
import { SuggestionsPanel } from './SuggestionsPanel';

type Phase = 'flow' | 'suggest' | 'rfp';

type Props = {
  onEdit: () => void;
  onSuggest: () => void;
  onGenerateRfp: () => void;
};

export function WorkspacePanel({ onEdit, onSuggest, onGenerateRfp }: Props) {
  const stepCount = useFlowInterviewStore((s) => s.diagram.steps.length);
  const suggestions = useFlowInterviewStore((s) => s.suggestions);
  const rfpMarkdown = useFlowInterviewStore((s) => s.rfpMarkdown);
  const [phase, setPhase] = useState<Phase>('flow');

  const hasFlow = stepCount > 0;
  const done: Record<Phase, boolean> = {
    flow: hasFlow,
    suggest: !!suggestions,
    rfp: !!rfpMarkdown,
  };

  const steps: { key: Phase; n: number; label: string; enabled: boolean }[] = [
    { key: 'flow', n: 1, label: '現状フロー', enabled: true },
    { key: 'suggest', n: 2, label: '改善案', enabled: hasFlow },
    { key: 'rfp', n: 3, label: 'RFP', enabled: hasFlow },
  ];

  // フローができたら最初の1回だけ「改善案」フェーズへ自動で誘導しすぎないよう、
  // ユーザーが flow タブにいる時のみ stepCount 0→正 でとどめる（自動遷移はしない）。
  // 生成完了時にそのフェーズへ寄せる（改善案/ RFP を押した結果が見える位置に）。
  useEffect(() => {
    if (suggestions) setPhase('suggest');
  }, [suggestions]);
  useEffect(() => {
    if (rfpMarkdown) setPhase('rfp');
  }, [rfpMarkdown]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-4 sm:p-5">
      {/* フェーズ・ステッパー */}
      <ol className="flex items-center gap-1 mb-4">
        {steps.map((st, i) => {
          const active = phase === st.key;
          return (
            <li key={st.key} className="flex items-center flex-1">
              <button
                type="button"
                disabled={!st.enabled}
                onClick={() => setPhase(st.key)}
                className={`flex items-center gap-1.5 w-full rounded-full px-2.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-primary-500 text-white'
                    : st.enabled
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                }`}
              >
                <span
                  className={`shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] ${
                    done[st.key]
                      ? 'bg-emerald-500 text-white'
                      : active
                        ? 'bg-white text-primary-600'
                        : 'bg-gray-300 text-white'
                  }`}
                >
                  {done[st.key] ? '✓' : st.n}
                </span>
                <span className="truncate">{st.label}</span>
              </button>
              {i < steps.length - 1 && <span className="shrink-0 w-2 h-px bg-gray-200" />}
            </li>
          );
        })}
      </ol>

      {/* フェーズ本体 */}
      {phase === 'flow' && <DiagramPreview onEdit={onEdit} />}
      {phase === 'suggest' && (
        <div>
          <SuggestionsPanel onSuggest={onSuggest} />
          {suggestions && (
            <button
              type="button"
              onClick={() => setPhase('rfp')}
              className="mt-4 w-full sm:w-auto px-5 py-2.5 rounded-full border border-primary-300 text-primary-700 text-sm font-medium hover:bg-primary-50 transition"
            >
              次へ: RFPを作る →
            </button>
          )}
        </div>
      )}
      {phase === 'rfp' && <RfpPanel onGenerate={onGenerateRfp} />}
    </div>
  );
}
