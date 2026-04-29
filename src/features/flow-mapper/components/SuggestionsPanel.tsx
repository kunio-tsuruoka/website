import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { SUGGESTION_BADGE } from '../constants';
import type { FlowDiagram, SolutionTemplate, Suggestion } from '../types';
import { fmtMin, fmtYen } from '../utils/format';
import { SOLUTIONS, suggestImprovements } from '../utils/suggestions';

export function SuggestionsPanel({
  asIs,
  label,
  onApply,
}: {
  asIs: FlowDiagram;
  label?: string;
  onApply?: (asIsStepId: string, sol: SolutionTemplate) => void;
}) {
  const [open, setOpen] = useState(true);
  const suggestions = useMemo(() => suggestImprovements(asIs), [asIs]);

  const grouped = useMemo(() => {
    const m = new Map<string, Suggestion[]>();
    for (const s of suggestions) {
      const arr = m.get(s.stepId) ?? [];
      arr.push(s);
      m.set(s.stepId, arr);
    }
    return m;
  }, [suggestions]);

  return (
    <section className="mt-4 border border-primary-200 rounded-xl bg-primary-50/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-primary-100/60 hover:bg-primary-100 border-b border-primary-200"
      >
        <span className="text-sm font-bold text-primary-900 flex items-center gap-2">
          To-Be 改善のヒント
          {label ? <span className="text-xs font-normal text-primary-700">（{label}）</span> : null}
          <span className="text-xs font-normal text-primary-700">
            {suggestions.length === 0
              ? '対象なし'
              : `${grouped.size}ステップ・${suggestions.length}件の候補`}
          </span>
        </span>
        <span className="text-xs text-primary-700">{open ? '▼' : '▶'}</span>
      </button>
      {open ? (
        <div className="p-4">
          <p className="text-[11px] text-primary-900/80 leading-relaxed mb-3">
            <strong>このツールのコンセプト:</strong> AI／DX を導入する前に、まず
            As-Is（現状）で業務を見える化します。 その上で「どこを DX
            すべきか」を判断し、To-Be（改善後）を描きましょう。 以下は As-Is
            を自動分析した改善候補です。<strong>To-Be 設計の議論の起点</strong>
            として活用してください。
          </p>
          {suggestions.length === 0 ? (
            <p className="text-xs text-gray-600">
              改善候補なし。As-Is にステップ・所要時間・使用ツール・課題を記入すると候補が出ます。
            </p>
          ) : (
            <ul className="space-y-2">
              {[...grouped.entries()].map(([stepId, items]) => {
                const kindsWithSol = items
                  .map((it) => it.kind)
                  .filter((k) => SOLUTIONS[k] && SOLUTIONS[k].length > 0);
                const asIsStep = asIs.steps.find((s) => s.id === stepId);
                const lane = asIs.lanes.find((l) => l.id === asIsStep?.laneId);
                const rate = lane?.rateYenPerHour ?? 0;
                const beforeYen = asIsStep ? (asIsStep.durationMin / 60) * rate : 0;
                return (
                  <li
                    key={stepId}
                    className="bg-white border border-primary-100 rounded-lg p-3 space-y-1"
                  >
                    <p className="text-xs font-bold text-gray-900">{items[0].title}</p>
                    <div className="flex flex-wrap gap-1">
                      {items.map((it) => (
                        <span
                          key={it.kind}
                          className={cn(
                            'inline-block text-[10px] font-bold px-2 py-0.5 rounded border',
                            SUGGESTION_BADGE[it.kind].color
                          )}
                        >
                          {SUGGESTION_BADGE[it.kind].label}
                        </span>
                      ))}
                    </div>
                    <ul className="text-[11px] text-gray-700 leading-relaxed list-disc list-inside ml-1 space-y-0.5">
                      {items.map((it) => (
                        <li key={`${it.stepId}-${it.kind}-msg`}>{it.message}</li>
                      ))}
                    </ul>
                    {kindsWithSol.length > 0 ? (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-[10px] font-semibold text-gray-700 mb-1.5">
                          ソリューション候補（クリックでTo-Beに反映）
                        </p>
                        <div className="grid sm:grid-cols-2 gap-1.5">
                          {kindsWithSol.flatMap((kind) =>
                            SOLUTIONS[kind].map((sol) => {
                              const reducedMin = asIsStep
                                ? Math.max(
                                    0,
                                    Math.round(asIsStep.durationMin * (1 - sol.reductionPct / 100))
                                  )
                                : 0;
                              const afterYen = (reducedMin / 60) * rate;
                              return (
                                <button
                                  key={`${kind}-${sol.name}`}
                                  type="button"
                                  onClick={() => onApply?.(stepId, sol)}
                                  disabled={!onApply}
                                  className="text-left p-2 bg-gray-50 hover:bg-primary-50 disabled:opacity-60 disabled:cursor-not-allowed border border-gray-200 rounded transition-colors"
                                  title={`${sol.examples}（${sol.reductionRange}削減見込み）`}
                                >
                                  <div className="flex items-baseline justify-between gap-2">
                                    <span className="text-[11px] font-bold text-gray-900">
                                      {sol.name}
                                    </span>
                                    <span className="text-[10px] text-emerald-700 font-semibold whitespace-nowrap">
                                      {sol.reductionRange}削減
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-gray-600 mt-0.5 leading-snug line-clamp-2">
                                    {sol.examples}
                                  </p>
                                  {asIsStep && asIsStep.durationMin > 0 ? (
                                    <p className="text-[10px] text-gray-700 mt-1">
                                      {fmtMin(asIsStep.durationMin)}{' '}
                                      <span className="text-gray-400">→</span>{' '}
                                      <span className="font-bold text-primary-700">
                                        {fmtMin(reducedMin)}
                                      </span>
                                      {beforeYen > 0 ? (
                                        <span className="text-gray-500 ml-1">
                                          ({fmtYen(beforeYen)} → {fmtYen(afterYen)})
                                        </span>
                                      ) : null}
                                    </p>
                                  ) : null}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}
