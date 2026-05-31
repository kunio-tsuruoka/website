import { trackCtaClick } from '@/lib/analytics';
import { writeContactPrefill } from '@/lib/contact-prefill';
import { useState } from 'react';
import { useFlowInterviewStore } from '../store';
import { buildContactMessage } from '../utils/contact-message';

export function RfpPanel({ onGenerate }: { onGenerate: () => void }) {
  const rfpLoading = useFlowInterviewStore((s) => s.rfpLoading);
  const rfpMarkdown = useFlowInterviewStore((s) => s.rfpMarkdown);
  const title = useFlowInterviewStore((s) => s.diagram.title);
  const hasSteps = useFlowInterviewStore((s) => s.diagram.steps.length > 0);
  const [copied, setCopied] = useState(false);

  if (!hasSteps) return null;

  const copy = async () => {
    if (!rfpMarkdown) return;
    try {
      await navigator.clipboard.writeText(rfpMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard 不可は無視 */
    }
  };

  const download = () => {
    if (!rfpMarkdown) return;
    const safe = (title || 'rfp').replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 40);
    const blob = new Blob([rfpMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RFP_${safe}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (!rfpMarkdown) {
    return (
      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-bold text-navy-950 mb-1">発注用のRFP下書きを作る</h3>
        <p className="text-xs text-gray-600 leading-relaxed mb-4">
          ここまでの内容から、ユーザーストーリー付きのRFP（提案依頼書）ドラフトを生成します。そのままベンダー比較や社内共有に使えます。
        </p>
        <button
          type="button"
          onClick={onGenerate}
          disabled={rfpLoading}
          className="w-full sm:w-auto px-6 py-3 min-h-[48px] rounded-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white text-sm font-semibold transition"
        >
          {rfpLoading ? 'RFPを作成しています…' : 'ユーザーストーリ付きRFPを作る'}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3 gap-2">
        <h3 className="text-sm font-bold text-navy-950">RFPドラフト（ユーザーストーリー付き）</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={copy}
            className="text-xs px-3 py-2 rounded-full border border-gray-300 hover:border-primary-400 text-gray-700 transition"
          >
            {copied ? 'コピーしました' : 'コピー'}
          </button>
          <button
            type="button"
            onClick={download}
            className="text-xs px-3 py-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white font-medium transition"
          >
            .md保存
          </button>
        </div>
      </div>
      <pre className="max-h-[360px] overflow-auto rounded-xl bg-gray-50 border border-gray-200 p-4 text-xs leading-relaxed whitespace-pre-wrap text-gray-800">
        {rfpMarkdown}
      </pre>
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <p className="text-xs text-gray-500 flex-1">
          このRFPの精度を上げて開発まで進めるなら、Beekleが具体化をお手伝いします。
        </p>
        <a
          href="/contact?source=flow-interview&intent=rfp"
          onClick={() => {
            const st = useFlowInterviewStore.getState();
            writeContactPrefill(
              buildContactMessage({
                diagram: st.diagram,
                suggestions: st.suggestions,
                suggestSummary: st.suggestSummary,
                rfpMarkdown: st.rfpMarkdown,
              })
            );
            trackCtaClick({ source: 'flow-interview', cta: 'contact-from-rfp' });
          }}
          className="inline-flex justify-center items-center px-5 py-2.5 min-h-[44px] rounded-full bg-navy-950 hover:bg-navy-900 text-white text-sm font-semibold transition"
        >
          このRFPでBeekleに相談する
        </a>
      </div>
    </div>
  );
}
