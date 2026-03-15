const faqs = [
  {
    question: '導入にかかる期間はどのくらいですか？',
    answer:
      '基本的な構築で2-3ヶ月、本格的な活用環境の整備まで含めると4-6ヶ月程度です。既存のデータ環境や要件により変動する可能性があります。',
  },
  {
    question: '社内にエンジニアがいないのですが大丈夫でしょうか？',
    answer:
      'はい、問題ありません。技術的な部分は弊社で対応いたしますので、エンジニアがいなくても導入可能です。必要に応じて、担当者様向けのトレーニングも実施いたします。',
  },
  {
    question: '導入後のサポート体制はどうなっていますか？',
    answer:
      '導入後も定期的なレビューミーティングを実施し、データ活用の支援を継続して提供いたします。また、技術的なサポートも含め、運用面での課題にも対応いたします。',
  },
  {
    question: '費用はどのくらいかかりますか？',
    answer:
      '初期構築費用は規模や要件により異なりますが、小規模な導入で100万円程度から承っております。詳細は無料相談にてご案内させていただきます。',
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
          <p className="text-xl text-neutral-600">導入に関するご質問にお答えします</p>
        </div>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="bg-white rounded-2xl overflow-hidden hover:shadow-medium transition-shadow"
              style={{
                border: '1px solid rgba(61, 77, 183, 0.1)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              }}
            >
              <div
                className="flex items-center gap-4 px-7 py-5"
                style={{
                  background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
                  borderBottom: '1px solid rgba(61, 77, 183, 0.1)',
                }}
              >
                <span
                  className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base"
                  style={{
                    background: 'linear-gradient(135deg, #3D4DB7, #3544a4)',
                    boxShadow: '0 4px 12px rgba(61, 77, 183, 0.3)',
                  }}
                >
                  Q{index + 1}
                </span>
                <dt className="text-xl font-bold text-gray-900 flex-1 leading-snug">
                  {faq.question}
                </dt>
              </div>
              <dd className="px-7 py-5 text-gray-700 text-lg leading-relaxed">
                {faq.answer}
              </dd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
