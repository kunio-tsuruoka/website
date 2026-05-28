import { useHearingStore } from '../store';

export function ProgressBar() {
  const progress = useHearingStore((s) => s.progress);
  const percent = Math.round(progress.ratio * 100);
  return (
    <div className="px-4 py-3 bg-primary-50 border-b border-primary-100">
      <div className="flex items-center justify-between text-xs text-primary-700 font-medium mb-1.5">
        <span>ヒアリング進捗</span>
        <span>
          {progress.filled} / {progress.total} 項目
        </span>
      </div>
      <div className="w-full h-2 bg-white rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 transition-all duration-300"
          style={{ width: `${Math.max(percent, 5)}%` }}
        />
      </div>
    </div>
  );
}
