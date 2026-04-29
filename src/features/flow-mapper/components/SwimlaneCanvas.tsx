import { cn } from '@/lib/utils';
import { useEffect, useMemo, useRef } from 'react';
import { CARD_H, CARD_W, HEADER_H, LANE_LABEL_W, LANE_PAD_Y, PHASE_PAD_X } from '../constants';
import { useOverflowDetect } from '../hooks/useOverflowDetect';
import type { FlowDiagram } from '../types';
import { buildArrowPath, computeLayout } from '../utils/layout';
import { StepCard } from './StepCard';

export function SwimlaneCanvas({
  diagram,
  editingId,
  connectMode,
  connectFromId,
  fullscreen,
  onSelect,
  onAddStep,
  onRenameLane,
  onUpdateLaneRate,
  onDeleteLane,
  onRenamePhase,
  onDeletePhase,
  onMoveStep,
  onRenameStep,
  onDeleteStep,
  onStartConnect,
  onOverflowChange,
}: {
  diagram: FlowDiagram;
  editingId: string | null;
  connectMode: boolean;
  connectFromId: string | null;
  fullscreen?: boolean;
  onSelect: (id: string) => void;
  onAddStep: (laneId: string, phaseId: string) => void;
  onRenameLane: (id: string, name: string) => void;
  onUpdateLaneRate: (id: string, rate: number) => void;
  onDeleteLane: (id: string) => void;
  onRenamePhase: (id: string, name: string) => void;
  onDeletePhase: (id: string) => void;
  onMoveStep: (id: string, laneId: string, phaseId: string) => void;
  onRenameStep: (id: string, label: string) => void;
  onDeleteStep: (id: string) => void;
  onStartConnect: (id: string) => void;
  onOverflowChange?: (overflows: boolean) => void;
}) {
  const layout = useMemo(() => computeLayout(diagram), [diagram]);

  const arrows = useMemo(() => {
    const list: { d: string; key: string; emphasized: boolean }[] = [];
    for (const s of diagram.steps) {
      const from = layout.step.get(s.id);
      if (!from) continue;
      for (const nid of s.next) {
        const to = layout.step.get(nid);
        if (!to) continue;
        const isConnectActive = connectMode && (connectFromId === s.id || connectFromId === nid);
        list.push({
          key: `${s.id}->${nid}`,
          d: buildArrowPath(from, to),
          emphasized: editingId === s.id || editingId === nid || isConnectActive,
        });
      }
    }
    return list;
  }, [diagram, layout, editingId, connectMode, connectFromId]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const overflows = useOverflowDetect(scrollRef, [layout.width, layout.height, fullscreen]);

  useEffect(() => {
    onOverflowChange?.(overflows);
  }, [overflows, onOverflowChange]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        'border border-gray-200 rounded-xl bg-white flow-mapper-canvas',
        fullscreen ? 'flex-1 min-h-0 overflow-auto' : 'overflow-x-auto'
      )}
    >
      <div
        className="relative"
        style={{
          width: layout.width,
          height: layout.height,
          minWidth: '100%',
          backgroundImage: 'radial-gradient(circle, rgba(15, 23, 42, 0.06) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundPosition: `${LANE_LABEL_W}px ${HEADER_H}px`,
        }}
      >
        <div
          className="absolute top-0 left-0 bg-gray-50 border-b border-gray-300 flex items-center justify-center text-[11px] font-bold text-gray-500"
          style={{ width: LANE_LABEL_W, height: HEADER_H }}
        >
          フェーズ →
        </div>
        {diagram.phases.map((phase) => {
          const px = layout.phaseX.get(phase.id);
          if (!px) return null;
          return (
            <div
              key={`ph-${phase.id}`}
              className="absolute top-0 bg-primary-50 border-b border-r border-primary-200 flex items-center justify-between px-3 group"
              style={{ left: px.x, width: px.w, height: HEADER_H }}
            >
              <input
                type="text"
                value={phase.name}
                onChange={(e) => onRenamePhase(phase.id, e.target.value)}
                className="bg-transparent text-sm font-bold text-primary-900 focus:outline-none w-full no-print-border"
              />
              {diagram.phases.length > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`フェーズ「${phase.name}」とそのステップを削除しますか？`))
                      onDeletePhase(phase.id);
                  }}
                  className="text-xs text-gray-400 hover:text-red-500 px-1 opacity-0 group-hover:opacity-100 no-print"
                  aria-label="フェーズを削除"
                >
                  ×
                </button>
              ) : null}
            </div>
          );
        })}

        {/* Lane label column + lane bands (BPMS の swimlane を意識) */}
        {diagram.lanes.map((lane, laneIdx) => {
          const ly = layout.laneY.get(lane.id);
          if (!ly) return null;
          const bandBg = laneIdx % 2 === 0 ? 'bg-primary-50/50' : 'bg-white';
          const labelBg = laneIdx % 2 === 0 ? 'bg-primary-100/70' : 'bg-gray-50';
          return (
            <div key={`ln-row-${lane.id}`}>
              <div
                className={cn('absolute border-b-2 border-primary-200', bandBg)}
                style={{
                  top: ly.y,
                  left: 0,
                  width: layout.width,
                  height: ly.h,
                }}
              />
              <div
                className={cn(
                  'absolute left-0 border-r-2 border-primary-300 px-2 flex flex-col justify-center group',
                  labelBg
                )}
                style={{ top: ly.y, width: LANE_LABEL_W, height: ly.h }}
              >
                <span aria-hidden className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
                <div className="ml-2 flex items-center gap-1">
                  <input
                    type="text"
                    value={lane.name}
                    onChange={(e) => onRenameLane(lane.id, e.target.value)}
                    className="bg-transparent text-sm font-bold text-primary-900 focus:outline-none flex-1 min-w-0 no-print-border"
                  />
                  {diagram.lanes.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`担当「${lane.name}」とそのステップを削除しますか？`))
                          onDeleteLane(lane.id);
                      }}
                      className="text-xs text-gray-400 hover:text-red-500 px-1 opacity-0 group-hover:opacity-100 no-print flex-shrink-0"
                      aria-label="担当を削除"
                    >
                      ×
                    </button>
                  ) : null}
                </div>
                <div className="ml-2 mt-1 flex items-center gap-1 text-[10px] text-gray-500 no-print">
                  <span>¥</span>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={lane.rateYenPerHour || ''}
                    onChange={(e) =>
                      onUpdateLaneRate(lane.id, Math.max(0, Number(e.target.value) || 0))
                    }
                    className="w-14 bg-white border border-gray-200 rounded px-1 py-0.5 text-[10px] focus:outline-none focus:border-primary-400"
                    placeholder="3000"
                    title="この担当の時給（円/時）。コスト計算に使用"
                  />
                  <span>/時</span>
                </div>
              </div>
            </div>
          );
        })}

        {diagram.phases.map((phase) => {
          const px = layout.phaseX.get(phase.id);
          if (!px) return null;
          return (
            <div
              key={`pdiv-${phase.id}`}
              className="absolute border-r border-dashed border-gray-200 pointer-events-none"
              style={{ left: px.x + px.w, top: HEADER_H, height: layout.height - HEADER_H }}
            />
          );
        })}

        {/* セルごとのドロップターゲット + 空セルの「＋追加」ボタン */}
        {diagram.phases.map((phase) =>
          diagram.lanes.map((lane) => {
            const px = layout.phaseX.get(phase.id);
            const ly = layout.laneY.get(lane.id);
            if (!px || !ly) return null;
            const hasStep = diagram.steps.some(
              (s) => s.phaseId === phase.id && s.laneId === lane.id
            );
            return (
              <div
                key={`cell-${phase.id}-${lane.id}`}
                className="absolute"
                style={{ left: px.x, top: ly.y, width: px.w, height: ly.h }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  e.currentTarget.classList.add('bg-secondary-50/60');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('bg-secondary-50/60');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('bg-secondary-50/60');
                  const id = e.dataTransfer.getData('text/x-flow-step-id');
                  if (id) onMoveStep(id, lane.id, phase.id);
                }}
              >
                {!hasStep ? (
                  <button
                    type="button"
                    onClick={() => onAddStep(lane.id, phase.id)}
                    className="absolute text-xs text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors no-print"
                    style={{
                      left: PHASE_PAD_X,
                      top: LANE_PAD_Y,
                      width: CARD_W,
                      height: CARD_H,
                      border: '1.5px dashed #cbd5e1',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3D4DB7';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                  >
                    ＋ ここに追加
                  </button>
                ) : null}
              </div>
            );
          })
        )}

        <svg
          className="absolute inset-0 pointer-events-none"
          width={layout.width}
          height={layout.height}
          style={{ overflow: 'visible' }}
        >
          <title>フローの矢印</title>
          <defs>
            <marker
              id="fm-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="#64748b" />
            </marker>
            <marker
              id="fm-arrow-strong"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="#3D4DB7" />
            </marker>
          </defs>
          {arrows.map((a) => (
            <path
              key={a.key}
              d={a.d}
              fill="none"
              stroke={a.emphasized ? '#3D4DB7' : '#64748b'}
              strokeWidth={a.emphasized ? 2 : 1.5}
              markerEnd={a.emphasized ? 'url(#fm-arrow-strong)' : 'url(#fm-arrow)'}
            />
          ))}
        </svg>

        {diagram.steps.map((step) => {
          const box = layout.step.get(step.id);
          if (!box) return null;
          return (
            <StepCard
              key={step.id}
              step={step}
              box={box}
              selected={editingId === step.id}
              connectMode={connectMode}
              isConnectFrom={connectFromId === step.id}
              onSelect={() => onSelect(step.id)}
              onRename={(label) => onRenameStep(step.id, label)}
              onStartConnect={() => onStartConnect(step.id)}
              onDelete={() => onDeleteStep(step.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
