import { cn } from '@/lib/utils';
import type { FlowDiagram, FlowStep, View } from '../types';
import { EmptyEditor } from './EmptyEditor';
import { StepEditor } from './StepEditor';

// lg+: 右側カラム（既存挙動）
// <lg: editingStep があれば下から固定ドロワー、なければ何も出さない（EmptyEditor は <lg では非表示）
export function StepEditorDrawer({
  step,
  diagram,
  view,
  fullscreen,
  onChange,
  onDelete,
  onClose,
  onAddStep,
}: {
  step: FlowStep | null;
  diagram: FlowDiagram;
  view: View;
  fullscreen: boolean;
  onChange: (patch: Partial<FlowStep>) => void;
  onDelete: () => void;
  onClose: () => void;
  onAddStep: () => void;
}) {
  return (
    <>
      {/* lg+ サイドカラム（既存レイアウト） */}
      <div
        className={cn(
          'hidden lg:block border-t lg:border-t-0 lg:border-l border-gray-200 bg-gray-50 no-print',
          fullscreen && 'overflow-y-auto'
        )}
      >
        {step ? (
          <StepEditor
            key={step.id}
            step={step}
            diagram={diagram}
            view={view}
            onChange={onChange}
            onDelete={onDelete}
            onClose={onClose}
          />
        ) : (
          <EmptyEditor onAddStep={onAddStep} />
        )}
      </div>

      {/* <lg ボトムドロワー: ステップ選択時のみ */}
      {step ? (
        <>
          <button
            type="button"
            aria-label="編集パネルを閉じる"
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/30 lg:hidden no-print"
          />
          <div className="fixed inset-x-0 bottom-0 z-40 max-h-[85vh] overflow-y-auto bg-white shadow-2xl border-t border-gray-200 rounded-t-2xl lg:hidden no-print">
            <StepEditor
              key={step.id}
              step={step}
              diagram={diagram}
              view={view}
              onChange={onChange}
              onDelete={onDelete}
              onClose={onClose}
            />
          </div>
        </>
      ) : null}
    </>
  );
}
