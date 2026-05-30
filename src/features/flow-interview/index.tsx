import { useTurnstile } from '@/lib/use-turnstile';
import { ChatPanel } from './components/ChatPanel';
import { DiagramPreview } from './components/DiagramPreview';
import { RfpPanel } from './components/RfpPanel';
import { SuggestionsPanel } from './components/SuggestionsPanel';
import { useFlowInterview } from './hooks/useFlowInterview';
import { useFlowInterviewStore } from './store';

/**
 * 会話で現状業務フロー（As-Is）を可視化するツールの公開エントリ。
 * Astro から `<FlowInterview client:load sitekey={...} />` で読み込む。
 */
export function FlowInterview({ sitekey }: { sitekey: string }) {
  const turnstile = useTurnstile(sitekey);
  const started = useFlowInterviewStore((s) => s.started);
  const loading = useFlowInterviewStore((s) => s.loading);
  const error = useFlowInterviewStore((s) => s.error);
  const { start, answer, suggest, generateRfp, toggleRecording, syncDiagram } = useFlowInterview();

  if (!started) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6 sm:p-8 max-w-2xl mx-auto">
        <h2 className="text-lg font-bold text-navy-950 mb-2">話すだけ発注準備</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-5">
          AIが今の業務の流れを質問していきます。答えていくと、右側に現状フロー図（As-Is）がリアルタイムで描かれます。テキストでも音声でも回答できます。所要時間の目安は3〜5分です。
        </p>
        <ul className="text-xs text-gray-600 space-y-1 mb-6">
          <li>・専門用語は不要、普段の言葉で大丈夫です</li>
          <li>・音声入力に対応（マイクボタン、対応ブラウザのみ）</li>
          <li>・できた図はそのまま改善相談や編集に進めます</li>
        </ul>

        <div className="mb-4 flex flex-col items-center gap-2">
          <div ref={turnstile.containerRef} className="min-h-[65px] flex items-center" />
          {!turnstile.token && (
            <p className="text-xs text-gray-500">セキュリティチェックを読み込んでいます...</p>
          )}
        </div>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          type="button"
          onClick={() => void start(turnstile.token, turnstile.reset)}
          disabled={!turnstile.token || loading}
          className="w-full px-5 py-3 min-h-[48px] bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white text-sm font-semibold rounded-full transition"
        >
          {loading
            ? '準備中...'
            : !turnstile.token
              ? 'セキュリティチェック待ち...'
              : '会話を始める'}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-4 sm:p-5">
        <ChatPanel
          onSubmit={(t) => void answer(t)}
          onToggleRecording={() => void toggleRecording()}
        />
      </div>
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-4 sm:p-5">
          <DiagramPreview onEdit={syncDiagram} />
        </div>
        <SuggestionsPanel onSuggest={() => void suggest()} />
        <RfpPanel onGenerate={() => void generateRfp()} />
      </div>
    </div>
  );
}
