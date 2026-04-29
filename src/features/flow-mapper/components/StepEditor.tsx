import { cn } from '@/lib/utils';
import { STEP_TYPE_LABEL, STEP_TYPE_STYLE } from '../constants';
import type { FlowDiagram, FlowStep, StepCostMode, StepType, View } from '../types';
import { stepCostMode } from '../utils/cost';
import { fmtYen } from '../utils/format';
import { Field } from './Field';

export function StepEditor({
  step,
  diagram,
  view,
  onChange,
  onDelete,
  onClose,
}: {
  step: FlowStep;
  diagram: FlowDiagram;
  view: View;
  onChange: (patch: Partial<FlowStep>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const candidates = diagram.steps.filter((s) => s.id !== step.id);

  function toggleNext(nid: string) {
    const set = new Set(step.next);
    if (set.has(nid)) set.delete(nid);
    else set.add(nid);
    onChange({ next: Array.from(set) });
  }

  return (
    <div className="p-4 max-h-[800px] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">ステップを編集</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 text-xs"
        >
          閉じる ×
        </button>
      </div>

      <div className="space-y-3">
        <Field label="内容">
          <input
            type="text"
            value={step.label}
            onChange={(e) => onChange({ label: e.target.value })}
            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:border-primary-400"
          />
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="種別">
            <select
              value={step.type}
              onChange={(e) => onChange({ type: e.target.value as StepType })}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white"
            >
              {(Object.keys(STEP_TYPE_LABEL) as StepType[]).map((t) => (
                <option key={t} value={t}>
                  {STEP_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="所要時間（分）">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onChange({ durationMin: Math.max(0, step.durationMin - 5) })}
                className="px-2 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50"
                aria-label="所要時間を5分減らす"
              >
                −
              </button>
              <input
                type="number"
                min={0}
                step={5}
                value={step.durationMin || ''}
                onChange={(e) =>
                  onChange({ durationMin: Math.max(0, Number(e.target.value) || 0) })
                }
                className="w-full text-sm font-bold text-center border-y border-gray-300 px-1 py-1.5 focus:outline-none focus:bg-primary-50"
                placeholder="0"
              />
              <button
                type="button"
                onClick={() => onChange({ durationMin: step.durationMin + 5 })}
                className="px-2 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50"
                aria-label="所要時間を5分増やす"
              >
                ＋
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5">分単位。±ボタンで5分刻み調整</p>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="フェーズ">
            <select
              value={step.phaseId}
              onChange={(e) => onChange({ phaseId: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white"
            >
              {diagram.phases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="担当">
            <select
              value={step.laneId}
              onChange={(e) => onChange({ laneId: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white"
            >
              {diagram.lanes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="使用ツール">
          <input
            type="text"
            value={step.tool}
            onChange={(e) => onChange({ tool: e.target.value })}
            placeholder="例: Excel, Slack"
            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5"
          />
        </Field>

        <Field label="コスト計算方式">
          <div className="grid grid-cols-3 gap-1 text-[11px]">
            {(
              [
                { v: 'labor', label: '人件費のみ', hint: '時間×時給' },
                { v: 'variable', label: '実費のみ', hint: '個数×単価' },
                { v: 'both', label: '両方を加算', hint: '時間＋実費' },
              ] as { v: StepCostMode; label: string; hint: string }[]
            ).map((opt) => {
              const active = stepCostMode(step) === opt.v;
              return (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => onChange({ costMode: opt.v })}
                  className={cn(
                    'px-1.5 py-1.5 rounded border text-center leading-tight',
                    active
                      ? 'border-primary-500 bg-primary-50 text-primary-800 font-semibold'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                  )}
                >
                  <span className="block">{opt.label}</span>
                  <span className="block text-[9px] text-gray-500 font-normal">{opt.hint}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-500 mt-1 leading-snug">
            自動処理・外注は「実費のみ」を選ぶと人件費の二重計上を防げます。
          </p>
        </Field>

        {/* 個数 × 単価（材料費・配送費・印刷費など、時間以外のコスト） */}
        <Field label="個数 × 単価（任意）">
          <div className="flex items-center gap-1 text-xs">
            <input
              type="number"
              min={0}
              value={step.quantity || ''}
              onChange={(e) => onChange({ quantity: Math.max(0, Number(e.target.value) || 0) })}
              className="w-16 border border-gray-300 rounded px-1.5 py-1 text-center"
              placeholder="0"
            />
            <input
              type="text"
              value={step.unitLabel ?? ''}
              onChange={(e) => onChange({ unitLabel: e.target.value })}
              className="w-12 border border-gray-300 rounded px-1.5 py-1 text-center text-[11px]"
              placeholder="個"
            />
            <span className="text-gray-500">×</span>
            <span className="text-gray-500">¥</span>
            <input
              type="number"
              min={0}
              value={step.unitCostYen || ''}
              onChange={(e) => onChange({ unitCostYen: Math.max(0, Number(e.target.value) || 0) })}
              className="w-20 border border-gray-300 rounded px-1.5 py-1 text-center"
              placeholder="0"
            />
            <span className="text-gray-500 text-[11px]">/単位</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">
            紙代・送料・材料費など、時間以外のコスト。例: 100<small>枚</small> × ¥5 → ¥500
            を集計に加算。{' '}
            {(step.quantity ?? 0) > 0 && (step.unitCostYen ?? 0) > 0 ? (
              <span className="font-bold text-primary-700">
                小計: {fmtYen((step.quantity ?? 0) * (step.unitCostYen ?? 0))}
              </span>
            ) : null}
          </p>
        </Field>

        {view === 'asIs' ? (
          <Field label="課題・痛み">
            <textarea
              value={step.pain}
              onChange={(e) => onChange({ pain: e.target.value })}
              rows={2}
              placeholder="例: 転記ミスが月3〜5件"
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 resize-none"
            />
          </Field>
        ) : (
          <Field label="改善ポイント">
            <textarea
              value={step.improvement}
              onChange={(e) => onChange({ improvement: e.target.value })}
              rows={2}
              placeholder="例: 自動化で転記ゼロ"
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 resize-none"
            />
          </Field>
        )}

        <div>
          <span className="block text-xs font-semibold text-gray-600 mb-1">
            次のステップ（複数選択で分岐）
          </span>
          {candidates.length === 0 ? (
            <p className="text-xs text-gray-400">
              他のステップが無いため接続できません。先にステップを追加してください。
            </p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2 bg-white">
              {candidates.map((c) => {
                const checked = step.next.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleNext(c.id)}
                      className="accent-primary-500"
                    />
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[9px] font-bold border',
                        STEP_TYPE_STYLE[c.type]
                      )}
                    >
                      {STEP_TYPE_LABEL[c.type]}
                    </span>
                    <span className="truncate">{c.label}</span>
                  </label>
                );
              })}
            </div>
          )}
          {step.next.length > 1 ? (
            <p className="mt-1 text-[10px] text-amber-700">
              複数選択中：「判断」種別と組み合わせると分岐になります
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm('このステップを削除しますか？')) onDelete();
          }}
          className="w-full px-3 py-2 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50"
        >
          このステップを削除
        </button>
      </div>
    </div>
  );
}
