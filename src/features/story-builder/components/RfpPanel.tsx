import { type StorySpec, formatRfpMarkdown, storyCountSummary } from '@/lib/story-spec';
import { useState } from 'react';

export function RfpPanel({
  spec,
  onDownload,
  onCopy,
  onSendScope,
  onCopyShare,
}: {
  spec: StorySpec;
  onDownload: () => void;
  onCopy: () => void;
  onSendScope: () => void;
  onCopyShare: () => void;
}) {
  const [open, setOpen] = useState(false);
  const counts = storyCountSummary(spec);
  const markdown = formatRfpMarkdown(spec);

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-neutral-200 bg-white p-5 md:p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{spec.title}</h3>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          現状と目指す姿、ユーザーストーリー {counts.stories} 件、シナリオ {counts.scenarios}{' '}
          件を、開発会社に渡せるRFPの章立てにまとめました。
        </p>
        <ul className="text-sm text-gray-700 space-y-1 mb-5">
          <li>・ 背景 / 現状（As-Is） / 目指す姿（To-Be）</li>
          <li>・ ユーザーストーリーと、前提・操作・結果のシナリオ</li>
          <li>・ 非機能、制約、提案してほしい事項</li>
        </ul>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onDownload}
            className="min-h-[44px] px-4 py-2 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-600"
          >
            RFPをダウンロード
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="min-h-[44px] px-4 py-2 text-sm font-semibold text-primary-700 border border-primary-300 rounded-md hover:bg-primary-50"
          >
            クリップボードにコピー
          </button>
          <button
            type="button"
            onClick={onSendScope}
            className="min-h-[44px] px-4 py-2 text-sm font-semibold text-secondary-800 bg-secondary-50 border border-secondary-300 rounded-md hover:bg-secondary-100"
          >
            スコープ管理に送る
          </button>
          <button
            type="button"
            onClick={onCopyShare}
            className="min-h-[44px] px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            共有URLをコピー
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 md:p-6">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="min-h-[44px] text-sm font-semibold text-gray-800"
        >
          {open ? 'プレビューを閉じる' : 'Markdownプレビューを見る'}
        </button>
        {open && (
          <pre className="mt-3 max-h-[420px] overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs leading-relaxed whitespace-pre-wrap text-gray-800">
            {markdown}
          </pre>
        )}
      </section>
    </div>
  );
}
