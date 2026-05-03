import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { CompareView } from './components/CompareView';
import { CostsPanel } from './components/CostsPanel';
import { ExportMenu } from './components/ExportMenu';
import { ImpactPanel } from './components/ImpactPanel';
import { PrintStyles } from './components/PrintStyles';
import { ShapePalette } from './components/ShapePalette';
import { StepEditorDrawer } from './components/StepEditorDrawer';
import { SuggestionsPanel } from './components/SuggestionsPanel';
import { SwimlaneCanvas } from './components/SwimlaneCanvas';
import { TemplatePicker } from './components/TemplatePicker';
import { useFlowStore } from './store';
import type { DiagramTarget } from './types';

const TEMPLATE_PICKER_FLAG = 'beekle-flow-mapper-template-picker-shown';

export function FlowMapper() {
  const asIs = useFlowStore((s) => s.asIs);
  const toBe = useFlowStore((s) => s.toBe);
  const view = useFlowStore((s) => s.view);
  const editingId = useFlowStore((s) => s.editingId);
  const connectMode = useFlowStore((s) => s.connectMode);
  const connectFromId = useFlowStore((s) => s.connectFromId);
  const fullscreen = useFlowStore((s) => s.fullscreen);
  const onboardingOpen = useFlowStore((s) => s.onboardingOpen);
  const executionsPerMonth = useFlowStore((s) => s.executionsPerMonth);
  const setExecutionsPerMonth = useFlowStore((s) => s.setExecutionsPerMonth);

  const setView = useFlowStore((s) => s.setView);
  const setEditingId = useFlowStore((s) => s.setEditingId);
  const toggleConnectMode = useFlowStore((s) => s.toggleConnectMode);
  const toggleFullscreen = useFlowStore((s) => s.toggleFullscreen);
  const setFullscreen = useFlowStore((s) => s.setFullscreen);
  const dismissOnboarding = useFlowStore((s) => s.dismissOnboarding);
  const hydrateOnboardingFromStorage = useFlowStore((s) => s.hydrateOnboardingFromStorage);

  const addLane = useFlowStore((s) => s.addLane);
  const renameLane = useFlowStore((s) => s.renameLane);
  const updateLaneRate = useFlowStore((s) => s.updateLaneRate);
  const deleteLane = useFlowStore((s) => s.deleteLane);
  const addPhase = useFlowStore((s) => s.addPhase);
  const renamePhase = useFlowStore((s) => s.renamePhase);
  const deletePhase = useFlowStore((s) => s.deletePhase);
  const setDiagramTitle = useFlowStore((s) => s.setDiagramTitle);
  const addStep = useFlowStore((s) => s.addStep);
  const updateStep = useFlowStore((s) => s.updateStep);
  const deleteStep = useFlowStore((s) => s.deleteStep);
  const moveStep = useFlowStore((s) => s.moveStep);
  const swapSteps = useFlowStore((s) => s.swapSteps);
  const renameStep = useFlowStore((s) => s.renameStep);
  const handleStepClick = useFlowStore((s) => s.handleStepClick);
  const startConnectFrom = useFlowStore((s) => s.startConnectFrom);
  const applySolutionToToBe = useFlowStore((s) => s.applySolutionToToBe);
  const loadSample = useFlowStore((s) => s.loadSample);
  const loadTemplate = useFlowStore((s) => s.loadTemplate);
  const resetAll = useFlowStore((s) => s.resetAll);
  const copyToBeFromAsIs = useFlowStore((s) => s.copyToBeFromAsIs);

  const target: DiagramTarget = view === 'toBe' ? 'toBe' : 'asIs';
  const activeDiagram = view === 'compare' ? null : view === 'toBe' ? toBe : asIs;
  const state = useMemo(() => ({ asIs, toBe }), [asIs, toBe]);

  useEffect(() => {
    hydrateOnboardingFromStorage();
  }, [hydrateOnboardingFromStorage]);

  // テンプレ選択モーダル: 両方のフローが EMPTY (0 ステップ) で
  // かつ「一度も表示してない」場合にのみ表示。
  // 初回マウント時のみ判定する（ステップ追加→削除で空に戻ったときに再表示はしない）
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: 初回マウント時のみ判定。後続の asIs/toBe 変化で再評価しない
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isEmpty = asIs.steps.length === 0 && toBe.steps.length === 0;
    if (!isEmpty) return;
    try {
      const shown = localStorage.getItem(TEMPLATE_PICKER_FLAG);
      if (shown !== '1') setTemplatePickerOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  function markTemplatePickerShown() {
    try {
      localStorage.setItem(TEMPLATE_PICKER_FLAG, '1');
    } catch {
      /* ignore */
    }
    setTemplatePickerOpen(false);
  }

  // ESC で全画面解除 + 全画面中は body のスクロールを止める
  useEffect(() => {
    if (!fullscreen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setFullscreen(false);
    }
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [fullscreen, setFullscreen]);

  const editingStep = useMemo(() => {
    if (!editingId || !activeDiagram) return null;
    return activeDiagram.steps.find((s) => s.id === editingId) ?? null;
  }, [editingId, activeDiagram]);

  // To-Be 編集中、同 ID の As-Is ステップを引き当てて差分計算に使う。
  // As-Is 編集中は null（自分自身との比較は意味がないため）。
  const asIsStepForEditor = useMemo(() => {
    if (view !== 'toBe' || !editingId) return null;
    return asIs.steps.find((s) => s.id === editingId) ?? null;
  }, [view, editingId, asIs]);

  // overflow 検知のための一時 state（toolbar の「全画面で見る」ハイライト用）
  // SwimlaneCanvas 側で overflow を検知して setCanvasOverflows する設計だったが、
  // store には載せず、index 内のローカル state に閉じ込める。
  const [canvasOverflows, setCanvasOverflowsState] = useLocalOverflows();

  function handleResetAll() {
    if (!confirm('現在のフローを破棄して空の状態に戻します。よろしいですか？')) return;
    resetAll();
  }

  function handleCopyToBe() {
    if (!confirm('As-IsをTo-Beにコピーします（既存のTo-Beは上書き）。続行しますか？')) return;
    copyToBeFromAsIs();
  }

  return (
    <div
      className={cn(
        'bg-white border border-gray-200 shadow-soft flow-mapper-root',
        fullscreen
          ? 'fixed inset-0 z-50 rounded-none flex flex-col overflow-hidden'
          : 'rounded-2xl overflow-hidden'
      )}
    >
      <PrintStyles />
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between flex-wrap gap-2 no-print">
        <div className="inline-flex rounded-lg border border-gray-300 bg-white overflow-hidden text-sm">
          {(['asIs', 'toBe', 'compare'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                'px-4 py-2 font-medium transition-colors first:border-l-0 border-l border-gray-300',
                view === v
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              {v === 'asIs' ? 'As-Is（現状）' : v === 'toBe' ? 'To-Be（改善後）' : '比較'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={loadSample}
            className="px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 text-xs font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100"
          >
            サンプルを読込
          </button>
          {view === 'toBe' ? (
            <button
              type="button"
              onClick={handleCopyToBe}
              className="px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              As-Isをコピー
            </button>
          ) : null}
          <button
            type="button"
            onClick={toggleConnectMode}
            disabled={view === 'compare'}
            className={cn(
              'px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 text-xs font-medium border rounded-lg transition-colors disabled:opacity-40',
              connectMode
                ? 'text-white bg-secondary-500 border-secondary-600 hover:bg-secondary-600'
                : 'text-secondary-700 bg-secondary-50 border-secondary-200 hover:bg-secondary-100'
            )}
            title="2つのステップをクリックして矢印を引きます（再クリックで解除）"
          >
            {connectMode ? '接続モード ON（クリックで解除）' : '接続モード'}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className={cn(
              'relative px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 text-xs font-medium border rounded-lg transition-colors',
              fullscreen
                ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                : canvasOverflows
                  ? 'text-amber-900 bg-highlight-100 border-highlight-400 hover:bg-highlight-200 ring-2 ring-highlight-300/60'
                  : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
            )}
            title={
              fullscreen
                ? '全画面を解除（Esc）'
                : canvasOverflows
                  ? 'キャンバスがはみ出ています。全画面で広く作業できます'
                  : '全画面で作業'
            }
          >
            {fullscreen ? '全画面を解除' : canvasOverflows ? '全画面で見る' : '全画面'}
            {canvasOverflows && !fullscreen ? (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            ) : null}
          </button>
          <ExportMenu state={state} view={view} />
          <button
            type="button"
            onClick={handleResetAll}
            className="px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 text-xs font-medium text-gray-600 hover:text-red-600"
          >
            リセット
          </button>
        </div>
      </div>
      {connectMode ? (
        <div className="bg-secondary-50 border-b border-secondary-200 px-4 py-2 text-xs text-secondary-900 no-print">
          {connectFromId
            ? '接続元を選択中。次のステップをクリックすると矢印を引きます（同じステップで解除）'
            : 'ステップを2回クリックして矢印を引きます。1回目: 元、2回目: 先。'}
        </div>
      ) : null}

      {onboardingOpen ? (
        <div className="bg-primary-50 border-b border-primary-200 px-4 py-3 no-print">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold text-primary-900">
                  はじめての方へ：5分で覚える操作ガイド
                </span>
              </div>
              <ol className="text-xs text-primary-900/90 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>
                  <strong>図形パレット</strong>
                  （左の○◇▭ボタン群）を押すと、その種類のステップが追加され、
                  <strong>直前のステップから自動で矢印が引かれます</strong>
                </li>
                <li>
                  ステップを<strong>クリック</strong>すると右側パネルが開き、
                  <strong className="text-primary-700 underline">
                    所要時間（分）・担当・使用ツール・課題
                  </strong>
                  などを編集できます
                </li>
                <li>
                  ステップを<strong>ダブルクリック</strong>
                  するとその場で名前を変更（Enterで確定、Escで取消）
                </li>
                <li>
                  ステップに<strong>マウスオーバーすると右端に「+」ボタン</strong>
                  が出現。クリックでそのステップから矢印を引く接続モードに入ります
                </li>
                <li>
                  ステップを<strong>ドラッグ</strong>して別の担当（レーン）やフェーズへ移動できます
                </li>
                <li>
                  上部の<strong>「全画面」</strong>ボタンで作業領域を最大化（Escで解除）
                </li>
                <li>
                  <strong>As-Is</strong>
                  （現状）を作ったら「To-Be」タブで改善後を、「比較」タブで差分を確認
                </li>
              </ol>
              <p className="text-[11px] text-primary-700 mt-2">
                ※
                まず手を動かして試したい場合は、上部「サンプルを読込」を押すと受注〜出荷業務のフルサンプルが入ります。
              </p>
            </div>
            <button
              type="button"
              onClick={dismissOnboarding}
              className="flex-shrink-0 text-xs text-primary-700 hover:text-primary-900 px-3 py-2.5 sm:py-1 min-h-[44px] sm:min-h-0 hover:bg-primary-100 rounded"
              title="このガイドを閉じる（次回から表示しません）"
            >
              閉じる ×
            </button>
          </div>
        </div>
      ) : null}

      {view === 'compare' ? (
        <CompareView state={state} onApplySolution={applySolutionToToBe} />
      ) : activeDiagram ? (
        <div
          className={cn(
            'grid lg:grid-cols-[1fr_340px] gap-0',
            fullscreen && 'flex-1 min-h-0 overflow-hidden'
          )}
        >
          <div
            className={cn(
              'p-4 md:p-6 min-w-0',
              fullscreen && 'flex flex-col min-h-0 overflow-hidden'
            )}
          >
            <input
              type="text"
              value={activeDiagram.title}
              onChange={(e) => setDiagramTitle(target, e.target.value)}
              className="text-lg font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-primary-400 focus:outline-none w-full mb-4 no-print-border"
              placeholder="フロー名を入力"
            />
            <div className="flex flex-wrap items-center gap-2 mb-3 text-xs no-print">
              <ShapePalette onAdd={(type) => addStep(target, undefined, undefined, type)} />
              <span className="text-[11px] text-gray-500 ml-2">
                図形をドラッグして配置先のセルにドロップ／フェーズ・担当の追加はキャンバス右端・下端のボタンから
              </span>
            </div>
            <div className={cn(fullscreen && 'flex-1 min-h-0 flex flex-col')}>
              <SwimlaneCanvas
                diagram={activeDiagram}
                editingId={editingId}
                connectMode={connectMode}
                connectFromId={connectFromId}
                fullscreen={fullscreen}
                onSelect={(id) => handleStepClick(target, id)}
                onAddStep={(laneId, phaseId, type) => addStep(target, laneId, phaseId, type)}
                onAddLane={() => addLane(target)}
                onAddPhase={() => addPhase(target)}
                onRenameLane={(id, name) => renameLane(target, id, name)}
                onUpdateLaneRate={(id, rate) => updateLaneRate(target, id, rate)}
                onDeleteLane={(id) => deleteLane(target, id)}
                onRenamePhase={(id, name) => renamePhase(target, id, name)}
                onDeletePhase={(id) => deletePhase(target, id)}
                onMoveStep={(id, laneId, phaseId, beforeStepId) =>
                  moveStep(target, id, laneId, phaseId, beforeStepId)
                }
                onSwapSteps={(idA, idB) => swapSteps(target, idA, idB)}
                onRenameStep={(id, label) => renameStep(target, id, label)}
                onDeleteStep={(id) => deleteStep(target, id)}
                onStartConnect={startConnectFrom}
                onOverflowChange={setCanvasOverflowsState}
              />
            </div>
            {!fullscreen ? (
              <>
                {view === 'toBe' ? (
                  <ImpactPanel
                    asIs={asIs}
                    toBe={toBe}
                    executionsPerMonth={executionsPerMonth}
                    onChangeExecutionsPerMonth={setExecutionsPerMonth}
                  />
                ) : null}
                <CostsPanel diagram={activeDiagram} label={view === 'toBe' ? 'To-Be' : 'As-Is'} />
                {view === 'toBe' ? (
                  <SuggestionsPanel asIs={asIs} onApply={applySolutionToToBe} />
                ) : null}
              </>
            ) : null}
          </div>
          <StepEditorDrawer
            step={editingStep}
            diagram={activeDiagram}
            view={view}
            asIsStep={asIsStepForEditor}
            asIsLanes={view === 'toBe' ? asIs.lanes : null}
            fullscreen={fullscreen}
            onChange={(patch) => editingStep && updateStep(target, editingStep.id, patch)}
            onDelete={() => editingStep && deleteStep(target, editingStep.id)}
            onClose={() => setEditingId(null)}
            onAddStep={() => addStep(target)}
          />
        </div>
      ) : null}

      {templatePickerOpen ? (
        <TemplatePicker
          onPickTemplate={(tpl) => {
            loadTemplate(tpl);
            markTemplatePickerShown();
          }}
          onLoadSample={() => {
            loadSample();
            markTemplatePickerShown();
          }}
          onStartBlank={markTemplatePickerShown}
          onClose={markTemplatePickerShown}
        />
      ) : null}
    </div>
  );
}

// canvasOverflows は SwimlaneCanvas → toolbar 表示用に流す UI 状態。
// 永続不要 + ドメインに無関係なので store には載せず、ここに閉じ込める。
function useLocalOverflows(): [boolean, (b: boolean) => void] {
  const [v, setV] = useState(false);
  return [v, setV];
}
