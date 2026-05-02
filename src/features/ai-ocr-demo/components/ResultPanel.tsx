import { useOcrStore } from '../store';
import { ResultTable } from './ResultTable';

export function ResultPanel() {
  const result = useOcrStore((s) => s.result);
  const rawText = useOcrStore((s) => s.rawText);
  const loading = useOcrStore((s) => s.loading);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6 space-y-4">
      <h3 className="font-bold text-lg">抽出結果</h3>
      {!result && !rawText && !loading && (
        <p className="text-gray-500 text-sm">
          画像を選択して「解析する」を押すと、AIが内容を抽出します。
        </p>
      )}
      {loading && <p className="text-gray-500 text-sm">解析中...</p>}
      {result && <ResultTable result={result} />}
      {rawText && (
        <div>
          <p className="text-sm text-amber-700">
            JSONとして解釈できなかったため、生のテキストを表示します。
          </p>
          <pre className="mt-2 text-xs bg-gray-50 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap">
            {rawText}
          </pre>
        </div>
      )}
      <p className="text-xs text-gray-500">
        ※
        実際の業務では、抜き出したデータを使って転記・計算・手作業の自動化など、ロジックを追加で組み込みます。詳しくは
        <a
          href="/contact?source=tool-ai-ocr-demo"
          className="text-primary-600 underline hover:no-underline"
        >
          お問い合わせ
        </a>
        まで。
      </p>
    </div>
  );
}
