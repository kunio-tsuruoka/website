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
    illustration: {
      src: '/images/services/generative-ai-poc-to-operations.webp',
      alt: '業務課題から生成AIの試作、効果検証、承認付きの現場運用へ進む流れ',
      stages: ['業務課題', '小さく試す', '効果を測る', '現場で運用'],
    },
    flow: undefined,
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
    flow: {
      eyebrow: 'BEFORE / AFTER',
      title: '資料探しを、根拠つき回答に変える',
      lead: 'ファイルを開いて読み比べる作業を減らし、必要な答えと確認元にすぐ到達できる状態を作ります。',
      steps: [
        {
          label: '今の状態',
          title: '資料が散らばる',
          description: 'PDF、規程集、マニュアルが別々の場所にあり、探す人の経験に依存します。',
        },
        {
          label: 'Beekleの設計',
          title: '質問の意味で探す',
          description: '表現が違っても関係する箇所を探し、回答と一緒に根拠文書を提示します。',
        },
        {
          label: '導入後',
          title: '答えと根拠が見える',
          description: '担当者への確認や資料の読み比べを減らし、本来業務に時間を戻します。',
        },
      ],
      outcome: '新人教育、社内問い合わせ、規程確認など、繰り返し発生する確認業務を軽くできます。',
    },
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
    illustration: {
      src: '/images/services/rag-knowledge-to-answer.webp',
      alt: '散らばった社内資料をつなぎ、根拠を示しながら回答するRAGシステムの流れ',
      stages: ['社内資料', '関係を整理', '根拠を確認', '回答を業務判断へ'],
    },
    flow: {
      eyebrow: 'BEFORE / AFTER',
      title: '散らばった社内データを、判断材料に変える',
      lead: '製品仕様、過去対応、議事録などを横断し、担当者が次に何を確認すべきかまで整理します。',
      steps: [
        {
          label: '今の状態',
          title: '根拠が複数資料に分散',
          description: '必要な情報が別々の資料にあり、経験のある担当者しか全体像をつかめません。',
        },
        {
          label: 'Beekleの設計',
          title: '情報の関係をたどる',
          description: '関連資料と背景をまとめ、回答の根拠、影響範囲、確認先を整理します。',
        },
        {
          label: '導入後',
          title: '判断を速くする',
          description: '資料を読み解く時間を減らし、担当者が根拠を確認しながら前へ進めます。',
        },
      ],
      outcome: '汎用AIでは答えにくい、自社固有の質問や複数資料にまたがる判断を支援できます。',
    },
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
    flow: {
      eyebrow: 'BEFORE / AFTER',
      title: '繰り返しの質問を、AIの一次対応に変える',
      lead: '利用者は自然な言葉で質問できます。答えられない時だけ担当者へ引き継ぎ、対応ログを改善に使います。',
      steps: [
        {
          label: '今の状態',
          title: '同じ質問が集中する',
          description: '担当者が繰り返し回答し、本来対応すべき難しい問い合わせに時間を使えません。',
        },
        {
          label: 'Beekleの設計',
          title: 'AIが一次対応する',
          description: 'FAQや社内資料をもとに回答し、判断が難しい質問は人へ安全に引き継ぎます。',
        },
        {
          label: '導入後',
          title: '重要な対応に集中する',
          description: '待ち時間を減らし、担当者は複雑な相談や改善業務に時間を使えます。',
        },
      ],
      outcome: '社内FAQ、顧客サポート、ヘルプデスクの定型問い合わせを減らせます。',
    },
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
    flow: {
      eyebrow: 'BEFORE / AFTER',
      title: '紙・PDFの手入力を、確認中心の仕事に変える',
      lead: '取引先ごとに形式が違う帳票でも、必要な項目を読み取り、確認が必要な箇所だけを人に渡します。',
      steps: [
        {
          label: '今の状態',
          title: '帳票を見ながら手入力',
          description: '請求書や申込書の形式が違い、転記とダブルチェックに時間がかかります。',
        },
        {
          label: 'Beekleの設計',
          title: 'AIが項目を読み取る',
          description: '金額、日付、取引先などを抽出し、確信度が低い箇所をわかりやすく示します。',
        },
        {
          label: '導入後',
          title: '必要な箇所だけ確認',
          description: 'すべてを入力する作業から、例外だけを確認する運用へ切り替えられます。',
        },
      ],
      outcome: '月末の転記負荷と入力ミスを減らし、CSVやAPIで既存システムへ連携できます。',
    },
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
    flow: {
      eyebrow: 'BEFORE / AFTER',
      title: '人がつないでいる作業を、承認つきで前へ進める',
      lead: '調査、入力、通知など、複数システムをまたぐ作業をAIがまとめて進めます。重要な操作は人が承認します。',
      steps: [
        {
          label: '今の状態',
          title: '画面を行き来して手作業',
          description: '情報を探し、別システムへ入力し、担当者へ連絡する作業が毎回発生します。',
        },
        {
          label: 'Beekleの設計',
          title: 'AIが下準備と実行を担う',
          description: '許可した範囲でAIが作業し、発注や更新など重要操作の前に承認を求めます。',
        },
        {
          label: '導入後',
          title: '人は最終判断に集中',
          description: '繰り返し作業を減らし、実行履歴を確認しながら安全に自動化できます。',
        },
      ],
      outcome: '在庫確認、申請処理、調査、通知など、複数工程がつながる定型業務を効率化できます。',
    },
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
