export type ConsultationSituation = {
  slug: string;
  href: string;
  navLabel: string;
  cardTitle: string;
  title: string;
  description: string;
  lead: string;
  audience: string;
  symptoms: string[];
  judgmentRows: { label: string; text: string }[];
  returnMaterials: { title: string; description: string }[];
  proof: {
    label: string;
    title: string;
    description: string;
    points: string[];
  };
  rtbItems: { label: string; value: string; description: string }[];
  deferCriteria: string[];
  relatedServices: { label: string; href: string; description: string }[];
};

export const consultationHub = {
  title: '相談が始まる場面',
  href: '/situations',
  description:
    'サービス名ではなく、社内で相談が始まった場面から選べます。各場面ごとに、判断材料、見送り条件、初回で返す資料、似た相談の実例、次に確認することを整理します。',
};

export const consultationSituations: ConsultationSituation[] = [
  {
    slug: 'requirements-unclear',
    href: '/situations/requirements-unclear',
    navLabel: '要件が固まらず発注できない',
    cardTitle: '要件が固まらず、見積もりや社内合意が進まない',
    title: '要件が固まらない相談を、発注判断に使える材料へ。',
    description:
      '依頼内容がまだ曖昧でも、業務・利用者・制約・優先順位を分けると、比較できる見積もりと社内説明に近づきます。',
    lead: '最初に作るのは詳細な仕様書ではなく、何を確かめれば発注判断できるかを並べた相談メモです。',
    audience: '新規事業、DX推進、事業部門、情シス、発注準備を任された担当者',
    symptoms: [
      '社内では必要性がありそうだが、何を作るかを一文で説明できない',
      '複数社の見積もりが、範囲も前提も違って比較できない',
      '画面、業務フロー、データ、権限の話が会議ごとに入れ替わる',
    ],
    judgmentRows: [
      {
        label: '対象業務',
        text: '誰が、どの作業で、何に困っているかを一つの業務単位に絞ります。',
      },
      {
        label: '判断材料',
        text: '画面、業務フロー、受入条件、概算レンジのどれが足りないかを分けます。',
      },
      {
        label: '見送り条件',
        text: '利用者不在、データ不足、投資対効果の根拠不足など、今は着手しない条件も先に置きます。',
      },
    ],
    returnMaterials: [
      {
        title: '発注判断メモ',
        description: '目的、対象者、対象業務、制約、確認すべき問いを1枚に整理します。',
      },
      {
        title: '受入条件のたたき台',
        description: '画面や機能の話を、検収時に確認できる条件へ落とします。',
      },
      {
        title: '概算レンジの前提',
        description: '金額だけでなく、何を含み何を含まないかまで比較できる形にします。',
      },
    ],
    proof: {
      label: '実案件ログ',
      title: '議事録から、1日で確認用デモへ',
      description:
        '発注前のヒアリング内容を、画面で確認できる検証用プロトタイプへ落とし込みました。',
      points: [
        '会話の断片を業務フローと画面単位に整理',
        '確認すべき問いをデモで見られる状態へ変換',
        '次回打ち合わせで不足情報を確認できる資料として使用',
      ],
    },
    rtbItems: [
      {
        label: '成果物サンプル',
        value: '発注判断メモ',
        description: '目的、業務、利用者、制約、受入条件を同じ紙面に置きます。',
      },
      {
        label: '判断材料',
        value: '受入条件',
        description: '何ができたら十分かを、見積もり前に確認できる粒度へ落とします。',
      },
      {
        label: '次に確認すること',
        value: '不足情報リスト',
        description: '発注者側で確認すべき社内事情、データ、承認条件を残します。',
      },
    ],
    deferCriteria: [
      '利用者や決裁者がまだ特定できていない',
      '業務量や発生頻度が分からず、投資判断の前提が置けない',
      '既存システムやデータの制約が確認できていない',
    ],
    relatedServices: [
      {
        label: 'MVP・PoC・プロトタイプ開発',
        href: '/services/mvp-poc-development',
        description: '曖昧な構想を、触って判断できる検証範囲へ落とします。',
      },
      {
        label: '要件定義から伴走する開発',
        href: '/services/requirements-definition-support',
        description: '業務、受入条件、仕様変更の追跡まで含めて発注準備を進めます。',
      },
    ],
  },
  {
    slug: 'ai-adoption',
    href: '/situations/ai-adoption',
    navLabel: 'AI導入の始め方を決めたい',
    cardTitle: 'AI導入を任されたが、どの業務から試すか決められない',
    title: 'AI導入を、流行ではなく業務単位で判断する。',
    description:
      'AIを入れる前提で話を進めず、対象業務、使えるデータ、評価基準、運用負荷を分けて初期判断します。',
    lead: '「何かAIを」ではなく、時間が減る業務、品質が上がる業務、今は向かない業務を同じ表で見ます。',
    audience: 'AI導入を任された新規事業・DX・情シス・事業部門の担当者',
    symptoms: [
      '上層部からAI導入を求められているが、対象業務を決めきれない',
      'チャットボット、RAG、OCR、エージェントの違いが社内で混ざっている',
      'PoCをしても、本番化の判断基準が曖昧なままになりそう',
    ],
    judgmentRows: [
      {
        label: '対象業務',
        text: '問い合わせ、検索、入力、判定、作成支援など、AI化候補を業務単位で分けます。',
      },
      {
        label: '評価基準',
        text: '精度、削減時間、確認工数、利用者、データ更新頻度を先に置きます。',
      },
      {
        label: '見送り条件',
        text: 'データ不足、利用者不在、運用体制不足、責任分界の曖昧さを確認します。',
      },
    ],
    returnMaterials: [
      {
        title: 'AI導入判断メモ',
        description: '業務候補、期待効果、必要データ、評価観点を一覧にします。',
      },
      {
        title: '検証スコープ',
        description: 'PoCで見る範囲と、本番化前に残すリスクを分けます。',
      },
      {
        title: '見送り条件',
        description: '今すぐ作らない方がよい場合も、理由と次の確認条件を残します。',
      },
    ],
    proof: {
      label: '実案件ログ',
      title: 'HR AIエージェントをPoC 2週間から本開発へ',
      description:
        '心理尺度、LLM構造化出力、PDFレポート、企業アカウント管理まで、業務判断に使うAIとして実装しました。',
      points: [
        'HEXACO-100のスコアリングと職種適合を実装',
        'LLM出力をJSON Schemaで固定してレポート品質を安定化',
        '招待から診断、分析、PDF出力まで業務フローに接続',
      ],
    },
    rtbItems: [
      {
        label: '成果物サンプル',
        value: '評価シート',
        description: '精度、削減時間、確認工数、利用者、運用負荷を同じ表で見ます。',
      },
      {
        label: '判断材料',
        value: '本番化前レビュー',
        description: 'PoCの結果を、次の投資条件と残リスクに分けます。',
      },
      {
        label: '次に確認すること',
        value: 'データ棚卸し',
        description: 'AIに入れてよいデータ、足りないデータ、更新頻度を確認します。',
      },
    ],
    deferCriteria: [
      '対象業務の担当者が検証に参加できない',
      '正解データや確認担当がなく、評価のしようがない',
      'AIの出力責任や人の承認地点が決められていない',
    ],
    relatedServices: [
      {
        label: 'AI導入支援',
        href: '/services/ai-adoption',
        description: '業務候補の整理からPoC、本番化判断まで段階的に支援します。',
      },
      {
        label: '生成AI受託開発',
        href: '/services/ai-development',
        description: '対象業務が見えた後、実装と運用まで一貫して進めます。',
      },
    ],
  },
  {
    slug: 'business-systemization',
    href: '/situations/business-systemization',
    navLabel: '属人業務をシステム化したい',
    cardTitle: 'Excel・メール・担当者の記憶に業務が散らばっている',
    title: '属人業務を、現場で使えるシステム要件へ。',
    description:
      '今の業務をそのまま画面化せず、例外対応、承認、権限、データ、現場端末の制約まで分けて整理します。',
    lead: '現場の例外を落とさないために、As-Is/To-Be、受入条件、変更履歴をつなげて見える化します。',
    audience: '業務改善、DX推進、情シス、現場部門、既存業務のシステム化担当者',
    symptoms: [
      'Excel、メール、チャット、紙帳票に同じ情報が分散している',
      '担当者の記憶やベテラン判断がないと例外処理が進まない',
      '開発会社に説明しても、現場の細かい例外が仕様から漏れる',
    ],
    judgmentRows: [
      {
        label: '業務の流れ',
        text: '通常処理、例外処理、承認、差し戻し、締め作業を分けて見ます。',
      },
      {
        label: '判断材料',
        text: '画面、データ項目、権限、通知、帳票、外部連携の必要性を並べます。',
      },
      {
        label: '見送り条件',
        text: '業務ルールが未決、既存データが不整合、現場の協力時間が取れない場合は先に整えます。',
      },
    ],
    returnMaterials: [
      {
        title: '業務フロー整理',
        description: 'As-Is/To-Beと例外処理を、実装へ渡せる粒度で整理します。',
      },
      {
        title: '受入条件',
        description: '現場で使えるかを検収できる条件として残します。',
      },
      {
        title: '変更履歴',
        description: 'なぜ仕様が変わったかを後から追える状態にします。',
      },
    ],
    proof: {
      label: '実案件ログ',
      title: '倉庫AI DXで月1万件超の受注処理を安定化',
      description:
        '紙とベテランの記憶に依存していた倉庫業務を、要件定義から実装まで一貫して整理しました。',
      points: [
        'As-Is/To-Be、業務データ、例外対応、判断ポイントを整理',
        'スキャン、プリンター、実機端末の現場制約まで実装',
        '月1万件超の受注を落とさず回せる運用へ接続',
      ],
    },
    rtbItems: [
      {
        label: '成果物サンプル',
        value: '業務フローBefore/After',
        description: '現状業務とシステム化後の流れを同じ紙面で比較します。',
      },
      {
        label: '判断材料',
        value: '受入条件',
        description: '現場で確認する操作、帳票、例外処理を条件化します。',
      },
      {
        label: '次に確認すること',
        value: '現場制約リスト',
        description: '端末、権限、印刷、ネットワーク、既存システム連携を洗い出します。',
      },
    ],
    deferCriteria: [
      '業務責任者と現場担当者の見解が大きく食い違っている',
      '例外処理が多いのに確認できる担当者がいない',
      '既存データの所在や品質がまだ確認できていない',
    ],
    relatedServices: [
      {
        label: 'Web・モバイルアプリ開発',
        href: '/services/web-mobile-development',
        description: '現場業務、管理画面、API、モバイル端末まで一貫して開発します。',
      },
      {
        label: '要件定義から伴走する開発',
        href: '/services/requirements-definition-support',
        description: '業務整理から仕様、受入条件、変更管理まで支援します。',
      },
    ],
  },
  {
    slug: 'legacy-system-modernization',
    href: '/situations/legacy-system-modernization',
    navLabel: '古いシステムをコスパよく刷新したい',
    cardTitle: '仕様書がなく、古いシステムの改修費と保守負担が増えている',
    title: '古いシステムを、必要な機能だけ次へ移す。',
    description:
      '現行の画面、コード、データ、外部連携、実際の運用から仕様を復元し、残す・捨てる・変えるを整理して段階的に刷新します。',
    lead: '全部を一から作り直しません。いま本当に使われている機能を読み解き、不要な再実装と移行リスクを減らします。',
    audience: '情シス、DX推進、事業責任者、古い基幹・業務システムの保守や刷新を任された担当者',
    symptoms: [
      '仕様書が古い、または存在せず、改修のたびに調査費用が増える',
      '担当者しか分からない例外処理があり、置き換えで業務が止まるのが怖い',
      '全面刷新の見積もりが高く、どこから移せばよいか判断できない',
    ],
    judgmentRows: [
      {
        label: '現行仕様の復元',
        text: '画面、コード、データベース、外部連携、定期処理、実際の運用から、いま使われている仕様を読み解きます。',
      },
      {
        label: '刷新範囲',
        text: '機能ごとに、残す・改善して残す・廃止する・他サービスへ置き換える・後回しにするを分けます。',
      },
      {
        label: '移行方法',
        text: '機能、部署、データの単位で段階移行できるかを確認し、並行運用と切替条件を整理します。',
      },
    ],
    returnMaterials: [
      {
        title: '現行仕様マップ',
        description: '画面、機能、データ、外部連携、権限、定期処理、利用部門を一つの地図にします。',
      },
      {
        title: '刷新スコープ',
        description: '残す・変える・捨てる・後回しにする範囲を分け、全面刷新と部分刷新を比較します。',
      },
      {
        title: '移行計画と概算レンジ',
        description: '最初に置き換える範囲、並行運用、データ移行、停止時間、主なリスクと費用前提を整理します。',
      },
    ],
    proof: {
      label: 'Beekleの進め方',
      title: '復元した仕様を、PM on Railsから実装とテストへ',
      description:
        '現行システムから読み解いた業務、利用場面、データ、権限、例外処理、確認条件をPM on Railsへ構造化し、そのままAIエージェントによる再実装と確認へつなぎます。',
      points: [
        '調査資料を別会社へ渡し直さず、仕様化から実装まで同じ流れで進行',
        '現行の利用場面を確認条件として残し、新旧システムの動きを比較',
        '変更理由と仕様を蓄積し、移行後の改修しやすさまで改善',
      ],
    },
    rtbItems: [
      {
        label: '成果物サンプル',
        value: '現行仕様マップ',
        description: '資料だけを信じず、実際の画面、コード、データ、運用から現行仕様を復元します。',
      },
      {
        label: '判断材料',
        value: '残す・捨てる・変える',
        description: '使われていない機能まで再実装せず、投資する範囲を機能単位で決めます。',
      },
      {
        label: '次に確認すること',
        value: '段階移行の条件',
        description: '旧システムとの並行運用、データ移行、切替手順、停止時間を確認します。',
      },
    ],
    deferCriteria: [
      '現行システムの画面、コード、データ、運用担当者のいずれにもアクセスできない',
      '残す業務と廃止する業務を判断する責任者が決まっていない',
      'データ移行後の照合方法や業務停止の許容時間を決められない',
    ],
    relatedServices: [
      {
        label: '要件定義から伴走する開発',
        href: '/services/requirements-definition-support',
        description: '現行仕様の復元から、受入条件、変更履歴、実装まで同じ流れで進めます。',
      },
      {
        label: 'Web・モバイルアプリ開発',
        href: '/services/web-mobile-development',
        description: '古い業務システムの段階的な再設計、再実装、移行、保守まで対応します。',
      },
    ],
  },
  {
    slug: 'internal-document-search',
    href: '/situations/internal-document-search',
    navLabel: '社内資料を根拠付きで検索したい',
    cardTitle: '社内資料・FAQ・規程を探す時間を減らしたい',
    title: '社内資料検索を、答えと根拠で判断できる形へ。',
    description:
      '文書を入れるだけでは検索精度は上がりません。資料の種類、更新頻度、権限、回答根拠、評価質問を先に設計します。',
    lead: '最初に見るのは「AIが答えるか」ではなく、根拠を示して業務で使える回答になるかです。',
    audience: '情シス、DX推進、バックオフィス、社内FAQやナレッジ検索の担当者',
    symptoms: [
      '社内資料はあるが、どれが最新版か分からない',
      '検索しても文書が多すぎて、答えにたどり着けない',
      'AI検索を試したが、根拠が弱く業務で使いにくい',
    ],
    judgmentRows: [
      {
        label: '文書範囲',
        text: '規程、マニュアル、議事録、FAQ、PDFなど、対象と除外範囲を分けます。',
      },
      {
        label: '評価質問',
        text: 'よく聞かれる質問、間違えると困る質問、根拠が必要な質問を準備します。',
      },
      {
        label: '見送り条件',
        text: '文書の権限や最新版管理が未整理なら、検索以前に情報管理を整える必要があります。',
      },
    ],
    returnMaterials: [
      {
        title: '検索評価表',
        description: '質問、期待回答、参照文書、回答の良否、改善点を並べます。',
      },
      {
        title: '文書棚卸しメモ',
        description: '対象文書、除外文書、更新頻度、権限を整理します。',
      },
      {
        title: '回答＋根拠UI案',
        description: '答え、引用元、該当箇所、人への引き継ぎを確認できる形にします。',
      },
    ],
    proof: {
      label: '実案件ログ',
      title: 'GraphRAGと5つの検索ルートで根拠検索を改善',
      description:
        '単純なベクトル検索だけでは届きにくい質問に対して、文書構造と検索経路を組み合わせました。',
      points: [
        '文書分割、メタデータ、参照元表示を設計',
        'RRFで複数検索ルートの結果を統合',
        '評価質問で回答品質と根拠表示を確認',
      ],
    },
    rtbItems: [
      {
        label: '成果物サンプル',
        value: '回答＋根拠UI',
        description: '答えだけでなく、参照元と該当箇所を一緒に確認できるようにします。',
      },
      {
        label: '判断材料',
        value: '検索評価表',
        description: 'よくある質問で回答品質、根拠、失敗パターンを見ます。',
      },
      {
        label: '次に確認すること',
        value: '文書権限',
        description: '部署別閲覧権限、最新版管理、機密情報の扱いを確認します。',
      },
    ],
    deferCriteria: [
      '最新版の文書が特定できない',
      '閲覧権限や機密区分を決められない',
      '評価質問がなく、検索品質を判断できない',
    ],
    relatedServices: [
      {
        label: 'RAGシステム構築',
        href: '/services/rag-system-development',
        description: '検索設計、評価、回答根拠、運用改善まで構築します。',
      },
      {
        label: '社内文書AI検索',
        href: '/services/internal-document-ai-search',
        description: '社内資料、規程、FAQを業務で使える検索導線へ落とします。',
      },
    ],
  },
  {
    slug: 'customer-data-foundation',
    href: '/situations/customer-data-foundation',
    navLabel: '顧客データを整理して使いたい',
    cardTitle: '顧客データを整理し、施策や分析に使える状態にしたい',
    title: '顧客データを、施策判断に使える状態へ。',
    description:
      'EC、CRM、広告、GA4、アプリログが分かれたままでは、誰に何を打つべきかを判断しにくくなります。',
    lead: 'まず見るのはツール選定ではなく、データの所在、キー、更新頻度、施策で使う項目です。',
    audience: 'マーケティング、事業責任者、データ分析、DX推進、CDP検討担当者',
    symptoms: [
      '部署ごとに違う顧客リストを見ている',
      'GA4、広告、CRM、購買データがつながらず施策の評価が難しい',
      'CDP製品を入れるべきか、自社基盤で足りるか判断できない',
    ],
    judgmentRows: [
      {
        label: 'データの所在',
        text: 'EC、CRM、広告、GA4、アプリDBなど、どこに何があるかを整理します。',
      },
      {
        label: '判断材料',
        text: '顧客キー、更新頻度、分析項目、施策連携、BI利用者を分けます。',
      },
      {
        label: '見送り条件',
        text: '同意管理、データ品質、施策利用者が未整理なら、基盤構築前に確認します。',
      },
    ],
    returnMaterials: [
      {
        title: 'データ棚卸し表',
        description: '取得元、項目、キー、更新頻度、利用目的を整理します。',
      },
      {
        title: '統合方針メモ',
        description: 'BigQueryなどの基盤、BI、施策ツール連携の前提を分けます。',
      },
      {
        title: '品質チェック項目',
        description: '欠損、重複、表記揺れ、同意管理、更新遅延を確認します。',
      },
    ],
    proof: {
      label: '実案件ログ',
      title: 'アプリ開発から購買データ分析、CDP構築まで一体で支援',
      description:
        '課金導線の改善に使えるデータをアプリ側から設計し、BigQuery分析とDatabricks on AWSのCDPへつなげました。',
      points: [
        'アプリDB、GA4などの分析前提を整理',
        '購買データから優良顧客層を特定',
        'LPと課金導線の改善に反映できる基盤へ接続',
      ],
    },
    rtbItems: [
      {
        label: '成果物サンプル',
        value: 'データ棚卸し表',
        description: '取得元、キー、項目、更新頻度、利用目的を一覧化します。',
      },
      {
        label: '判断材料',
        value: 'Before/After',
        description: '現状の分散状態と、統合後に見える指標を比較します。',
      },
      {
        label: '次に確認すること',
        value: '同意・品質チェック',
        description: 'データ利用の同意、欠損、重複、表記揺れを確認します。',
      },
    ],
    deferCriteria: [
      '顧客IDやメールアドレスなど統合キーが確認できない',
      'データ利用目的や同意管理が未整理',
      '施策で使う担当者や利用シーンが決まっていない',
    ],
    relatedServices: [
      {
        label: 'CDP構築・顧客データ基盤開発',
        href: '/services/cdp-development',
        description: 'BigQuery、BI、分析、施策連携まで使えるデータ基盤を構築します。',
      },
      {
        label: 'Web・モバイルアプリ開発',
        href: '/services/web-mobile-development',
        description: '後から分析できるよう、アプリ側のイベントとデータ設計から支援します。',
      },
    ],
  },
  {
    slug: 'stalled-project',
    href: '/situations/stalled-project',
    navLabel: '止まった開発・要件を立て直したい',
    cardTitle: '開発や要件定義が途中で止まり、次の打ち手を決めたい',
    title: '止まった開発を、再開できる単位へ分解する。',
    description:
      '要件、実装、インフラ、権限、意思決定のどこで詰まっているかを切り分け、再開に必要な材料へ戻します。',
    lead: '責任追及ではなく、残っている成果物、未決事項、再開条件を並べて現実的な打ち手にします。',
    audience: '進行中案件を引き継いだ担当者、情シス、事業責任者、開発会社の変更を検討する担当者',
    symptoms: [
      '前任者や外部パートナーの資料が残っているが、今の状態が分からない',
      '実装はあるのに、何が未完成で何を直すべきか判断できない',
      '追加発注、作り直し、縮小リリースのどれを選ぶべきか迷っている',
    ],
    judgmentRows: [
      {
        label: '現状棚卸し',
        text: '要件、画面、コード、インフラ、未決事項、契約範囲を分けて確認します。',
      },
      {
        label: '判断材料',
        text: '再開、縮小、作り直し、別案のどれが現実的かを比較します。',
      },
      {
        label: '見送り条件',
        text: '権限不足、成果物不足、事業判断の未決がある場合は、先に確認条件を出します。',
      },
    ],
    returnMaterials: [
      {
        title: '現状診断メモ',
        description: '使える成果物、危険な箇所、未決事項を整理します。',
      },
      {
        title: '再開スコープ',
        description: '最初に直す範囲、後回しにする範囲、必要な確認を分けます。',
      },
      {
        title: '概算レンジの再整理',
        description: '作り直しではなく、使える部分を踏まえた見積もり前提にします。',
      },
    ],
    proof: {
      label: '実案件ログ',
      title: '3ヶ月停滞した案件を、3週間で再開単位へ',
      description:
        '要件、実装、インフラを読み直し、どこから再開できるかを判断できる状態へ整理しました。',
      points: [
        '残っている成果物と未決事項を分離',
        '再開に必要な範囲と確認事項を整理',
        '次の開発単位と概算の前提を明確化',
      ],
    },
    rtbItems: [
      {
        label: '成果物サンプル',
        value: '現状診断メモ',
        description: '使える成果物、危険な箇所、未決事項を一覧化します。',
      },
      {
        label: '判断材料',
        value: '再開スコープ',
        description: '最初に触る範囲、保留する範囲、捨てる範囲を分けます。',
      },
      {
        label: '次に確認すること',
        value: '権限・契約・成果物',
        description: 'コード、インフラ、デザイン、契約範囲、運用権限を確認します。',
      },
    ],
    deferCriteria: [
      'コードやインフラへのアクセス権限がない',
      '契約上、成果物や設計資料を確認できない',
      '事業側で残す機能と捨てる機能を決められない',
    ],
    relatedServices: [
      {
        label: '要件定義から伴走する開発',
        href: '/services/requirements-definition-support',
        description: '既存資料や実装を読み直し、再開できる仕様へ整理します。',
      },
      {
        label: 'Web・モバイルアプリ開発',
        href: '/services/web-mobile-development',
        description: '既存実装の改修、再設計、縮小リリースまで対応します。',
      },
    ],
  },
];

export const featuredConsultationSituations = consultationSituations.slice(0, 7);

export const consultationNavigationItems = [
  { label: '相談が始まる場面一覧', href: consultationHub.href },
  ...consultationSituations.map((situation) => ({
    label: situation.navLabel,
    href: situation.href,
  })),
];

export const getConsultationSituation = (slug: string | undefined) =>
  consultationSituations.find((situation) => situation.slug === slug);
