const faqs = [
  {
    question: 'NDAを締結してから相談できますか？',
    answer:
      '可能です。社内資料、RFP、既存システムの情報、顧客データを扱う場合は、必要に応じてNDA締結後に詳細を伺います。初回は資料なしでも、相談範囲と確認すべき論点を整理できます。',
  },
  {
    question: '相談した結果、開発しない判断になっても大丈夫ですか？',
    answer:
      '問題ありません。Beekleは最初から本開発を前提にせず、業務に合うか、費用対効果が見込めるか、いま着手すべきかを一緒に確認します。進めない方がよい場合は、その理由をお伝えします。',
  },
  {
    question: 'PoCやプロトタイプ後に、本開発へ進まないことはできますか？',
    answer:
      'できます。検証結果を見て、見送る・範囲を狭める・他社へ発注する、といった判断が可能です。検証用プロトタイプは、投資判断のために作るものです。',
  },
  {
    question: '社内にエンジニアがいないのですが相談できますか？',
    answer:
      '相談できます。技術的な実装はこちらで担えます。ただし、業務内容、利用者、現行資料、判断者の参加は必要です。社内で持つべき運用や確認作業も、初回相談で切り分けます。',
  },
  {
    question: 'データやセキュリティの扱いが不安です。',
    answer:
      '対象データ、権限、ログ、外部AIサービスの利用可否、モデル学習への利用有無を確認してから設計します。Azure OpenAIやAWS Bedrockなど、要件に応じた構成も検討できます。',
  },
  {
    question: '費用はどのくらいかかりますか？',
    answer:
      '費用は「何を作るか」と「どの段階か」で変わります。条件が合う案件では、初期検証を当社負担で行う場合があります。PoCは数百万円、本開発は規模により変動します。初回返信で、投資レンジと前提条件をできるだけ具体的にお返しします。',
  },
];

export const ProcessFAQ = () => {
  return (
    <div className="py-4">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-navy-950 mb-4">
            よくある<span className="text-primary-500">ご質問</span>
          </h2>
          <p className="text-xl text-neutral-600">発注前に不安になりやすい点を先に整理します</p>
        </div>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="bg-white rounded-lg overflow-hidden transition-colors"
              style={{
                border: '1px solid rgba(61, 77, 183, 0.1)',
              }}
            >
              <div
                className="flex items-center gap-4 px-7 py-5"
                style={{
                  background: '#f8fafc',
                  borderBottom: '1px solid rgba(61, 77, 183, 0.1)',
                }}
              >
                <span
                  className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base"
                  style={{
                    background: '#3D4DB7',
                  }}
                >
                  Q{index + 1}
                </span>
                <dt className="text-xl font-bold text-gray-900 flex-1 leading-snug">
                  {faq.question}
                </dt>
              </div>
              <dd className="px-7 py-5 text-gray-700 text-lg leading-relaxed">{faq.answer}</dd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
