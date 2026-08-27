import { type StorySpec, formatRfpMarkdown, storyCountSummary } from '@/lib/story-spec';
import { useState } from 'react';
import { Eyebrow, Sheet, SheetBody, ToolButton } from './sheet';

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
  const [open, setOpen] = useState(true);
  const counts = storyCountSummary(spec);
  const markdown = formatRfpMarkdown(spec);

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200">
      <Sheet accent="primary" className="rounded-none border-0 border-b">
        <SheetBody>
          <Eyebrow>04 RFP</Eyebrow>
          <h3 className="mb-3 text-2xl font-bold leading-snug text-accent-950">{spec.title}</h3>
          <p className="mb-6 text-sm leading-relaxed text-neutral-700">
            現状と目指す姿、ユーザーストーリー {counts.stories} 件、シナリオ {counts.scenarios}{' '}
            件を、開発会社に渡せるRFPの章立てにまとめました。
          </p>
          <ol className="mb-6 grid gap-0 border border-neutral-200 text-sm text-accent-950 md:grid-cols-3">
            <li className="border-b border-neutral-200 px-4 py-3 md:border-b-0 md:border-r">
              <span className="mr-2 font-Poppins text-xs text-primary-500">01</span>
              背景 / 現状 / 目指す姿
            </li>
            <li className="border-b border-neutral-200 px-4 py-3 md:border-b-0 md:border-r">
              <span className="mr-2 font-Poppins text-xs text-primary-500">02</span>
              ストーリーとシナリオ
            </li>
            <li className="px-4 py-3">
              <span className="mr-2 font-Poppins text-xs text-primary-500">03</span>
              非機能・制約・提案依頼
            </li>
          </ol>
          <div className="flex flex-wrap gap-2">
            <ToolButton variant="primary" onClick={onDownload}>
              RFPをダウンロード
            </ToolButton>
            <ToolButton onClick={onCopy}>クリップボードにコピー</ToolButton>
            <ToolButton onClick={onSendScope}>スコープ管理に送る</ToolButton>
            <ToolButton variant="ghost" onClick={onCopyShare}>
              共有URLをコピー
            </ToolButton>
          </div>
        </SheetBody>
      </Sheet>

      <section className="bg-white">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-2 md:px-7">
          <p className="font-Poppins text-[11px] font-semibold tracking-[0.16em] text-neutral-500">
            MARKDOWN
          </p>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="min-h-[44px] text-sm font-semibold text-primary-600"
          >
            {open ? 'プレビューを閉じる' : 'Markdownプレビューを見る'}
          </button>
        </div>
        {open && (
          <pre className="max-h-[480px] overflow-auto border-l-4 border-primary-500 bg-neutral-50 px-5 py-5 font-mono text-xs leading-relaxed text-accent-950 whitespace-pre-wrap md:px-7">
            {markdown}
          </pre>
        )}
      </section>
    </div>
  );
}
