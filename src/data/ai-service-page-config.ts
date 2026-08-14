export const aiServicePageConfig = {
  'ai-development': {
    eyebrow: '生成AIで業務改善を始めたい企業へ',
    headline: 'AI開発の失敗を防ぐ要件定義から始める',
    heroLead:
      '資料探し、問い合わせ対応、書類の転記、確認作業などから、AIを入れるべき業務をヒアリングで絞ります。業務、要件、評価基準まで落としてから試作するので、作っただけで終わらず、社内説明と本番判断まで進めやすくなります。',
    primaryOutcome:
      '強みは実装前の設計です。AIを作って終わりにせず、実務で使える状態から逆算します。',
    contactIntent: 'genai-adoption',
    contactLabel: 'AI開発の失敗を防ぐ相談をする',
    visualTitle: '導入前の不安を減らす',
    visualSubtitle: 'お客さま側のメリット',
    visualItems: ['始める業務を選ぶ', '費用感をつかむ', '試作品で確かめる', '社内利用まで進める'],
    illustration: {
      src: '/images/services/generative-ai-business-prototype.webp',
      alt: '業務フローを選び、AIプロトタイプと効果を確認するチーム',
      stages: ['業務課題', '小さく試す', '効果を測る', '現場で運用'],
    },
    flow: undefined,
    rootCause: {
      eyebrow: 'なぜ、つまずくのか',
      title: 'AI開発が失敗する原因は、性能より先に決めるべきことの不足にある',
      lead: '上に挙げた不安は別々に見えて、根は共通しています。先にツールを選び、どの仕事をどこまで変え、何をもって使えると判断するかを決めないまま始めることです。',
      causes: [
        {
          title: '「目的」より先にツールから入っている',
          description:
            '「AIで何かやれ」で始まり、どの業務のどの手間を減らすかが定義されないまま試すため、動いても業務改善に結びつきません。',
        },
        {
          title: '「使える」の基準を決めていない',
          description:
            '何件処理できればよいか、確認時間をどれだけ減らしたいかを決めないと、「動いた」以上の判断ができず、社内承認で止まりやすくなります。',
        },
        {
          title: '業務・データ・権限の前提を後回しにしている',
          description:
            '社内資料の所在やアクセス権、コスト上限を設計に織り込まないため、精度・セキュリティ・費用の不安が最後にまとめて噴き出します。',
        },
      ],
    },
    metrics: [
      { label: '始め方', value: '初期費用0円で試作' },
      { label: '判断', value: '実物を見て決める' },
      { label: '運用', value: '費用と品質を監視' },
    ],
  },
  'internal-document-ai-search': {
    eyebrow: '文書を探す時間を減らしたい企業へ',
    headline: '社内文書AIの失敗を、質問と根拠の設計で防ぐ',
    heroLead:
      'PDF、マニュアル、規程集をただ検索対象に入れるだけでは不十分です。どんな質問に、どの根拠で答え、どこから人が確認するかを整理してから実装します。',
    primaryOutcome:
      '文書検索AIの精度は、文書を入れる前のヒアリング、質問設計、根拠提示ルールで決まります。',
    contactIntent: 'document-ai-search',
    contactLabel: '社内文書AIの失敗を防ぐ相談をする',
    visualTitle: '探す・聞く時間を減らす',
    visualSubtitle: 'お客さま側のメリット',
    visualItems: [
      '文書探しを短縮',
      '担当者への質問を削減',
      '新人教育を効率化',
      '根拠確認を速くする',
    ],
    illustration: {
      src: '/images/services/internal-document-ai-search.webp',
      alt: '社内文書をAIで横断検索し、回答と根拠を確認する業務画面',
      stages: ['文書を集約', '意味で検索', '根拠を確認', '問い合わせ削減'],
    },
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
    rootCause: {
      eyebrow: 'なぜ、探せないのか',
      title: '文書AIが失敗する原因は、文書投入前の質問設計にある',
      lead: '「あるはずの答え」に届かないのは、AIの性能だけでなく、探し方、文書の置き方、根拠の出し方を先に決めていないことに原因があります。',
      causes: [
        {
          title: '検索が言葉の一致で止まっている',
          description:
            '全文検索はキーワードが一致しないと拾えず、表現の揺れや言い換えを取りこぼします。だから「あるはずの答え」に到達できません。',
        },
        {
          title: '文書が置き場所ごとに分断されている',
          description:
            'ファイルサーバー、SharePoint、個人フォルダに分かれ、横断して意味で探す仕組みが無いため、探せるかどうかが人の経験に依存します。',
        },
        {
          title: '「答え」と「根拠」がセットになっていない',
          description:
            'どの文書のどこが根拠かを示せないため、コンプライアンス確認やオンボーディングで結局原本を開いて読み直すことになります。',
        },
      ],
    },
    metrics: [
      { label: '削減対象', value: '検索・確認時間' },
      { label: '回答', value: '根拠付き' },
      { label: '導入', value: '部署単位から' },
    ],
  },
  'rag-system-development': {
    eyebrow: '社内文書検索AI・RAG／GraphRAG開発',
    headline: 'RAGを、PoCで止めない評価設計から始める',
    heroLead:
      '製品仕様、社内規程、過去対応、議事録が散らばっている場合、ベクトル検索だけでは限界があります。業務質問、概念同士の関係、根拠提示、評価基準、更新運用を決めてから実装します。',
    primaryOutcome:
      'BeekleはRAG実装だけでなく、何を聞ければ業務で使えるかのユースケース確定から入ります。',
    contactIntent: 'rag-system-development',
    contactLabel: 'RAGの本番化判断を相談する',
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
    rootCause: {
      eyebrow: 'なぜ、答えられないのか',
      title: 'RAGが本番化できない原因は、評価基準と運用設計の不足にある',
      lead: '固有の質問に答えられない、ハルシネーションが怖い、PoCが止まる。これらは別々の問題ではなく、同じ設計の欠落から生じます。',
      causes: [
        {
          title: '自社データを参照する経路が無い',
          description:
            'ChatGPTは学習済みの一般知識で答えるため、製品仕様や社内規程を検索して参照する経路（RAG）が無い限り、固有の質問には答えられません。',
        },
        {
          title: 'ハルシネーションは仕組みそのものから生じる',
          description:
            'LLMは「知らない」と言えず、確率的に最もそれらしい語を続けます。だから根拠を検索して渡し、根拠外を答えさせない設計でしか抑えられません。',
        },
        {
          title: '精度を測る基準を最初に決めていない',
          description:
            '評価データセットが無いとPoCは「動いた」印象でしか語れず、本番化の判断も、社内のセキュリティ審査を通す説明もできないまま止まります。最初に評価基準を決めれば、使えるかどうかを社内で説明できます。',
        },
      ],
    },
    metrics: [
      { label: '削減対象', value: '確認・調査時間' },
      { label: '回答', value: '根拠付き' },
      { label: '運用', value: 'データ更新対応' },
    ],
  },
  'ai-chatbot-development': {
    eyebrow: '問い合わせ対応を減らしたい企業へ',
    headline: 'AIチャットボットの失敗を、回答範囲と引き継ぎ設計で防ぐ',
    heroLead:
      '社内FAQ、顧客サポート、ヘルプデスクで、AIが答える質問、人へ戻す質問、記録して改善する質問を切り分けます。導入後に使われるかどうかは、会話設計と運用設計で決まります。',
    primaryOutcome:
      '重要なのはボットを置くことではなく、一次対応で減らす負荷と、人へ戻す条件を先に決めることです。',
    contactIntent: 'ai-chatbot-development',
    contactLabel: 'チャットボット導入の失敗を防ぐ相談をする',
    visualTitle: '問い合わせ対応を軽くする',
    visualSubtitle: 'お客さま側のメリット',
    visualItems: ['定型質問を自動化', '待ち時間を短縮', '担当者の負荷を削減', '対応品質を改善'],
    illustration: {
      src: '/images/services/ai-chatbot-support-handoff.webp',
      alt: 'AIチャットボットが定型問い合わせに回答し、人へ引き継ぐ画面',
      stages: ['質問を受ける', 'FAQで回答', '必要時に引継ぎ', 'ログで改善'],
    },
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
    rootCause: {
      eyebrow: 'なぜ、負荷が下がらないのか',
      title: 'チャットボットが失敗する原因は、答える範囲と人への戻し方が曖昧だから',
      lead: '同じ質問が集中し、時間外は止まる。原因は担当者の頑張りではなく、一次対応の受け皿が「人」しかないことにあります。',
      causes: [
        {
          title: '答えが人の記憶に閉じている',
          description:
            'FAQや過去対応が構造化されず担当者の記憶に依存するため、同じ質問が何度も人に集中します。',
        },
        {
          title: '一次対応の受け皿が「人」しかない',
          description:
            '定型質問を最初に捌く仕組みが無いので、営業時間外は止まり、日中は担当者が繰り返し回答に追われます。',
        },
        {
          title: '対応の記録が改善に回っていない',
          description:
            'どの質問が多いか、どこで人に引き継ぐべきかを分析する導線が無いため、負荷が下がらないまま蓄積します。',
        },
      ],
    },
    metrics: [
      { label: '削減対象', value: '定型質問' },
      { label: '目標', value: '自動回答率70%+' },
      { label: '改善', value: '対応ログ分析' },
    ],
  },
  'ocr-ai-development': {
    eyebrow: '紙・PDFの転記作業を減らしたい企業へ',
    headline: '帳票AIの失敗を、読み取り後の確認設計で防ぐ',
    heroLead:
      '請求書、申込書、スキャンPDFを読み取るだけでなく、どの項目を確定し、どこを人が確認し、どのシステムへ渡すかまで設計します。',
    primaryOutcome:
      'OCRは読み取り精度だけでなく、例外処理、確認導線、後続システム連携まで決めて初めて業務で使えます。',
    contactIntent: 'ocr-ai-development',
    contactLabel: '帳票AIの失敗を防ぐ相談をする',
    visualTitle: '手入力作業を減らす',
    visualSubtitle: 'お客さま側のメリット',
    visualItems: ['転記時間を削減', '入力ミスを減らす', '月末処理を平準化', '既存システムへ連携'],
    illustration: {
      src: '/images/services/ocr-ai-document-extraction.webp',
      alt: '紙やPDFの帳票をAIで読み取り、確認用データへ変換する画面',
      stages: ['帳票を投入', '項目を抽出', '人が確認', 'システム連携'],
    },
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
    rootCause: {
      eyebrow: 'なぜ、手入力が残るのか',
      title: '帳票AIが失敗する原因は、読み取り後の確認設計がないから',
      lead: '従来のOCRで読めない帳票が残るのは、精度の問題だけではありません。帳票形式の違い、意味の解釈、確認フローを分けて設計していないことが原因です。',
      causes: [
        {
          title: '帳票の形式が取引先ごとに違う',
          description:
            '決まったレイアウトを前提にした従来OCRは、項目の位置や名称がずれると読み取れず、結局人が手入力することになります。',
        },
        {
          title: '「読み取り」と「意味の解釈」が分かれていない',
          description:
            '従来OCRは文字を起こすだけで、どれが金額・日付・取引先かを判断できません。だからフォーマット非依存の構造化には人手が要ります。',
        },
        {
          title: '確認の仕組みが無く、ミスがそのまま流れる',
          description:
            '確信度の低い箇所を示す導線が無いため、転記ミスが会計・基幹などの後工程まで波及してから見つかります。',
        },
      ],
    },
    metrics: [
      { label: '削減対象', value: '手入力' },
      { label: '出力', value: 'CSV / API' },
      { label: '安全網', value: '人間レビュー' },
    ],
  },
  'ai-agent-development': {
    eyebrow: '複数システムの手作業を減らしたい企業へ',
    headline: 'AIエージェントの失敗を、任せる範囲と止め方の設計で防ぐ',
    heroLead:
      '調査、判断、入力、通知など複数システムをまたぐ作業は、ユースケース確定が最重要です。任せる範囲、権限、承認、例外、ログを決めてから実装します。',
    primaryOutcome:
      'エージェント設計の核は、できることを増やすより、安全に任せる範囲を決めることです。',
    contactIntent: 'ai-agent-development',
    contactLabel: 'AIエージェントの失敗を防ぐ相談をする',
    visualTitle: '手作業を前へ進める',
    visualSubtitle: 'お客さま側のメリット',
    visualItems: ['定型作業を削減', '複数システムを連携', '承認でリスクを抑制', '実行ログを残す'],
    illustration: {
      src: '/images/services/ai-agent-workflow-approval.webp',
      alt: 'AIエージェントが複数システムの作業を進め、人が承認する業務画面',
      stages: ['情報を集める', '下書き実行', '人が承認', 'ログを残す'],
    },
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
    rootCause: {
      eyebrow: 'なぜ、自動化が進まないのか',
      title: 'AIエージェントが失敗する原因は、任せる範囲と止め方が曖昧だから',
      lead: '自動化が進まない、暴走が怖い。この2つは裏表で、「どこまで任せ、どこで止めるか」の設計が無いことに根があります。',
      causes: [
        {
          title: '人が「つなぎ役」になっている',
          description:
            '調査・入力・通知が別々のシステムにまたがり、それらをつないで判断を担う設計が無いため、定型業務でも自動化が進みません。',
        },
        {
          title: '任せる範囲と止め方の設計が無い',
          description:
            '承認フローや実行できる操作の範囲を決めずに任せると暴走リスクが怖く、結局手作業に戻ります。ガバナンス設計の不在が導入をためらわせます。',
        },
        {
          title: '安全に組む「型」が社内に無い',
          description:
            'どう設計すれば安全に動くかのパターンが無いため、PoCの先へ進める判断ができないまま止まります。',
        },
      ],
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
