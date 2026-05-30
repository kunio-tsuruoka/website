import type { StepType } from '@/features/flow-mapper/types';
import { useFlowInterviewStore } from '../store';

const TYPE_OPTIONS: { value: StepType; label: string }[] = [
  { value: 'start', label: '開始' },
  { value: 'task', label: '作業' },
  { value: 'decision', label: '分岐' },
  { value: 'system', label: 'システム' },
  { value: 'wait', label: '待ち' },
  { value: 'end', label: '完了' },
];

export function DiagramEditor({ onChange }: { onChange: () => void }) {
  const diagram = useFlowInterviewStore((s) => s.diagram);
  const setDiagramTitle = useFlowInterviewStore((s) => s.setDiagramTitle);
  const updateStepLabel = useFlowInterviewStore((s) => s.updateStepLabel);
  const setStepLane = useFlowInterviewStore((s) => s.setStepLane);
  const setStepType = useFlowInterviewStore((s) => s.setStepType);
  const deleteStep = useFlowInterviewStore((s) => s.deleteStep);
  const addStep = useFlowInterviewStore((s) => s.addStep);
  const addLane = useFlowInterviewStore((s) => s.addLane);
  const renameLane = useFlowInterviewStore((s) => s.renameLane);

  const edited = (fn: () => void) => {
    fn();
    onChange();
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="flow-title">
          業務名
        </label>
        <input
          id="flow-title"
          value={diagram.title}
          onChange={(e) => edited(() => setDiagramTitle(e.target.value))}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      {/* 担当（レーン）の編集 */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-600">担当（レーン）</span>
          <button
            type="button"
            onClick={() => edited(() => addLane())}
            className="text-xs px-2 py-1 rounded-full border border-gray-300 hover:border-primary-400 text-gray-700"
          >
            ＋担当を追加
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {diagram.lanes.map((l) => (
            <input
              key={l.id}
              value={l.name}
              aria-label="担当名"
              onChange={(e) => edited(() => renameLane(l.id, e.target.value))}
              className="px-2.5 py-1.5 text-xs rounded-full border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary w-28"
            />
          ))}
        </div>
      </div>

      {/* ステップ編集 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-600">作業ステップ（上から順番）</span>
          <button
            type="button"
            onClick={() => edited(() => addStep())}
            className="text-xs px-3 py-1.5 rounded-full bg-primary-500 hover:bg-primary-600 text-white font-medium"
          >
            ＋作業を追加
          </button>
        </div>
        <ol className="space-y-2">
          {diagram.steps.map((s, i) => (
            <li key={s.id} className="rounded-xl border border-gray-200 bg-white p-2.5">
              <div className="flex items-center gap-2">
                <span className="shrink-0 w-5 text-center text-xs text-gray-400">{i + 1}</span>
                <input
                  value={s.label}
                  aria-label="作業内容"
                  onChange={(e) => edited(() => updateStepLabel(s.id, e.target.value))}
                  className="flex-1 px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => edited(() => deleteStep(s.id))}
                  aria-label="この作業を削除"
                  title="削除"
                  className="shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <title>削除</title>
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="flex gap-2 mt-2 pl-7">
                <select
                  value={s.laneId}
                  aria-label="担当"
                  onChange={(e) => edited(() => setStepLane(s.id, e.target.value))}
                  className="text-xs px-2 py-1 rounded-lg border border-gray-300 bg-white"
                >
                  {diagram.lanes.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <select
                  value={s.type}
                  aria-label="種別"
                  onChange={(e) => edited(() => setStepType(s.id, e.target.value as StepType))}
                  className="text-xs px-2 py-1 rounded-lg border border-gray-300 bg-white"
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          ))}
        </ol>
        {diagram.steps.length === 0 && (
          <p className="text-xs text-gray-400 py-4 text-center">
            まだ作業がありません。会話で業務を説明するか「作業を追加」で手動で作れます。
          </p>
        )}
      </div>
    </div>
  );
}
