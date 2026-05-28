export function CompletionPanel() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-8 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-50 text-primary-600 mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-navy-950 mb-2">ヒアリングを送信しました</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-6">
        担当者が内容を確認してご連絡します。最初のお打ち合わせから、具体的な提案に進めます。
      </p>

      <div className="grid sm:grid-cols-3 gap-3 text-left mt-6">
        <a
          href="/tools/flow-mapper"
          className="block px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-xl text-sm transition"
        >
          <span className="block text-xs text-primary-700 font-semibold mb-1">ツール</span>
          <span className="block text-navy-950 font-medium">業務フロー可視化</span>
        </a>
        <a
          href="/case-studies"
          className="block px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-xl text-sm transition"
        >
          <span className="block text-xs text-primary-700 font-semibold mb-1">事例</span>
          <span className="block text-navy-950 font-medium">導入事例を見る</span>
        </a>
        <a
          href="/column"
          className="block px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-xl text-sm transition"
        >
          <span className="block text-xs text-primary-700 font-semibold mb-1">コラム</span>
          <span className="block text-navy-950 font-medium">発注者向けコラム</span>
        </a>
      </div>
    </div>
  );
}
