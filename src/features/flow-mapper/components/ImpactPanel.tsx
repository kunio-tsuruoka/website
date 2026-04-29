import { useMemo } from 'react';
import type { FlowDiagram } from '../types';
import { computeAggregates } from '../utils/cost';
import { fmtMin, fmtYen } from '../utils/format';

// 経営インパクト = (As-Is - To-Be) × 月間実行回数 × 12
// 1回あたりの差を年間ベースに換算して可視化する。
export function ImpactPanel({
  asIs,
  toBe,
  executionsPerMonth,
  onChangeExecutionsPerMonth,
}: {
  asIs: FlowDiagram;
  toBe: FlowDiagram;
  executionsPerMonth: number;
  onChangeExecutionsPerMonth: (n: number) => void;
}) {
  const asIsAgg = useMemo(() => computeAggregates(asIs), [asIs]);
  const toBeAgg = useMemo(() => computeAggregates(toBe), [toBe]);

  const perRun = {
    minutesSaved: asIsAgg.totalMinutes - toBeAgg.totalMinutes,
    yenSaved: asIsAgg.totalYen - toBeAgg.totalYen,
  };

  const annual = {
    runs: executionsPerMonth * 12,
    minutesSaved: perRun.minutesSaved * executionsPerMonth * 12,
    yenSaved: perRun.yenSaved * executionsPerMonth * 12,
  };

  // FTE 換算: 年間労働時間 1800h を 1 FTE と仮定（一般的な営業日換算）。
  const fte = annual.minutesSaved / 60 / 1800;

  const noToBe = toBeAgg.totalMinutes === 0 && toBeAgg.totalYen === 0;
  const noChange = perRun.minutesSaved === 0 && perRun.yenSaved === 0;

  return (
    <section className="mt-4 border border-primary-300 rounded-xl bg-gradient-to-br from-primary-50 to-white overflow-hidden">
      <div className="px-4 py-3 border-b border-primary-200 bg-primary-100/50 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-primary-900">経営インパクト（年間換算）</h3>
          <p className="text-[10px] text-primary-700/80 mt-0.5">
            1回あたりの差 × 月間実行回数 × 12 ヶ月で算出
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-primary-900">
          <span className="font-semibold whitespace-nowrap">月間実行回数</span>
          <input
            type="number"
            min={0}
            step={10}
            value={executionsPerMonth || ''}
            onChange={(e) => onChangeExecutionsPerMonth(Math.max(0, Number(e.target.value) || 0))}
            className="w-20 border border-primary-300 rounded px-2 py-1 text-sm font-bold text-center bg-white focus:outline-none focus:border-primary-500"
            placeholder="100"
          />
          <span className="text-gray-500">回/月</span>
        </label>
      </div>

      {noToBe ? (
        <div className="p-4 text-xs text-gray-600">
          To-Be
          がまだ作成されていません。「As-Isをコピー」してからシナリオを適用すると、ここに年間インパクトが出ます。
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ImpactCard
            label="年間 削減時間"
            primary={fmtMin(annual.minutesSaved)}
            secondary={`${Math.round((annual.minutesSaved / 60) * 10) / 10} 時間`}
            note={`1回 ${fmtMin(perRun.minutesSaved)} × ${annual.runs}回/年`}
            delta={perRun.minutesSaved}
          />
          <ImpactCard
            label="年間 削減コスト"
            primary={fmtYen(annual.yenSaved)}
            secondary={`月間 ${fmtYen(annual.yenSaved / 12)}`}
            note={`1回 ${fmtYen(perRun.yenSaved)} × ${annual.runs}回/年`}
            delta={perRun.yenSaved}
          />
          <ImpactCard
            label="FTE 換算"
            primary={`${(Math.round(fte * 100) / 100).toFixed(2)} 人`}
            secondary={fte > 0 ? `${(Math.round(fte * 12 * 100) / 100).toFixed(2)} 人月相当` : '—'}
            note="年間1800h を 1FTE とみなす"
            delta={annual.minutesSaved}
          />
        </div>
      )}

      {!noToBe && noChange ? (
        <div className="px-4 pb-3 text-[11px] text-amber-800">
          As-Is と To-Be で時間・コストの差が出ていません。To-Be
          ステップで「改善シナリオ」を適用すると差が反映されます。
        </div>
      ) : null}
    </section>
  );
}

function ImpactCard({
  label,
  primary,
  secondary,
  note,
  delta,
}: {
  label: string;
  primary: string;
  secondary: string;
  note: string;
  delta: number;
}) {
  const positive = delta > 0;
  const negative = delta < 0;
  const color = positive
    ? 'text-emerald-700 border-emerald-300 bg-emerald-50'
    : negative
      ? 'text-red-700 border-red-300 bg-red-50'
      : 'text-gray-700 border-gray-200 bg-white';
  return (
    <div className={`rounded-lg border p-3 ${color}`}>
      <div className="text-[10px] font-semibold opacity-80">{label}</div>
      <div className="text-2xl font-bold mt-1 leading-tight">{primary}</div>
      <div className="text-xs font-medium mt-0.5">{secondary}</div>
      <div className="text-[10px] mt-1.5 opacity-70">{note}</div>
    </div>
  );
}
