import { services } from '@/data/service';
import type { ServiceDetail } from '@/types/service';

export type SituationLpContent = {
  slug: string;
  capabilitiesLead: string;
  capabilities: { title: string; description: string }[];
  strengthsLead: string;
  strengths: { title: string; description: string }[];
  caseStudyRefs: { serviceId: string; caseIndex: number }[];
  deepDiveLinks: { label: string; href: string; description: string }[];
};

export const situationLpContents: SituationLpContent[] = [
  {
    slug: 'requirements-unclear',
    capabilitiesLead:
      '要件定義だけを納品して終わるのではなく、社内合意、見積もり比較、動くデモ、実装まで必要なところをつなげます。',
    capabilities: [
      {
        title: '要件定義・業務整理',
        description:
          '利用者、業務フロー、制約、権限、例外処理を分け、何を作るかを社内で説明できる状態にします。',
      },
      {
        title: '動くデモ・MVP・PoC',
        description:
          '文章だけでは決めにくい部分を、画面や操作で確認できるプロトタイプへ落とします。',
      },
      {
        title: 'RFP・見積もり比較の前提整理',
        description:
          '各社の見積もり範囲が揃うよう、対象、前提、含まないもの、概算レンジを整理します。',
      },
      {
        title: '受入条件・テスト観点',
        description:
          '完成後に「思っていたものと違う」を減らすため、何ができれば合格かを先に決めます。',
      },
    ],
    strengthsLead:
      '曖昧な相談をきれいな資料へ整えるだけでなく、判断できる形と、実際に動く形まで持っていけることが強みです。',
    strengths: [
      {
        title: '会話を実装できる単位まで分ける',
        description:
          '目的、利用者、具体的な利用場面、受入条件へ分け、開発者が迷いにくい要求へ変換します。',
      },
      {
        title: '最短1日で動く確認材料を作る',
        description:
          '長い会議を重ねる前に、見て触れるデモを作り、足りない情報と優先順位を早く確かめます。',
      },
      {
        title: '決めた内容を実装・テストまでつなぐ',
        description:
          '要件定義会社と開発会社を分けず、確認した内容を同じ文脈のまま実装とテストへ渡します。',
      },
    ],
    caseStudyRefs: [
      { serviceId: 'requirements-definition-support', caseIndex: 0 },
      { serviceId: 'mvp-poc-development', caseIndex: 0 },
      { serviceId: 'ai-development', caseIndex: 0 },
    ],
    deepDiveLinks: [
      {
        label: '全事例を見る',
        href: '/case-studies',
        description: '課題、実装、成果、発注判断の裏側まで確認できます。',
      },
      {
        label: 'Beekleの開発方法を見る',
        href: '/strengths',
        description: '要件定義から実装・テストまでを切らずに進める方法を紹介します。',
      },
    ],
  },
  {
    slug: 'ai-adoption',
    capabilitiesLead:
      '生成AIを入れること自体を目的にせず、問い合わせ、検索、帳票入力、判断、作業実行のどこへ使うかを分けて設計します。',
    capabilities: [
      {
        title: 'AIチャットボット・カスタマーサポートAI',
        description:
          '回答できる質問、人へ引き継ぐ質問、改善に使う会話ログまで含めて設計します。',
      },
      {
        title: 'RAG・GraphRAGによる社内文書検索',
        description:
          '社内資料、規程、FAQ、製品情報を、回答根拠と参照元を確認できる検索へ変えます。',
      },
      {
        title: 'OCR・帳票AI',
        description:
          '請求書、申込書、注文書などを読み取り、確認画面と後続システムへの連携まで作ります。',
      },
      {
        title: 'AIエージェント・業務自動化',
        description:
          '情報収集、作成、照合、登録などの作業を、権限、承認、二重実行防止を含めて自動化します。',
      },
    ],
    strengthsLead:
      'AIのデモだけではなく、実データで効果を測り、既存システムへつなぎ、本番で使えるかまで判断します。',
    strengths: [
      {
        title: '業務課題から方式を選ぶ',
        description:
          'チャットボット、検索、OCR、エージェントを先に決めず、どの業務負担を減らすかから選びます。',
      },
      {
        title: '実データでGo・No-Goを決める',
        description:
          '精度、削減時間、確認工数、速度、費用を測り、基準未達なら無理に本開発へ進めません。',
      },
      {
        title: 'AIと通常システムを一緒に作る',
        description:
          '生成AI部分だけでなく、画面、権限、データベース、外部連携、ログ、運用まで一貫して実装します。',
      },
    ],
    caseStudyRefs: [
      { serviceId: 'ai-development', caseIndex: 0 },
      { serviceId: 'rag-system-development', caseIndex: 0 },
      { serviceId: 'ai-agent-development', caseIndex: 0 },
    ],
    deepDiveLinks: [
      {
        label: 'AI開発の事例を見る',
        href: '/case-studies',
        description: 'AIをどの業務へ載せ、何を評価し、どこまで本番化したかを確認できます。',
      },
      {
        label: 'AI開発の強みを見る',
        href: '/strengths',
        description: '業務整理、実データ検証、実装、運用までの進め方を紹介します。',
      },
    ],
  },
  {
    slug: 'business-systemization',
    capabilitiesLead:
      'Excelや紙をそのまま画面へ置き換えるのではなく、通常処理、例外処理、承認、権限、現場機器まで含めて業務システムを作ります。',
    capabilities: [
      {
        title: 'Web・モバイル業務システム',
        description:
          '現場入力、管理画面、スマートフォン・タブレット対応まで、利用場所に合わせて開発します。',
      },
      {
        title: '申請・承認・ワークフロー',
        description:
          '申請、差し戻し、承認、通知、締め処理を、担当者の記憶に依存しない流れへ変えます。',
      },
      {
        title: '顧客・受注・在庫・案件管理',
        description:
          '複数の表やメールに散らばった情報を、一つの業務データと操作履歴へまとめます。',
      },
      {
        title: 'スキャン・印刷・外部API連携',
        description:
          'バーコード、スキャナー、プリンター、既存基幹システム、外部サービスまで現場の流れへ接続します。',
      },
    ],
    strengthsLead:
      '画面だけを作るのではなく、現場で止まりやすい例外や機器制約まで拾い、使われるところまで実装します。',
    strengths: [
      {
        title: '現場の例外を要件へ入れる',
        description:
          '通常の流れだけでなく、差し戻し、締め後の修正、担当不在、通信不良などを具体的な利用場面で確認します。',
      },
      {
        title: '要件定義からフルスタックで実装する',
        description:
          '業務整理、画面、サーバー、データベース、外部連携、クラウド運用まで一つのチームで進めます。',
      },
      {
        title: '開発速度で総工数を抑える',
        description:
          'AIを前提に要件、実装、テストをつなぎ、同じ予算で確認と改善へ使える時間を増やします。',
      },
    ],
    caseStudyRefs: [
      { serviceId: 'web-mobile-development', caseIndex: 0 },
      { serviceId: 'requirements-definition-support', caseIndex: 0 },
      { serviceId: 'ai-development', caseIndex: 0 },
    ],
    deepDiveLinks: [
      {
        label: '業務システムの事例を見る',
        href: '/case-studies',
        description: '現場課題、実装範囲、成果、技術構成まで確認できます。',
      },
      {
        label: 'Beekleの強みを見る',
        href: '/strengths',
        description: '要件が曖昧な段階から本番運用まで引き受ける理由を紹介します。',
      },
    ],
  },
  {
    slug: 'legacy-system-modernization',
    capabilitiesLead:
      '古いシステムを全部作り直すのではなく、現行仕様を読み解き、必要な機能から段階的に刷新します。',
    capabilities: [
      {
        title: 'リバースエンジニアリング・仕様復元',
        description:
          '画面、ソースコード、データベース、定期処理、外部連携、実運用から現行仕様を復元します。',
      },
      {
        title: '段階的なレガシーシステム刷新',
        description:
          '機能、部署、データ単位で切り分け、旧システムと並行運用しながら安全に置き換えます。',
      },
      {
        title: 'データ移行・API連携',
        description:
          '移行対象、変換ルール、照合方法、停止時間を決め、既存サービスとの接続も維持します。',
      },
      {
        title: '保守しやすいWebシステムへの再構築',
        description:
          '変更理由と確認条件を残し、刷新後の改修や引き継ぎがしやすい構成へ変えます。',
      },
    ],
    strengthsLead:
      '調査だけを別工程にせず、読み解いた仕様をそのまま実装とテストへ接続するため、伝言と再調査を減らせます。',
    strengths: [
      {
        title: '資料がなくても実物から読み解く',
        description:
          '古い設計書だけに頼らず、実際の画面、コード、データ、利用者の操作を突き合わせます。',
      },
      {
        title: '残す・変える・捨てるを分ける',
        description:
          '使われていない機能まで再実装せず、業務価値と移行リスクから投資範囲を決めます。',
      },
      {
        title: 'PM on Railsから実装・テストへつなぐ',
        description:
          '復元した利用場面と確認条件を構造化し、AIエージェントによる再実装と新旧比較へ使います。',
      },
    ],
    caseStudyRefs: [
      { serviceId: 'web-mobile-development', caseIndex: 0 },
      { serviceId: 'requirements-definition-support', caseIndex: 0 },
      { serviceId: 'mvp-poc-development', caseIndex: 0 },
    ],
    deepDiveLinks: [
      {
        label: 'システム開発の事例を見る',
        href: '/case-studies',
        description: '業務理解から実装・運用まで担当した案件を確認できます。',
      },
      {
        label: '開発方法を見る',
        href: '/strengths',
        description: '仕様を復元し、変更理由とテストまでつなぐ進め方を紹介します。',
      },
    ],
  },
  {
    slug: 'internal-document-search',
    capabilitiesLead:
      '社内資料を生成AIへ入れるだけで終わらせず、検索方式、回答根拠、閲覧権限、更新運用まで含めて構築します。',
    capabilities: [
      {
        title: '社内文書AI検索',
        description:
          '規程、マニュアル、議事録、FAQ、PDFを横断し、答えと参照元を同時に表示します。',
      },
      {
        title: 'RAG・GraphRAGシステム',
        description:
          '全文検索、意味検索、文書構造、情報同士の関係を質問に応じて組み合わせます。',
      },
      {
        title: 'FAQ・問い合わせ対応チャットボット',
        description:
          '社内ヘルプデスクや顧客対応で、回答できる範囲と人へ引き継ぐ条件を設計します。',
      },
      {
        title: '権限・出典・更新管理',
        description:
          '部署別の閲覧権限、最新版の扱い、引用箇所、検索ログ、改善手順まで実装します。',
      },
    ],
    strengthsLead:
      '検索技術の名前から入らず、実際の質問で答えられるか、根拠が正しいか、運用できるかを先に確かめます。',
    strengths: [
      {
        title: '評価質問を先に作る',
        description:
          'よく聞かれる質問、間違えると困る質問、根拠が必要な質問を用意し、方式を比較します。',
      },
      {
        title: '質問ごとに検索方法を使い分ける',
        description:
          '単純な全文検索で足りるものから、複数検索やGraphRAGが必要なものまで過剰構成を避けます。',
      },
      {
        title: '回答後の業務まで実装する',
        description:
          '出典表示、権限制御、人への引き継ぎ、更新、評価ログまで本番運用へ組み込みます。',
      },
    ],
    caseStudyRefs: [
      { serviceId: 'rag-system-development', caseIndex: 0 },
      { serviceId: 'internal-document-ai-search', caseIndex: 0 },
      { serviceId: 'ai-chatbot-development', caseIndex: 0 },
    ],
    deepDiveLinks: [
      {
        label: 'RAG・AI検索の事例を見る',
        href: '/case-studies',
        description: '検索方式、評価、回答根拠、業務への組み込み方を確認できます。',
      },
      {
        label: 'AI開発の強みを見る',
        href: '/strengths',
        description: 'データ整理から評価・本番運用まで一貫して進める方法を紹介します。',
      },
    ],
  },
  {
    slug: 'customer-data-foundation',
    capabilitiesLead:
      '顧客データを集めるだけではなく、誰に何をするか、施策や経営判断へ使えるデータ基盤を作ります。',
    capabilities: [
      {
        title: 'CDP・顧客データ統合',
        description:
          'EC、CRM、広告、問い合わせ、契約、アプリ利用データを顧客単位でつなぎます。',
      },
      {
        title: 'BigQuery・Databricksへのデータ接続',
        description:
          'アプリのデータベースや各種サービスを分析基盤へつなぎ、横断して質問・集計できる状態にします。',
      },
      {
        title: 'GA4・アプリ行動イベント設計',
        description:
          'ページ閲覧だけでなく、利用開始、完了、離脱、継続など、事業判断に必要な行動を記録します。',
      },
      {
        title: 'ダッシュボード・施策連携',
        description:
          '顧客分類、営業管理、メール、広告、通知、事業指標へデータを戻し、次の行動へつなげます。',
      },
    ],
    strengthsLead:
      '基盤を作って終わらず、どの判断や施策へ使うかから逆算し、アプリ側の記録方法まで実装します。',
    strengths: [
      {
        title: '使う問いからデータを決める',
        description:
          '誰が、何を判断し、どの施策を変えるのかを先に置き、不要なデータ収集を増やしません。',
      },
      {
        title: 'アプリ・データ基盤・分析を一緒に作る',
        description:
          '画面やデータベースの設計から、収集、統合、可視化、施策への書き戻しまで対応します。',
      },
      {
        title: '問い合わせから売上まで追える形にする',
        description:
          'アクセスやクリックだけで終わらせず、顧客管理の商談、案件、受注データまで接続します。',
      },
    ],
    caseStudyRefs: [
      { serviceId: 'cdp-development', caseIndex: 0 },
      { serviceId: 'web-mobile-development', caseIndex: 0 },
      { serviceId: 'ai-development', caseIndex: 0 },
    ],
    deepDiveLinks: [
      {
        label: 'データ活用の事例を見る',
        href: '/case-studies',
        description: 'データ統合、アプリ開発、業務への接続まで担当した事例を確認できます。',
      },
      {
        label: 'Beekleの開発方法を見る',
        href: '/strengths',
        description: '事業の問いからデータとシステムを設計する進め方を紹介します。',
      },
    ],
  },
  {
    slug: 'stalled-project',
    capabilitiesLead:
      '止まった理由を会議だけで推測せず、要求、コード、データ、テスト、インフラ、体制を確認し、再開できる単位へ分けます。',
    capabilities: [
      {
        title: '現状調査・コードレビュー',
        description:
          'ソースコード、設計、課題一覧、変更履歴、テスト、クラウド構成を確認し、事実を整理します。',
      },
      {
        title: '要件・スコープの再定義',
        description:
          '必須、後回し、廃止、未確認を分け、誰が何を決めれば再開できるかを明確にします。',
      },
      {
        title: '引き継ぎ・立て直し開発',
        description:
          '既存コードを活かす範囲と作り直す範囲を決め、優先度の高い機能から実装を再開します。',
      },
      {
        title: 'テスト・CI・運用の再構築',
        description:
          '動作確認、回帰テスト、自動検査、障害通知、リリース手順を整え、再び止まりにくい状態にします。',
      },
    ],
    strengthsLead:
      '報告書だけを作るのではなく、止まった原因を実物で確認し、必要なら同じチームがそのまま修正と再開まで担当します。',
    strengths: [
      {
        title: 'コードと実際の動作から事実を取る',
        description:
          '説明資料だけに頼らず、動いている箇所、壊れている箇所、未実装、技術的負債を確認します。',
      },
      {
        title: '直す・残す・後回しを分ける',
        description:
          '全部を作り直す前提にせず、事業上必要な範囲と安全に変更できる順番を決めます。',
      },
      {
        title: '調査から再実装まで切らない',
        description:
          '原因を見つけたチームが要求、実装、テスト、リリースまで持つため、引き継ぎの再説明を減らします。',
      },
    ],
    caseStudyRefs: [
      { serviceId: 'requirements-definition-support', caseIndex: 0 },
      { serviceId: 'web-mobile-development', caseIndex: 0 },
      { serviceId: 'mvp-poc-development', caseIndex: 0 },
    ],
    deepDiveLinks: [
      {
        label: '開発・立て直しの事例を見る',
        href: '/case-studies',
        description: '要件整理、既存コードの改善、本番運用まで進めた事例を確認できます。',
      },
      {
        label: 'Beekleの強みを見る',
        href: '/strengths',
        description: '要件定義、実装、テストを同じチームで進める方法を紹介します。',
      },
    ],
  },
];

export function getSituationLpContent(slug?: string): SituationLpContent | undefined {
  return situationLpContents.find((content) => content.slug === slug);
}

export function resolveSituationCaseStudies(
  content: SituationLpContent
): ServiceDetail['caseStudies'] {
  return content.caseStudyRefs.flatMap(({ serviceId, caseIndex }) => {
    const service = services.find((item) => item.id === serviceId);
    const caseStudy = service?.caseStudies[caseIndex];
    return caseStudy ? [caseStudy] : [];
  });
}
