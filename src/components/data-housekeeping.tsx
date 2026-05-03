import {
  type ToolSnapshot,
  clearAllTools,
  clearTool,
  formatBytes,
  formatSavedAt,
  isStale,
  listToolSnapshots,
} from '@/lib/tool-storage';
import { useEffect, useState } from 'react';

export function DataHousekeeping() {
  const [snapshots, setSnapshots] = useState<ToolSnapshot[]>([]);
  const [open, setOpen] = useState(false);

  function refresh() {
    setSnapshots(listToolSnapshots());
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: マウント時1回のみ
  useEffect(() => {
    refresh();
  }, []);

  const totalBytes = snapshots.reduce((sum, s) => sum + s.byteLength, 0);
  const hasAny = snapshots.some((s) => s.hasData);
  const staleCount = snapshots.filter((s) => isStale(s.savedAt)).length;

  return (
    <section className="bg-white rounded-2xl shadow-soft border border-gray-200 p-5 md:p-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 text-left min-h-[44px]"
        aria-expanded={open}
      >
        <div>
          <h2 className="text-base font-bold text-gray-900">保存データの管理</h2>
          <p className="text-xs text-gray-500 mt-1">
            {hasAny
              ? `この端末に ${snapshots.filter((s) => s.hasData).length} 件のデータ・合計 ${formatBytes(totalBytes)} を保存中`
              : 'この端末には保存データがありません'}
            {staleCount > 0 && ` ・ 古いデータ ${staleCount} 件`}
          </p>
        </div>
        <span className="text-xs text-primary-500 font-semibold flex-shrink-0">
          {open ? '閉じる ▴' : '詳細 ▾'}
        </span>
      </button>

      {open && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            ツールに入力した内容はこの端末（ブラウザ）の中だけに保存されています。
            必要なくなったら下のボタンで削除できます。サーバーには何も送信されていません。
          </p>
          <ul className="space-y-2">
            {snapshots.map((s) => {
              const stale = isStale(s.savedAt);
              return (
                <li
                  key={s.tool}
                  className={`p-3 rounded-lg border ${
                    s.hasData
                      ? stale
                        ? 'border-amber-300 bg-amber-50/50'
                        : 'border-gray-200 bg-white'
                      : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm text-gray-900">{s.label}</strong>
                        {s.hasData && stale && (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-200 text-amber-900 rounded">
                            90日以上前
                          </span>
                        )}
                        {!s.hasData && (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-200 text-gray-600 rounded">
                            未保存
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {s.hasData
                          ? `${formatSavedAt(s.savedAt)} ・ ${formatBytes(s.byteLength)}`
                          : 'まだこのツールを使ったデータはありません'}
                      </p>
                    </div>
                    {s.hasData && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              `「${s.label}」の保存データを削除します。元に戻せません。続けますか？`
                            )
                          ) {
                            clearTool(s.tool);
                            refresh();
                          }
                        }}
                        className="px-3 py-2 min-h-[44px] text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 flex-shrink-0"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {hasAny && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      'この端末に保存されているすべてのツールデータを削除します。元に戻せません。続けますか？'
                    )
                  ) {
                    clearAllTools();
                    refresh();
                  }
                }}
                className="px-4 py-2 min-h-[44px] text-xs font-semibold text-red-700 bg-white border-2 border-red-200 rounded-md hover:bg-red-50"
              >
                すべての保存データを削除
              </button>
            </div>
          )}

          {staleCount > 0 && (
            <p className="mt-3 text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-md p-3 leading-relaxed">
              90日以上前のデータが {staleCount}{' '}
              件あります。使わないものは削除しておくと、別プロジェクトを始める時に混乱しません。
            </p>
          )}
        </div>
      )}
    </section>
  );
}
