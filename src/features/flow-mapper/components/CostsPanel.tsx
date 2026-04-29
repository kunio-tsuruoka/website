import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import type { FlowDiagram } from '../types';
import { computeAggregates, stepLaborCost, stepVariableCost } from '../utils/cost';
import { fmtMin, fmtYen } from '../utils/format';

// 集計パネル: フェーズ・担当・種別ごとの時間とコストを可視化し、ボトルネック5位を表示
export function CostsPanel({ diagram, label }: { diagram: FlowDiagram; label: string }) {
  const [open, setOpen] = useState(true);
  const agg = useMemo(() => computeAggregates(diagram), [diagram]);
  const hasCost = agg.totalYen > 0;
  // 内訳: 人件費（時間×時給）と 個数×単価 の合計
  const breakdown = useMemo(() => {
    let labor = 0;
    let variable = 0;
    for (const s of diagram.steps) {
      labor += stepLaborCost(s, diagram.lanes);
      variable += stepVariableCost(s);
    }
    return { labor, variable };
  }, [diagram]);

  function pct(part: number, whole: number) {
    if (whole <= 0) return 0;
    return Math.round((part / whole) * 100);
  }

  function bar(part: number, whole: number, color: string) {
    const p = pct(part, whole);
    return (
      <div className="w-full h-1.5 bg-gray-100 rounded overflow-hidden">
        <div className={cn('h-full', color)} style={{ width: `${p}%` }} />
      </div>
    );
  }

  return (
    <section className="mt-4 border border-gray-200 rounded-xl bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 border-b border-gray-200"
      >
        <span className="text-sm font-bold text-gray-900 flex items-center gap-2 flex-wrap">
          工程・担当別の時間とコスト集計（{label}）
          <span className="text-xs font-normal text-gray-600">
            合計 {fmtMin(agg.totalMinutes)}
            {hasCost ? ` / ${fmtYen(agg.totalYen)}` : ''}
          </span>
          {hasCost && breakdown.variable > 0 ? (
            <span className="text-[10px] font-normal text-gray-500">
              内訳: 人件費 {fmtYen(breakdown.labor)} / 個数×単価 {fmtYen(breakdown.variable)}
            </span>
          ) : null}
        </span>
        <span className="text-xs text-gray-500">{open ? '▼' : '▶'}</span>
      </button>
      {open ? (
        <div className="p-4 space-y-5">
          {agg.totalMinutes === 0 ? (
            <p className="text-xs text-gray-500">
              ステップがまだありません。図形パレットからステップを追加すると、ここに集計が表示されます。
            </p>
          ) : (
            <>
              {!hasCost ? (
                <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                  担当ラベル下の「¥◯◯/時」を入力すると、コスト計算が有効になります（例:
                  営業4500、事務3000）
                </p>
              ) : null}

              <div>
                <h4 className="text-xs font-bold text-gray-800 mb-2">
                  フェーズ別（時間 / コスト）
                </h4>
                <div className="space-y-1.5">
                  {agg.byPhase.map((p) => (
                    <div key={p.name} className="text-xs">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold text-gray-700 truncate">{p.name}</span>
                        <span className="text-gray-600 whitespace-nowrap">
                          {fmtMin(p.minutes)}
                          {hasCost ? ` / ${fmtYen(p.yen)}` : ''}
                          <span className="text-gray-400 ml-1">
                            (
                            {pct(
                              hasCost ? p.yen : p.minutes,
                              hasCost ? agg.totalYen : agg.totalMinutes
                            )}
                            %)
                          </span>
                        </span>
                      </div>
                      {bar(
                        hasCost ? p.yen : p.minutes,
                        hasCost ? agg.totalYen : agg.totalMinutes,
                        'bg-primary-500'
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-800 mb-2">担当別（時間 / コスト）</h4>
                <div className="space-y-1.5">
                  {agg.byLane
                    .filter((l) => l.minutes > 0)
                    .map((l) => (
                      <div key={l.name} className="text-xs">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-semibold text-gray-700 truncate">{l.name}</span>
                          <span className="text-gray-600 whitespace-nowrap">
                            {fmtMin(l.minutes)}
                            {hasCost ? ` / ${fmtYen(l.yen)}` : ''}
                            <span className="text-gray-400 ml-1">
                              (
                              {pct(
                                hasCost ? l.yen : l.minutes,
                                hasCost ? agg.totalYen : agg.totalMinutes
                              )}
                              %)
                            </span>
                          </span>
                        </div>
                        {bar(
                          hasCost ? l.yen : l.minutes,
                          hasCost ? agg.totalYen : agg.totalMinutes,
                          'bg-secondary-500'
                        )}
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-800 mb-2">
                  {hasCost ? 'コスト' : '時間'}ボトルネック 上位5
                </h4>
                <ol className="space-y-1 text-xs">
                  {agg.topSteps
                    .filter((s) => s.minutes > 0)
                    .map((s, i) => (
                      <li
                        key={s.id}
                        className="flex items-baseline gap-2 px-2 py-1 bg-gray-50 rounded"
                      >
                        <span className="text-gray-400 font-bold w-4">#{i + 1}</span>
                        <span className="flex-1 truncate">
                          <strong className="text-gray-800">{s.label}</strong>
                          <span className="text-gray-500 ml-1">
                            ({s.phaseName} / {s.laneName})
                          </span>
                        </span>
                        <span className="text-gray-700 whitespace-nowrap">
                          {fmtMin(s.minutes)}
                          {hasCost ? ` / ${fmtYen(s.yen)}` : ''}
                        </span>
                      </li>
                    ))}
                </ol>
              </div>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
