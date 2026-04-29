import { cn } from '@/lib/utils';
import { useState } from 'react';
import { STEP_TYPE_LABEL, STEP_TYPE_STYLE } from '../constants';
import type {
  FlowDiagram,
  FlowLane,
  FlowStep,
  ScenarioKind,
  StepCostMode,
  StepType,
  View,
} from '../types';
import { stepCost, stepCostMode } from '../utils/cost';
import { fmtMin, fmtYen } from '../utils/format';
import { SCENARIOS, applyScenarioToStep, describeScenario, getScenario } from '../utils/scenarios';
import { Field } from './Field';

export function StepEditor({
  step,
  diagram,
  view,
  asIsStep,
  asIsLanes,
  onChange,
  onDelete,
  onClose,
}: {
  step: FlowStep;
  diagram: FlowDiagram;
  view: View;
  asIsStep: FlowStep | null;
  asIsLanes: FlowLane[] | null;
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
            自動処理・外注は「実費のみ」を選ぶと人件費の二重計上を防げます。選んだ方式に応じて下の入力欄が切り替わります。
          </p>
        </Field>

        {(() => {
          const mode = stepCostMode(step);
          const showDuration = mode === 'labor' || mode === 'both';
          const showVariable = mode === 'variable' || mode === 'both';
          const typeField = (
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
          );
          const durationField = (
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
          );
          const variableField = (
            <Field label="個数 × 単価">
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
                  onChange={(e) =>
                    onChange({ unitCostYen: Math.max(0, Number(e.target.value) || 0) })
                  }
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
          );

          return (
            <>
              {showDuration ? (
                <div className="grid grid-cols-2 gap-2">
                  {typeField}
                  {durationField}
                </div>
              ) : (
                typeField
              )}

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

              {showVariable ? variableField : null}
            </>
          );
        })()}

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
          <>
            <ScenarioPicker
              step={step}
              diagram={diagram}
              asIsStep={asIsStep}
              asIsLanes={asIsLanes}
              onChange={onChange}
            />
            <Field label="改善ポイント（自動入力されます）">
              <textarea
                value={step.improvement}
                onChange={(e) => onChange({ improvement: e.target.value })}
                rows={2}
                placeholder="例: 自動化で転記ゼロ（シナリオ適用で自動記録）"
                className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 resize-none"
              />
            </Field>
          </>
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

function ScenarioPicker({
  step,
  diagram,
  asIsStep,
  asIsLanes,
  onChange,
}: {
  step: FlowStep;
  diagram: FlowDiagram;
  asIsStep: FlowStep | null;
  asIsLanes: FlowLane[] | null;
  onChange: (patch: Partial<FlowStep>) => void;
}) {
  const [active, setActive] = useState<ScenarioKind | null>(null);
  const [value, setValue] = useState<number>(60);
  const [targetLaneId, setTargetLaneId] = useState<string>('');

  function onPickKind(kind: ScenarioKind) {
    if (active === kind) {
      setActive(null);
      return;
    }
    const def = getScenario(kind);
    setActive(kind);
    setValue(def.defaultValue);
    if (kind === 'changeLane' && !targetLaneId) {
      const otherLane = diagram.lanes.find((l) => l.id !== step.laneId);
      setTargetLaneId(otherLane?.id ?? step.laneId);
    }
  }

  function onApply() {
    if (!active) return;
    const params =
      active === 'changeLane'
        ? {
            laneId: targetLaneId,
            laneName: diagram.lanes.find((l) => l.id === targetLaneId)?.name,
          }
        : undefined;
    const patch = applyScenarioToStep(step, active, value, params);
    const desc = describeScenario(active, value, { laneName: params?.laneName });
    const existing = step.improvement.trim();
    const improvement = existing && !existing.includes(desc) ? `${existing}／${desc}` : desc;
    onChange({ ...patch, improvement });
    setActive(null);
  }

  // 適用前後の比較用に、現状ステップ・As-Is ステップそれぞれのコストを算出。
  const currentCost = stepCost(step, diagram.lanes);
  const asIsCost = asIsStep && asIsLanes ? stepCost(asIsStep, asIsLanes) : null;

  // プレビュー: アクティブシナリオを仮適用したらどうなるか
  const preview = (() => {
    if (!active) return null;
    const params = active === 'changeLane' ? { laneId: targetLaneId } : undefined;
    const patch = applyScenarioToStep(step, active, value, params);
    const previewStep: FlowStep = { ...step, ...patch };
    return {
      step: previewStep,
      cost: stepCost(previewStep, diagram.lanes),
    };
  })();

  return (
    <div className="rounded-lg border border-primary-200 bg-primary-50/40 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-primary-900">改善シナリオ（MECE）</span>
        <span className="text-[10px] text-primary-700">どれかを選んで数値を入れて適用</span>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {SCENARIOS.map((sc) => {
          const isActive = active === sc.kind;
          return (
            <button
              key={sc.kind}
              type="button"
              onClick={() => onPickKind(sc.kind)}
              className={cn(
                'text-left px-2 py-1.5 rounded border text-[11px] leading-tight transition-colors',
                isActive
                  ? 'border-primary-500 bg-white text-primary-900 ring-2 ring-primary-300'
                  : 'border-primary-200 bg-white text-gray-700 hover:border-primary-400'
              )}
              title={sc.hint}
            >
              <span className="block font-bold">{sc.label}</span>
              <span className="block text-[9px] text-gray-500 font-normal">{sc.hint}</span>
            </button>
          );
        })}
      </div>

      {active ? (
        <div className="rounded-md bg-white border border-primary-200 p-2 space-y-2">
          {getScenario(active).numeric ? (
            <label className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-gray-700 whitespace-nowrap">
                {getScenario(active).inputLabel}
              </span>
              <input
                type="number"
                min={0}
                max={active === 'increaseQty' ? undefined : 100}
                step={5}
                value={value}
                onChange={(e) => setValue(Math.max(0, Number(e.target.value) || 0))}
                className="w-20 border border-gray-300 rounded px-1.5 py-1 text-center"
              />
              <span className="text-gray-500">{getScenario(active).inputUnit}</span>
            </label>
          ) : null}

          {active === 'changeLane' ? (
            <label className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-gray-700 whitespace-nowrap">変更先</span>
              <select
                value={targetLaneId}
                onChange={(e) => setTargetLaneId(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-1.5 py-1 bg-white"
              >
                {diagram.lanes.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                    {typeof l.rateYenPerHour === 'number' && l.rateYenPerHour > 0
                      ? `（¥${l.rateYenPerHour}/時）`
                      : ''}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {preview ? (
            <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-700 bg-gray-50 rounded p-2">
              <div>
                <div className="text-gray-500">現在の To-Be</div>
                <div className="font-bold">{fmtMin(step.durationMin)}</div>
                <div className="text-gray-600">{fmtYen(currentCost)}</div>
              </div>
              <div>
                <div className="text-primary-700">適用後</div>
                <div className="font-bold text-primary-700">{fmtMin(preview.step.durationMin)}</div>
                <div className="text-primary-700">{fmtYen(preview.cost)}</div>
              </div>
              <div>
                <div className="text-emerald-700">差分（適用後 - 現在）</div>
                <div className="font-bold text-emerald-700">
                  {formatDeltaMin(preview.step.durationMin - step.durationMin)}
                </div>
                <div className="font-bold text-emerald-700">
                  {formatDeltaYen(preview.cost - currentCost)}
                </div>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={onApply}
            className="w-full px-3 py-1.5 text-xs font-bold text-white bg-primary-600 rounded hover:bg-primary-700"
          >
            このシナリオを適用する
          </button>
        </div>
      ) : null}

      {asIsStep && asIsCost !== null ? (
        <div className="text-[10px] text-gray-600 leading-snug border-t border-primary-200 pt-2">
          <span className="font-semibold">As-Is比:</span> 時間{' '}
          {formatDeltaMin(step.durationMin - asIsStep.durationMin)} ／ コスト{' '}
          {formatDeltaYen(currentCost - asIsCost)}
          <span className="text-gray-400">
            （As-Is: {fmtMin(asIsStep.durationMin)} / {fmtYen(asIsCost)}）
          </span>
        </div>
      ) : null}
    </div>
  );
}

function formatDeltaMin(diff: number): string {
  if (diff === 0) return '±0';
  const abs = Math.abs(diff);
  return diff > 0 ? `+${fmtMin(abs)}` : `-${fmtMin(abs)}`;
}

function formatDeltaYen(diff: number): string {
  if (diff === 0) return '±¥0';
  const abs = Math.abs(diff);
  return diff > 0 ? `+${fmtYen(abs)}` : `-${fmtYen(abs)}`;
}
