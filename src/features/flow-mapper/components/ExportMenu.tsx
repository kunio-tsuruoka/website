import { buildShareUrl } from '@/lib/share-url';
import { type ChangeEvent, useState } from 'react';
import { STORAGE_KEY } from '../constants';
import { useFlowStore } from '../store';
import type { State, View } from '../types';
import { downloadFile, exportMarkdown } from '../utils/markdown';
import { diagramToMermaid } from '../utils/mermaid';
import { diagramToSvg, svgToPng } from '../utils/svg';

export function ExportMenu({
  state,
  view,
  onExport,
}: { state: State; view: View; onExport?: (format: string) => void }) {
  const [open, setOpen] = useState(false);
  const importStateFromJson = useFlowStore((s) => s.importStateFromJson);
  const ts = new Date().toISOString().slice(0, 10);
  const currentDiagram = view === 'toBe' ? state.toBe : state.asIs;
  const currentLabel = view === 'toBe' ? 'To-Be' : 'As-Is';

  function exportJson() {
    downloadFile(`flow-mapper-${ts}.json`, JSON.stringify(state, null, 2), 'application/json');
    onExport?.('json');
    setOpen(false);
  }

  function exportMd() {
    downloadFile(`flow-mapper-${ts}.md`, exportMarkdown(state), 'text/markdown');
    onExport?.('markdown');
    setOpen(false);
  }

  function exportSvg() {
    const svg = diagramToSvg(currentDiagram, currentLabel);
    downloadFile(`flow-mapper-${currentLabel}-${ts}.svg`, svg, 'image/svg+xml');
    onExport?.('svg');
    setOpen(false);
  }

  function exportMermaid() {
    const mmd = diagramToMermaid(currentDiagram, currentLabel);
    downloadFile(`flow-mapper-${currentLabel}-${ts}.mmd`, mmd, 'text/plain');
    onExport?.('mermaid');
    setOpen(false);
  }

  async function exportPng() {
    try {
      const svg = diagramToSvg(currentDiagram, currentLabel);
      const blob = await svgToPng(svg, 2);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flow-mapper-${currentLabel}-${ts}.png`;
      a.click();
      URL.revokeObjectURL(url);
      onExport?.('png');
    } catch (err) {
      alert(`PNG変換に失敗しました: ${err instanceof Error ? err.message : String(err)}`);
    }
    setOpen(false);
  }

  function importJson(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as State;
        if (!parsed?.asIs?.lanes || !parsed?.toBe?.lanes || !parsed?.asIs?.phases) {
          throw new Error('invalid');
        }
        // persist 経由で再保存させるため、いったん store を更新
        importStateFromJson(parsed);
        // store の persist と整合させるため localStorage も明示更新
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: parsed, version: 0 }));
      } catch {
        alert('JSONの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
    setOpen(false);
  }

  function printView() {
    window.print();
    onExport?.('print');
    setOpen(false);
  }

  async function copyShareUrl() {
    const { url, tooLong } = buildShareUrl('/tools/flow-mapper', state);
    if (tooLong) {
      const ok = confirm(
        '共有URLが長くなっています。一部ブラウザで開けない可能性がありますが続行しますか？'
      );
      if (!ok) {
        setOpen(false);
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      alert('共有URLをコピーしました。送付先に貼り付けてください。');
      onExport?.('share-url');
    } catch {
      alert('クリップボードへのコピーに失敗しました。');
    }
    setOpen(false);
  }

  const isCompareView = view === 'compare';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 text-xs font-medium text-white bg-primary-500 border border-primary-600 rounded-lg hover:bg-primary-600"
      >
        エクスポート ▾
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="閉じる"
            className="fixed inset-0 z-10 bg-transparent"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-medium z-20 overflow-hidden">
            <button
              type="button"
              onClick={exportPng}
              disabled={isCompareView}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-white"
            >
              PNG画像でダウンロード（{currentLabel}）
            </button>
            <button
              type="button"
              onClick={exportSvg}
              disabled={isCompareView}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-t border-gray-100 disabled:text-gray-300 disabled:hover:bg-white"
            >
              SVG画像でダウンロード（{currentLabel}）
            </button>
            <button
              type="button"
              onClick={exportMermaid}
              disabled={isCompareView}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-t border-gray-100 disabled:text-gray-300 disabled:hover:bg-white"
            >
              Mermaid（.mmd）でダウンロード（{currentLabel}）
            </button>
            <button
              type="button"
              onClick={exportMd}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-t border-gray-100"
            >
              Markdownでダウンロード（全体）
            </button>
            <button
              type="button"
              onClick={exportJson}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-t border-gray-100"
            >
              JSONでダウンロード（再読込可）
            </button>
            <label
              htmlFor="flow-mapper-import"
              className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-t border-gray-100 cursor-pointer"
            >
              JSONを読み込む
            </label>
            <input
              id="flow-mapper-import"
              type="file"
              accept="application/json"
              className="hidden"
              onChange={importJson}
            />
            <button
              type="button"
              onClick={printView}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-t border-gray-100"
            >
              印刷／PDF保存
            </button>
            <button
              type="button"
              onClick={copyShareUrl}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-t border-gray-100"
            >
              共有URLをコピー（読み取り用）
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
