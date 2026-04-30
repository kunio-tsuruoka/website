import { cn } from '@/lib/utils';
import type { FlowDiagram, FlowLane, FlowStep, View } from '../types';
import { EmptyEditor } from './EmptyEditor';
import { StepEditor } from './StepEditor';

// lg+: 右側カラムとして常駐（step が無ければ EmptyEditor）
// <lg: editingStep があれば下から固定ドロワーとして出す
// 旧実装は <StepEditor> を 2 回マウントしていたが、内部 state（ScenarioPicker の active 等）が
// 二重に持たれて画面サイズ切替で飛ぶので、StepEditor は常に 1 つだけマウントし、
// ラッパ要素のクラスで lg/<lg を切り替える。
export function StepEditorDrawer({
  step,
  diagram,
  view,
  asIsStep,
  asIsLanes,
  fullscreen,
  onChange,
  onDelete,
  onClose,
  onAddStep,
}: {
  step: FlowStep | null;
  diagram: FlowDiagram;
  view: View;
  asIsStep: FlowStep | null;
  asIsLanes: FlowLane[] | null;
  fullscreen: boolean;
  onChange: (patch: Partial<FlowStep>) => void;
  onDelete: () => void;
  onClose: () => void;
  onAddStep: () => void;
}) {
  if (!step) {
    // lg+ では EmptyEditor。<lg では何も出さない（既存挙動）
    return (
      <div
        className={cn(
          'hidden lg:block border-t lg:border-t-0 lg:border-l border-gray-200 bg-gray-50 no-print',
          fullscreen && 'overflow-y-auto'
        )}
      >
        <EmptyEditor onAddStep={onAddStep} />
      </div>
    );
  }
  return (
    <>
      {/* <lg ボトムドロワー用の半透明オーバーレイ。lg+ では非表示 */}
      <button
        type="button"
        aria-label="編集パネルを閉じる"
        onClick={onClose}
        className="fixed inset-0 z-30 bg-black/30 lg:hidden no-print"
      />
      {/*
        StepEditor は 1 回だけマウント。
        - lg+: 右カラムに溶け込む通常ブロック
        - <lg: 画面下に固定したドロワー
        条件分岐 className 切替だけで両方の見た目を表現する。
       */}
      <div
        className={cn(
          'bg-gray-50 no-print',
          // lg+ レイアウト
          'lg:static lg:inset-auto lg:z-auto lg:rounded-none lg:bg-gray-50 lg:shadow-none lg:border-t-0 lg:border-l lg:border-gray-200',
          fullscreen && 'lg:overflow-y-auto',
          // <lg ボトムドロワー
          'fixed inset-x-0 bottom-0 z-40 max-h-[85vh] overflow-y-auto bg-white shadow-2xl border-t border-gray-200 rounded-t-2xl'
        )}
      >
        <StepEditor
          key={step.id}
          step={step}
          diagram={diagram}
          view={view}
          asIsStep={asIsStep}
          asIsLanes={asIsLanes}
          onChange={onChange}
          onDelete={onDelete}
          onClose={onClose}
        />
      </div>
    </>
  );
}
