import { trackCtaClick } from '@/lib/analytics';
import type { FlowSuggestion } from '@/lib/flow-interview/suggest';
import { useFlowInterviewStore } from '../store';

const KIND_LABEL: Record<FlowSuggestion['kind'], { label: string; cls: string }> = {
  automation: { label: '自動化', cls: 'bg-primary-50 text-primary-700 border-primary-200' },
  ai: { label: 'AI活用', cls: 'bg-secondary-50 text-secondary-700 border-secondary-200' },
  integration: { label: 'システム連携', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  eliminate: { label: '作業廃止', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  tool: { label: 'ツール導入', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  standardize: { label: '標準化', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
};

export function SuggestionsPanel({ onSuggest }: { onSuggest: () => void }) {
  const suggesting = useFlowInterviewStore((s) => s.suggesting);
  const summary = useFlowInterviewStore((s) => s.suggestSummary);
  const suggestions = useFlowInterviewStore((s) => s.suggestions);
  const hasSteps = useFlowInterviewStore((s) => s.diagram.steps.length > 0);
  const openContact = useFlowInterviewStore((s) => s.openContact);

  if (!hasSteps) return null;

  // 未生成: 改善提案を出すボタン
  if (!suggestions) {
    return (
      <div className="mt-4 rounded-2xl border border-primary-100 bg-primary-50/60 p-5">
        <h3 className="text-sm font-bold text-navy-950 mb-1">この業務、もっと良くできるかも</h3>
        <p className="text-xs text-gray-600 leading-relaxed mb-4">
          いまの流れをもとに、自動化・AI活用・システム連携でどう改善できるかをAIが提案します。
        </p>
        <button
          type="button"
          onClick={onSuggest}
          disabled={suggesting}
          className="w-full sm:w-auto px-6 py-3 min-h-[48px] rounded-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white text-sm font-semibold transition"
        >
          {suggesting ? 'AIが改善案を考えています…' : 'AIに改善案を出してもらう'}
        </button>
      </div>
    );
  }

  // 生成済み: サマリ + カード + 問い合わせCTA
  return (
    <div className="mt-4">
      <h3 className="text-sm font-bold text-navy-950 mb-2">AIによる改善案（To-Be の方向性）</h3>
      {summary && (
        <p className="text-sm text-gray-700 leading-relaxed mb-4 rounded-xl bg-gray-50 border border-gray-200 p-3">
          {summary}
        </p>
      )}

      <ul className="space-y-3">
        {suggestions.map((s, i) => {
          const kind = KIND_LABEL[s.kind];
          return (
            <li
              key={`${s.kind}-${i}-${s.title.slice(0, 8)}`}
              className="rounded-2xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${kind.cls}`}
                >
                  {kind.label}
                </span>
                <span className="text-xs text-gray-500 truncate">{s.target}</span>
              </div>
              <p className="text-sm font-bold text-navy-950 mb-1">{s.title}</p>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">{s.detail}</p>
              <p className="text-xs text-primary-700 bg-primary-50 rounded-lg px-2.5 py-1.5 inline-block">
                期待効果: {s.effect}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 rounded-2xl bg-navy-950 text-white p-5 sm:p-6">
        <p className="font-bold text-base mb-1">この改善、Beekleで実現できます</p>
        <p className="text-sm text-white/80 leading-relaxed mb-4">
          上の改善案は、Beekleの生成AI開発で形にできます。現状フローはもう整理済みなので、最初の打ち合わせから具体的な進め方の相談に入れます。
        </p>
        <button
          type="button"
          onClick={() => {
            trackCtaClick({ source: 'flow-interview', cta: 'contact-from-suggestions' });
            openContact('to-be');
          }}
          className="inline-flex justify-center items-center px-6 py-3 min-h-[48px] rounded-full bg-white text-navy-950 text-sm font-bold hover:bg-gray-100 transition"
        >
          この内容でBeekleに相談する
        </button>
      </div>
    </div>
  );
}
