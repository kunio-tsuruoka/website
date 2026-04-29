import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { TEMPLATES } from '../constants';
import type { FlowTemplate } from '../constants';

// EMPTY 状態のときに表示する初期選択モーダル。
// テンプレ流し込み / 白紙 / サンプル の 3 アクションを提示する。
export function TemplatePicker({
  onPickTemplate,
  onLoadSample,
  onStartBlank,
  onClose,
}: {
  onPickTemplate: (template: FlowTemplate) => void;
  onLoadSample: () => void;
  onStartBlank: () => void;
  onClose: () => void;
}) {
  // ESC で閉じる（白紙開始と同等）
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 no-print"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      // biome-ignore lint/a11y/useSemanticElements: 背景クリックで閉じるカスタムオーバーレイ。<dialog> は固定位置やバックドロップ挙動が制御しづらい
      role="dialog"
      aria-modal="true"
      aria-label="フローのテンプレートを選択"
    >
      <div
        className="bg-white rounded-2xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-bold text-gray-900">どのフローから始めますか？</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              テンプレートを選ぶと現状フローに流し込まれます。後から自由に編集できます。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-sm px-2 py-1 rounded hover:bg-gray-100"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-sm font-bold text-primary-900 mb-3">
              業種別テンプレートから始める
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    onPickTemplate(tpl);
                  }}
                  className={cn(
                    'text-left bg-white border-2 border-gray-200 rounded-xl p-4',
                    'hover:border-primary-400 hover:bg-primary-50/40 hover:shadow-medium',
                    'transition-all focus:outline-none focus:ring-2 focus:ring-primary-400'
                  )}
                >
                  <div className="text-sm font-bold text-gray-900 mb-1">{tpl.name}</div>
                  <div className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-2">
                    {tpl.description}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <span className="px-1.5 py-0.5 rounded bg-gray-100">
                      {tpl.diagram.steps.length} ステップ
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-gray-100">
                      {tpl.diagram.lanes.length} 担当
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-gray-100">
                      {tpl.diagram.phases.length} フェーズ
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-gray-700 mb-3">その他</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onLoadSample}
                className={cn(
                  'text-left bg-white border-2 border-secondary-200 rounded-xl p-4',
                  'hover:border-secondary-400 hover:bg-secondary-50/40 hover:shadow-medium',
                  'transition-all focus:outline-none focus:ring-2 focus:ring-secondary-400'
                )}
              >
                <div className="text-sm font-bold text-secondary-900 mb-1">
                  As-Is + To-Be のサンプルを見る
                </div>
                <div className="text-xs text-gray-600 leading-relaxed">
                  受注〜出荷業務の現状フローと改善後フローの両方を読み込みます。比較タブの動作も確認できます。
                </div>
              </button>
              <button
                type="button"
                onClick={onStartBlank}
                className={cn(
                  'text-left bg-white border-2 border-gray-200 rounded-xl p-4',
                  'hover:border-gray-400 hover:bg-gray-50 hover:shadow-medium',
                  'transition-all focus:outline-none focus:ring-2 focus:ring-gray-400'
                )}
              >
                <div className="text-sm font-bold text-gray-900 mb-1">白紙から始める</div>
                <div className="text-xs text-gray-600 leading-relaxed">
                  空のキャンバスから自分でステップを組み立てます。操作ガイドが表示されます。
                </div>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
