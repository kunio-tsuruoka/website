import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { STEP_TYPE_LABEL, STEP_TYPE_STYLE } from '../constants';
import type { FlowStep, LayoutBox, StepType } from '../types';
import { fmtMin } from '../utils/format';
import { StepIcon } from './StepIcon';

function shapeOf(type: StepType): 'rect' | 'diamond' | 'circle' {
  if (type === 'decision') return 'diamond';
  if (type === 'start' || type === 'end') return 'circle';
  return 'rect';
}

// hover ブリッジ。group div の ::before 疑似要素でカードの周囲 16px を
// 透明な hover 領域で覆う (`before:-inset-4`)。これによりカード→外側の
// `+`/`×` ボタンへカーソルを移すあいだに `group-hover` が途切れない。
// 本体カードの位置は変えないので矢印描画 (computeLayout の box) と完全に整合する。
const HOVER_BRIDGE_CLASS = "before:absolute before:content-[''] before:-inset-4";

export function StepCard({
  step,
  box,
  selected,
  connectMode,
  isConnectFrom,
  onSelect,
  onRename,
  onStartConnect,
  onDelete,
  onSwap,
}: {
  step: FlowStep;
  box: LayoutBox;
  selected: boolean;
  connectMode: boolean;
  isConnectFrom: boolean;
  onSelect: () => void;
  onRename: (label: string) => void;
  onStartConnect: () => void;
  onDelete: () => void;
  onSwap: (otherStepId: string) => void;
}) {
  // 別カードの上にドラッグ中のステップが乗ったときに発火する drop ハンドラ。
  // セル側にも drop があるので、ここで stopPropagation して二重発火を防ぐ。
  const handleCardDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const otherId = e.dataTransfer.getData('text/x-flow-step-id');
    if (!otherId || otherId === step.id) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('ring-4', 'ring-secondary-400', 'ring-offset-2');
    onSwap(otherId);
  };
  const handleCardDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer.types.includes('text/x-flow-step-id')) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('ring-4', 'ring-secondary-400', 'ring-offset-2');
  };
  const handleCardDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('ring-4', 'ring-secondary-400', 'ring-offset-2');
  };
  const [editing, setEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(step.label);
  const inputRef = useRef<HTMLInputElement>(null);
  const shape = shapeOf(step.type);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // 真円 (start/end): 中央に小円、ラベルは右側
  if (shape === 'circle') {
    const CIRCLE_SIZE = 56;
    return (
      <div
        className={cn('absolute group rounded-lg', HOVER_BRIDGE_CLASS)}
        style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
        onDragOver={handleCardDragOver}
        onDragLeave={handleCardDragLeave}
        onDrop={handleCardDrop}
      >
        <button
          type="button"
          draggable={!connectMode && !editing}
          onDragStart={(e) => {
            e.dataTransfer.setData('text/x-flow-step-id', step.id);
            e.dataTransfer.effectAllowed = 'move';
          }}
          onClick={onSelect}
          onDoubleClick={(e) => {
            if (connectMode) return;
            e.stopPropagation();
            setDraftLabel(step.label);
            setEditing(true);
          }}
          className={cn(
            'absolute inset-0 flex items-center justify-start gap-2 px-2 focus:outline-none',
            !connectMode && 'cursor-pointer',
            connectMode &&
              (isConnectFrom
                ? 'ring-4 ring-secondary-400 rounded-lg'
                : 'hover:ring-2 hover:ring-secondary-400 rounded-lg'),
            selected && !connectMode && 'ring-2 ring-primary-500 ring-offset-1 rounded-lg z-10'
          )}
        >
          <span
            className={cn(
              'flex items-center justify-center transition-shadow rounded-full shadow-sm hover:shadow-md',
              STEP_TYPE_STYLE[step.type],
              step.type === 'end' ? 'border-[3px]' : 'border-2'
            )}
            style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE, flex: '0 0 auto' }}
          >
            <StepIcon type={step.type} className="w-5 h-5" />
          </span>
          <span className="flex-1 min-w-0 text-left">
            {editing ? (
              <input
                ref={inputRef}
                type="text"
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onBlur={() => {
                  onRename(draftLabel.trim() || step.label);
                  setEditing(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onRename(draftLabel.trim() || step.label);
                    setEditing(false);
                  }
                  if (e.key === 'Escape') setEditing(false);
                }}
                className="w-full text-xs font-semibold bg-white/90 border border-primary-400 rounded px-1 py-0.5 focus:outline-none"
              />
            ) : (
              <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">
                {step.label}
              </p>
            )}
          </span>
        </button>
        {!connectMode && !editing ? (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStartConnect();
              }}
              aria-label="このステップから矢印を引く"
              title="このステップから矢印を引く"
              className="no-print absolute -right-7 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-secondary-500 text-white text-xs font-bold shadow-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hover:bg-secondary-600 z-20 transition-opacity flex items-center justify-center"
            >
              +
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`「${step.label}」を削除しますか？`)) onDelete();
              }}
              aria-label="このステップを削除"
              title="このステップを削除"
              className="no-print absolute -right-5 -top-5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none shadow-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hover:bg-red-600 z-20 transition-opacity flex items-center justify-center"
            >
              ×
            </button>
          </>
        ) : null}
      </div>
    );
  }

  const shapeClass = shape === 'diamond' ? 'border-0' : 'rounded-lg border-2 shadow-sm';

  const containerClass = cn(
    'absolute text-left transition-all focus:outline-none',
    shape !== 'diamond' && STEP_TYPE_STYLE[step.type],
    shape !== 'diamond' && shapeClass,
    !connectMode && 'cursor-pointer hover:shadow-md',
    connectMode &&
      (isConnectFrom ? 'ring-4 ring-secondary-400' : 'hover:ring-2 hover:ring-secondary-400'),
    selected && !connectMode && 'ring-2 ring-primary-500 ring-offset-1 z-10'
  );

  return (
    <div
      className={cn('absolute group', HOVER_BRIDGE_CLASS)}
      style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
    >
      {/* diamond は背景レイヤで菱形を描き、クリックは上のボタンが受ける */}
      {shape === 'diamond' ? (
        <div
          className={cn('absolute inset-0', STEP_TYPE_STYLE[step.type], 'border-2')}
          style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
        />
      ) : null}

      <button
        type="button"
        draggable={!connectMode && !editing}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/x-flow-step-id', step.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onClick={onSelect}
        onDoubleClick={(e) => {
          if (connectMode) return;
          e.stopPropagation();
          setDraftLabel(step.label);
          setEditing(true);
        }}
        className={cn(containerClass, 'w-full h-full text-left')}
      >
        <div
          className={cn(
            'h-full flex flex-col',
            shape === 'diamond'
              ? 'items-center justify-center text-center px-8 py-2'
              : 'px-2 py-1.5'
          )}
        >
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold rounded bg-white/80 border border-current/30">
              <StepIcon type={step.type} className="w-3 h-3" />
              {STEP_TYPE_LABEL[step.type]}
            </span>
            <span
              role="presentation"
              onDoubleClick={(e) => e.stopPropagation()}
              title="クリックで詳細編集パネルが開きます（所要時間・担当・課題など）"
              className="text-[9px] text-gray-500 hover:text-primary-700 rounded px-1 transition-colors"
            >
              {step.durationMin > 0 ? fmtMin(step.durationMin) : '時間を設定'}
            </span>
          </div>
          {editing ? (
            <input
              ref={inputRef}
              type="text"
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onBlur={() => {
                onRename(draftLabel.trim() || step.label);
                setEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onRename(draftLabel.trim() || step.label);
                  setEditing(false);
                }
                if (e.key === 'Escape') {
                  setEditing(false);
                }
              }}
              className="w-full mt-1 text-xs font-semibold bg-white/90 border border-primary-400 rounded px-1 py-0.5 focus:outline-none"
            />
          ) : (
            <p className="text-xs font-semibold leading-tight mt-1 line-clamp-2">{step.label}</p>
          )}
          {shape !== 'diamond' ? (
            <div className="mt-auto text-[9px] text-gray-500 truncate">
              {step.tool ? `ツール: ${step.tool}` : ''}
              {step.pain ? <span className="text-red-700"> 課題: {step.pain}</span> : null}
              {step.improvement ? (
                <span className="text-emerald-700"> 改善: {step.improvement}</span>
              ) : null}
            </div>
          ) : null}
        </div>
      </button>

      {!connectMode && !editing ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartConnect();
            }}
            aria-label="このステップから矢印を引く"
            title="このステップから矢印を引く"
            className="no-print absolute -right-7 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-secondary-500 text-white text-xs font-bold shadow-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hover:bg-secondary-600 z-20 transition-opacity flex items-center justify-center"
          >
            +
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`「${step.label}」を削除しますか？`)) onDelete();
            }}
            aria-label="このステップを削除"
            title="このステップを削除"
            className="no-print absolute -right-5 -top-5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none shadow-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hover:bg-red-600 z-20 transition-opacity flex items-center justify-center"
          >
            ×
          </button>
        </>
      ) : null}
    </div>
  );
}
