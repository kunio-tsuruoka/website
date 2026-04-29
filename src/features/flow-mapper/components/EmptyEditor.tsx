export function EmptyEditor({ onAddStep }: { onAddStep: () => void }) {
  return (
    <div className="p-5">
      <div className="border-2 border-dashed border-primary-300 rounded-lg p-4 mb-4 bg-primary-50/40">
        <p className="text-xs font-bold text-primary-900 mb-1">ここが詳細編集パネルです</p>
        <p className="text-xs text-primary-800/80 leading-relaxed">
          ステップ（左の図形）を<strong>クリック</strong>
          すると、ここに以下の編集項目が表示されます：
        </p>
        <ul className="text-[11px] text-primary-800/80 mt-2 space-y-0.5 ml-4 list-disc">
          <li>名前 / 種別（開始・作業・判断…）</li>
          <li>
            <strong className="text-primary-700">所要時間（分）</strong>（±ボタンで5分刻み変更）
          </li>
          <li>担当（レーン）/ フェーズ</li>
          <li>使用ツール（Excel・Slack 等）</li>
          <li>課題・痛み（As-Is）/ 改善ポイント（To-Be）</li>
          <li>次のステップ（矢印接続先、複数で分岐）</li>
        </ul>
      </div>

      <h3 className="text-sm font-bold text-gray-900 mb-2">最初の一歩</h3>
      <ol className="text-xs text-gray-700 space-y-1.5 mb-4 list-decimal list-inside leading-relaxed">
        <li>左上の図形パレット（○◇▭など）からステップを追加</li>
        <li>連続クリックでフローが自動で繋がります</li>
        <li>各ステップをクリックして詳細編集</li>
      </ol>

      <button
        type="button"
        onClick={onAddStep}
        className="w-full px-4 py-2.5 text-xs font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-600 shadow-sm"
      >
        ＋ 最初のステップを追加
      </button>
      <p className="mt-3 text-[11px] text-gray-500 leading-relaxed">
        まず試したい方は、ツールバーの<strong>「サンプルを読込」</strong>
        で受注〜出荷業務のサンプルが入ります。
      </p>
    </div>
  );
}
