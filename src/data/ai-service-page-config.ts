export const aiServicePageConfig = {
  'ai-development': {
    eyebrow: '生成AIで業務改善を始めたい企業へ',
    headline: 'AI導入の失敗リスクを抑え、使える業務改善に変える',
    heroLead:
      '「何にAIを使うべきか」「本当に効果が出るか」を、動くプロトタイプと評価設計で判断できる状態にします。',
    primaryOutcome: '技術検証で終わらせず、現場で使われるAI活用まで伴走します。',
    visualTitle: '導入前の不安を減らす',
    visualSubtitle: 'お客さま側のメリット',
    visualItems: ['使い道を明確化', '投資判断を早める', 'PoC止まりを防ぐ', '運用品質を保つ'],
    metrics: [
      { label: '判断材料', value: '動くPoC' },
      { label: '目的', value: '業務改善' },
      { label: '運用', value: '品質・費用管理' },
    ],
  },
  'internal-document-ai-search': {
    eyebrow: '文書を探す時間を減らしたい企業へ',
    headline: '社内文書を探す時間と問い合わせ対応を減らす',
    heroLead:
      'PDF、マニュアル、規程集を横断検索し、必要な答えと根拠文書にすぐ到達できる状態を作ります。',
    primaryOutcome: '「知っている人に聞く」運用を減らし、担当者の時間を本来業務に戻します。',
    visualTitle: '探す・聞く時間を減らす',
    visualSubtitle: 'お客さま側のメリット',
    visualItems: [
      '文書探しを短縮',
      '担当者への質問を削減',
      '新人教育を効率化',
      '根拠確認を速くする',
    ],
    metrics: [
      { label: '削減対象', value: '検索・確認時間' },
      { label: '回答', value: '根拠付き' },
      { label: '導入', value: '部署単位から' },
    ],
  },
  'rag-system-development': {
    eyebrow: '自社データを業務判断に使いたい企業へ',
    headline: '社内データから根拠ある回答を出し、判断スピードを上げる',
    heroLead:
      '製品仕様、社内規程、過去対応履歴などを活用し、担当者が根拠を確認しながら判断できるAI基盤を作ります。',
    primaryOutcome: '汎用AIでは答えられない自社固有の質問に、根拠付きで対応できます。',
    visualTitle: '判断スピードを上げる',
    visualSubtitle: 'お客さま側のメリット',
    visualItems: [
      '確認・調査時間を削減',
      '回答根拠を明示',
      '属人対応を減らす',
      '本番化判断を早める',
    ],
    metrics: [
      { label: '削減対象', value: '確認・調査時間' },
      { label: '回答', value: '根拠付き' },
      { label: '運用', value: 'データ更新対応' },
    ],
  },
  'ai-chatbot-development': {
    eyebrow: '問い合わせ対応を減らしたい企業へ',
    headline: '繰り返しの問い合わせを減らし、担当者の負荷を下げる',
    heroLead:
      '社内FAQ、顧客サポート、ヘルプデスクの定型質問をAIが一次対応し、必要な時だけ人に引き継ぎます。',
    primaryOutcome: '利用者の待ち時間を減らし、サポート担当者は重要な対応に集中できます。',
    visualTitle: '問い合わせ対応を軽くする',
    visualSubtitle: 'お客さま側のメリット',
    visualItems: ['定型質問を自動化', '待ち時間を短縮', '担当者の負荷を削減', '対応品質を改善'],
    metrics: [
      { label: '削減対象', value: '定型質問' },
      { label: '目標', value: '自動回答率70%+' },
      { label: '改善', value: '対応ログ分析' },
    ],
  },
  'ocr-ai-development': {
    eyebrow: '紙・PDFの転記作業を減らしたい企業へ',
    headline: '帳票の手入力と確認作業を減らし、処理を速くする',
    heroLead:
      '請求書、申込書、スキャンPDFを読み取り、会計ソフトや基幹システムで使えるデータに変換します。',
    primaryOutcome: '取引先ごとのフォーマット差を吸収し、月末・期末の転記負荷を軽くします。',
    visualTitle: '手入力作業を減らす',
    visualSubtitle: 'お客さま側のメリット',
    visualItems: ['転記時間を削減', '入力ミスを減らす', '月末処理を平準化', '既存システムへ連携'],
    metrics: [
      { label: '削減対象', value: '手入力' },
      { label: '出力', value: 'CSV / API' },
      { label: '安全網', value: '人間レビュー' },
    ],
  },
  'ai-agent-development': {
    eyebrow: '複数システムの手作業を減らしたい企業へ',
    headline: '人がつないでいる定型業務を、AIで安全に前へ進める',
    heroLead:
      '調査、判断、入力、通知など複数システムをまたぐ作業を、承認フロー付きのAIエージェントとして設計します。',
    primaryOutcome: '人は最終判断に集中し、繰り返し作業や転記作業をAIに任せられます。',
    visualTitle: '手作業を前へ進める',
    visualSubtitle: 'お客さま側のメリット',
    visualItems: ['定型作業を削減', '複数システムを連携', '承認でリスクを抑制', '実行ログを残す'],
    metrics: [
      { label: '削減対象', value: '手作業' },
      { label: '安全性', value: '承認フロー' },
      { label: '監査', value: '実行ログ' },
    ],
  },
} as const;

export type AiServicePageId = keyof typeof aiServicePageConfig;

export function getAiServicePageConfig(id: string) {
  return aiServicePageConfig[id as AiServicePageId];
}
