import { trackToolEvent } from '@/lib/analytics';
import { EMPTY_INPUTS, type RfpInputs, buildRfpMarkdown } from '@/lib/build-rfp-draft';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'beekle-rfp-builder-v1';

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function RfpBuilder() {
  const [inputs, setInputs] = useState<RfpInputs>(EMPTY_INPUTS);
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as RfpInputs;
        setInputs({ ...EMPTY_INPUTS, ...parsed });
      }
    } catch {
      /* ignore */
    }
    trackToolEvent('tool_start', { tool: 'flow-mapper', meta: { variant: 'rfp-builder' } });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    } catch {
      /* ignore */
    }
  }, [inputs]);

  const update =
    (k: keyof RfpInputs) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setInputs((p) => ({ ...p, [k]: e.target.value }));

  function regenerate() {
    const md = buildRfpMarkdown(inputs);
    setPreview(md);
    trackToolEvent('tool_save', { tool: 'flow-mapper', meta: { variant: 'rfp-builder' } });
  }

  function download() {
    const md = preview || buildRfpMarkdown(inputs);
    downloadFile(`rfp-draft-${new Date().toISOString().slice(0, 10)}.md`, md, 'text/markdown');
    trackToolEvent('tool_export', { tool: 'flow-mapper', meta: { format: 'rfp-markdown' } });
  }

  function copyToClipboard() {
    const md = preview || buildRfpMarkdown(inputs);
    navigator.clipboard.writeText(md);
    trackToolEvent('tool_export', { tool: 'flow-mapper', meta: { format: 'rfp-clipboard' } });
  }

  const inputCls =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300';

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">1. プロジェクトの基本情報を入力</h2>
        <p className="text-sm text-gray-600 mb-4">
          発注先に渡す RFP
          の冒頭に入る情報です。すべて任意ですが、埋めるほど開発会社の見積もり精度が上がります。
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-semibold text-gray-700">プロジェクト名</span>
            <input
              type="text"
              value={inputs.projectName}
              onChange={update('projectName')}
              placeholder="例: 経費精算システム刷新"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-700">希望開始時期</span>
            <input
              type="text"
              value={inputs.desiredStartDate}
              onChange={update('desiredStartDate')}
              placeholder="例: 2026年Q3 / 2026年7月以降など"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-700">想定予算レンジ</span>
            <input
              type="text"
              value={inputs.budgetRange}
              onChange={update('budgetRange')}
              placeholder="例: 500〜800万円"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-700">会社名</span>
            <input
              type="text"
              value={inputs.contactCompany}
              onChange={update('contactCompany')}
              placeholder="例: 株式会社○○"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-700">発注担当者氏名</span>
            <input
              type="text"
              value={inputs.contactName}
              onChange={update('contactName')}
              placeholder="例: 鶴岡 太郎"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-700">連絡先メール</span>
            <input
              type="email"
              value={inputs.contactEmail}
              onChange={update('contactEmail')}
              placeholder="例: tanaka@example.co.jp"
              className={inputCls}
            />
          </label>
        </div>
        <label className="block mt-4">
          <span className="text-xs font-semibold text-gray-700">
            背景（なぜシステム刷新／導入が必要か）
          </span>
          <textarea
            value={inputs.background}
            onChange={update('background')}
            rows={3}
            placeholder="例: 紙の経費精算で月20時間ロスしている。リモート勤務で承認が滞る..."
            className={inputCls}
          />
        </label>
        <label className="block mt-4">
          <span className="text-xs font-semibold text-gray-700">達成したいゴール</span>
          <textarea
            value={inputs.goals}
            onChange={update('goals')}
            rows={3}
            placeholder="例: 経費申請のリードタイムを 3日 → 当日中に短縮。月次の手作業集計を撤廃..."
            className={inputCls}
          />
        </label>
      </section>

      <section className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">2. RFPドラフトを生成</h2>
        <p className="text-sm text-gray-600 mb-4">
          このボタンを押すと、業務フロー可視化ツール（現状／改善後）と
          スコープ管理ツール（要件と優先度）の保存内容を統合し、 RFP の章立てに合わせた Markdown
          を生成します。各ツールを先に使っておくと内容が自動で埋まります。
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={regenerate}
            className="px-5 py-3 min-h-[44px] text-sm font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-600 shadow-soft"
          >
            RFPドラフトを生成
          </button>
          <button
            type="button"
            onClick={download}
            disabled={!preview}
            className="px-4 py-3 min-h-[44px] text-sm font-semibold text-primary-700 bg-primary-50 border border-primary-300 rounded-lg hover:bg-primary-100 disabled:opacity-40"
          >
            Markdownをダウンロード
          </button>
          <button
            type="button"
            onClick={copyToClipboard}
            disabled={!preview}
            className="px-4 py-3 min-h-[44px] text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
          >
            クリップボードにコピー
          </button>
        </div>
        {preview && (
          <details open className="mt-4">
            <summary className="text-sm text-gray-600 cursor-pointer">プレビュー</summary>
            <pre className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-md text-xs overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
              {preview}
            </pre>
          </details>
        )}
      </section>

      <section className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-900 leading-relaxed">
        <strong>ヒント</strong>: 業務フローやスコープがまだ埋まっていない場合は、
        <a href="/tools/flow-mapper" className="underline mx-1">
          業務フロー可視化ツール
        </a>
        や
        <a href="/tools/scope-manager" className="underline mx-1">
          スコープ管理ツール
        </a>
        で先にデータを作ってから戻ってくると、より具体的な RFP ができ上がります。
      </section>
    </div>
  );
}
