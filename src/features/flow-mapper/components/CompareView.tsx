import { cn } from '@/lib/utils';
import type { SolutionTemplate, State } from '../types';
import { computeAggregates, totalMinutes } from '../utils/cost';
import { fmtMin, fmtYen } from '../utils/format';
import { CostsPanel } from './CostsPanel';
import { Metric } from './Metric';
import { SuggestionsPanel } from './SuggestionsPanel';

export function CompareView({
  state,
  onApplySolution,
}: {
  state: State;
  onApplySolution?: (asIsStepId: string, sol: SolutionTemplate) => void;
}) {
  const a = totalMinutes(state.asIs);
  const b = totalMinutes(state.toBe);
  const delta = a - b;
  const aggA = computeAggregates(state.asIs);
  const aggB = computeAggregates(state.toBe);
  const yenDelta = aggA.totalYen - aggB.totalYen;
  const hasCost = aggA.totalYen > 0 || aggB.totalYen > 0;
  const stepDelta = state.toBe.steps.length - state.asIs.steps.length;
  const laneDelta = state.toBe.lanes.length - state.asIs.lanes.length;
  const pains = state.asIs.steps.filter((s) => s.pain.trim());
  const improvements = state.toBe.steps.filter((s) => s.improvement.trim());

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className={cn('grid gap-3', hasCost ? 'md:grid-cols-4' : 'md:grid-cols-3')}>
        <Metric
          label="想定リードタイム"
          asIs={fmtMin(a)}
          toBe={fmtMin(b)}
          good={delta > 0}
          delta={delta !== 0 ? `${delta > 0 ? '−' : '+'}${fmtMin(Math.abs(delta))}` : '±0'}
        />
        {hasCost ? (
          <Metric
            label="想定コスト（人件費）"
            asIs={fmtYen(aggA.totalYen)}
            toBe={fmtYen(aggB.totalYen)}
            good={yenDelta > 0}
            delta={
              yenDelta !== 0 ? `${yenDelta > 0 ? '−' : '+'}${fmtYen(Math.abs(yenDelta))}` : '±0'
            }
          />
        ) : null}
        <Metric
          label="ステップ数"
          asIs={`${state.asIs.steps.length}`}
          toBe={`${state.toBe.steps.length}`}
          good={stepDelta < 0}
          delta={stepDelta === 0 ? '±0' : `${stepDelta > 0 ? '+' : ''}${stepDelta}`}
        />
        <Metric
          label="関与する担当"
          asIs={`${state.asIs.lanes.length}`}
          toBe={`${state.toBe.lanes.length}`}
          good={laneDelta <= 0}
          delta={laneDelta === 0 ? '±0' : `${laneDelta > 0 ? '+' : ''}${laneDelta}`}
        />
      </div>

      <SuggestionsPanel asIs={state.asIs} label="As-Isから自動分析" onApply={onApplySolution} />

      <div className="grid lg:grid-cols-2 gap-4">
        <CostsPanel diagram={state.asIs} label="As-Is（現状）" />
        <CostsPanel diagram={state.toBe} label="To-Be（改善後）" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="p-4 bg-red-50/40 border border-red-200 rounded-xl">
          <h3 className="text-sm font-bold text-red-900 mb-3">As-Is の課題（{pains.length}件）</h3>
          {pains.length === 0 ? (
            <p className="text-xs text-gray-500">
              As-Is側でステップに「課題・痛み」を記入すると、ここに集約されます。
            </p>
          ) : (
            <ul className="space-y-2 text-xs text-red-900">
              {pains.map((s) => (
                <li key={s.id} className="flex gap-2">
                  <span className="font-semibold whitespace-nowrap text-red-600">課題</span>
                  <span>
                    <span className="font-semibold">{s.label}：</span>
                    {s.pain}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl">
          <h3 className="text-sm font-bold text-emerald-900 mb-3">
            To-Be の改善ポイント（{improvements.length}件）
          </h3>
          {improvements.length === 0 ? (
            <p className="text-xs text-gray-500">
              To-Be側でステップに「改善ポイント」を記入すると、ここに集約されます。
            </p>
          ) : (
            <ul className="space-y-2 text-xs text-emerald-900">
              {improvements.map((s) => (
                <li key={s.id} className="flex gap-2">
                  <span className="font-semibold whitespace-nowrap text-emerald-700">改善</span>
                  <span>
                    <span className="font-semibold">{s.label}：</span>
                    {s.improvement}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
