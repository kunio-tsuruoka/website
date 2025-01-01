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
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            よくあるご質問
          </h2>
        </div>
        <div className="mt-12">
          <dl className="space-y-10">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="text-lg font-semibold text-gray-900">{faq.question}</dt>
                <dd className="mt-2 text-gray-500">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};
