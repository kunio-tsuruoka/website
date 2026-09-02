import type { ServiceDetail } from '@/types/service';
import { aiServicePageConfig } from './ai-service-page-config';
import { services } from './service';

export const RAG_SERVICE_DEFINITION =
  '株式会社Beekleは、社内文書や業務データを活用したい企業向けに、RAG・ハイブリッド検索・GraphRAGを、クラウド環境で要件定義から本番運用まで構築する開発会社です。';

export const ragDeploymentModes = [
  {
    title: 'Azure OpenAI Service',
    description:
      'Azureの利用方針に合わせ、既存の認証、ログ、データ保管ルールと接続したRAGシステムを構築します。',
  },
  {
    title: 'AWS Bedrock',
    description:
      'AWS上の業務システムやデータ保管先と接続し、検索基盤、回答画面、権限、運用監視まで構築します。',
  },
  {
    title: 'OpenAI・Anthropic API',
    description:
      '回答品質、応答時間、利用量、費用を実データで比較し、用途に合うモデルとAPI構成を選びます。',
  },
  {
    title: 'AWS・Azure・VPS上の検索基盤',
    description:
      'ベクトルDB、Neo4j等のグラフDB、検索API、業務画面を、既存環境と運用条件に合わせて配置します。',
  },
] as const;

export const ragPricingPhases = [
  {
    phase: '検証・PoC',
    price: '80万〜250万円',
    scope: '実データで検索方式、回答品質、権限、更新方法を検証',
  },
  {
    phase: '本番開発',
    price: '500万〜1,500万円',
    scope: '検索基盤、画面、認証、権限、ログ、既存システム連携まで実装',
  },
  {
    phase: '継続運用',
    price: '月20万〜100万円',
    scope: 'データ更新、精度評価、モデル変更、追加開発、運用監視',
  },
  {
    phase: '大規模・複雑な運用',
    price: '月120万円以上',
    scope: '複数基盤、高い可用性、継続的なAI・PM体制が必要な運用',
  },
] as const;

const baseRagService = services.find((item) => item.id === 'rag-system-development');

if (!baseRagService) {
  throw new Error('RAG service definition was not found');
}

export const ragService: ServiceDetail = {
  ...baseRagService,
  title: 'RAGシステム構築・GraphRAG開発',
  seoTitle: 'RAG構築・GraphRAG開発会社｜クラウドでPoCから本番運用まで',
  seoDescription:
    '株式会社Beekleは、社内文書・業務データ向けのRAG、ハイブリッド検索、GraphRAGをクラウド環境で構築します。要件定義、Neo4j・Milvus等の検索基盤、権限、評価、画面、本番運用まで一貫して対応します。',
  description: RAG_SERVICE_DEFINITION,
  longDescription:
    '社内文書検索、暗黙知の継承、問い合わせ対応、要件や設計判断の追跡に使うRAGを、要件定義から本番運用まで構築します。検索APIだけでなく、認証、権限、引用表示、評価、データ更新、監視、既存システム連携まで一つの開発範囲として引き受けます。',
  painPoints: [
    {
      title: '社内文書検索',
      description:
        '規程、マニュアル、議事録、製品仕様、過去資料を横断し、質問への回答と引用元を返す検索システムを構築します。',
    },
    {
      title: '属人化・暗黙知の継承',
      description:
        'ベテランの判断理由、例外対応、過去の経緯を、後任者が根拠付きで検索できる状態にします。',
    },
    {
      title: '問い合わせ対応の効率化',
      description:
        'FAQ、マニュアル、製品情報、過去の問い合わせ履歴から回答候補と根拠を提示します。回答できなかった質問はログに残し、ナレッジの不足箇所を特定して継続的に改善できる状態にします。',
    },
    {
      title: '要件・設計判断・変更影響の追跡',
      description:
        '要求、受入条件、設計判断、タスク、テストの関係を接続し、「なぜこの仕様になったか」「変更がどこへ影響するか」を検索できるようにします。',
    },
  ],
  solutions: [
    {
      title: '要件・正本・権限からRAGを設計する',
      description:
        '誰が何を質問し、どの情報を正本とし、どこまで閲覧できるかを先に決めます。データを一括投入する前に、回答、引用、アクセス制御の受入条件を定義します。',
      results: ['対象業務が明確になる', '古い版を参照しにくい', '権限外の検索を防げる'],
    },
    {
      title: '通常RAG・ハイブリッド検索・GraphRAGを実データで比較する',
      description:
        '全文、メタデータ、ベクトル、グラフの各検索を、同じ質問セットで比較します。通常RAGで必要な精度に届く場合は、運用負荷の高い構成を追加しません。',
      results: ['技術名ではなく結果で選べる', '過剰な構成を避けられる', '本番化の判断材料が残る'],
    },
    {
      title: '検索基盤から業務画面・運用まで一体で構築する',
      description:
        '検索APIだけで終わらせず、認証、引用表示、フィードバック、監査ログ、データ更新、既存システム連携、費用監視まで実装します。',
      results: ['現場が使う画面まで完成する', '情シスへ構成を説明できる', '導入後も精度を改善できる'],
    },
  ],
  features: [
    {
      title: '検索・回答基盤',
      description:
        '全文検索、メタデータ検索、ベクトル検索、リランキング、Neo4j等によるグラフ検索を、必要な質問に合わせて構成します。',
    },
    {
      title: '認証・アクセス制御・監査ログ',
      description:
        '利用者、部署、役職、文書単位のアクセス権を検索経路へ反映し、誰が何を参照したかを記録します。',
    },
    {
      title: '評価・継続改善',
      description:
        '実際の業務質問と正しい根拠から評価セットを作り、検索漏れ、誤回答、回答拒否、応答時間を同じ条件で測ります。',
    },
    {
      title: '既存システム連携と更新運用',
      description:
        '文書管理、業務システム、社内ポータルと接続し、追加・更新・削除を検索基盤へ反映します。',
    },
  ],
  benefits: [
    'クラウド環境でRAG・GraphRAGを構築できる',
    '社内文書と業務データを根拠付きで検索できる',
    '通常RAGで足りない質問だけGraphRAGで補える',
    '要件定義から本番運用まで同じ開発会社へ任せられる',
  ],
  faq: [
    {
      question: 'Azure OpenAI Serviceや既存のAzure環境を利用できますか？',
      answer:
        '利用できます。既存の認証基盤、ログ基盤、データ保管方針に合わせてAzure OpenAI ServiceとRAG基盤を接続します。クラウド契約をお客さま側で持つ構成にも対応します。',
    },
    {
      question: 'AWS Bedrock、OpenAI、AnthropicのAPIにも対応できますか？',
      answer:
        '対応できます。回答品質、応答時間、利用量、費用を同じ質問セットで比較し、対象業務に合うモデルとAPIを選びます。モデルを一社へ固定せず、用途ごとに使い分ける構成も可能です。',
    },
    {
      question: 'Neo4jを使ったナレッジグラフ・GraphRAGを構築できますか？',
      answer:
        '構築できます。Beekleは、カスタマーサポート向けのHybrid GraphRAGと、自社の要件管理システムで、Neo4jを使って文書、概念、判断、要件の関係を検索する仕組みを構築しています。',
    },
    {
      question: 'すでに構築したRAGの精度改善だけ依頼できますか？',
      answer:
        '依頼できます。検索漏れ、類似文書の混入、旧版参照、権限、リランキング、回答生成のどこで失敗しているかを評価セットで切り分けます。通常RAGの精度改善で足りる場合は、GraphRAGへ作り替えません。',
    },
    {
      question: '文書が整理されていない状態でも相談できますか？',
      answer:
        '相談できます。最初に正本、版、更新責任者、利用者、想定質問を整理します。古い文書や矛盾が回答品質を下げる場合は、RAG開発と文書管理のどちらを先に直すべきかを分けて提案します。',
    },
    {
      question: '部署や役職ごとにアクセス権が異なる文書も扱えますか？',
      answer:
        '扱えます。既存のユーザー、グループ、文書権限を検索時の絞り込みへ反映し、権限外の文書を取得・回答しないことをテストします。閲覧と質問の監査ログも残します。',
    },
    {
      question: 'RAGシステムの構築費用を教えてください',
      answer:
        '検証・PoCは80万〜250万円、本番開発は500万〜1,500万円、継続運用は月20万〜100万円が目安です。複数基盤や高い可用性、継続的なAI・PM体制が必要な運用は月120万円以上になる場合があります。対象データ、連携先、権限、必要な評価範囲を確認し、初回相談後に内訳付きで提示します。',
    },
    {
      question: '相談から本番運用まで、どのくらいかかりますか？',
      answer:
        '対象データの量、連携先、権限、評価質問の準備状況によって変わります。最初に検証範囲と完了条件を決め、PoCの結果を確認してから本番開発へ進みます。初回相談後に工程と判断時点を提示します。',
    },
  ],
  additionalSections: [],
};

const baseRagServicePageConfig = aiServicePageConfig['rag-system-development'];

export const ragServicePageConfig = {
  ...baseRagServicePageConfig,
  eyebrow: 'RAG・GraphRAGの発注先を探している企業へ',
  headline: ragService.title,
  heroLead: RAG_SERVICE_DEFINITION,
  primaryOutcome:
    '検索基盤だけでなく、認証、権限、回答画面、引用、評価、データ更新、運用監視まで一つの開発範囲として構築します。',
  contactIntent: 'rag-system-development',
  contactLabel: '自社のクラウド環境でRAG構築を相談する',
  showZeroStartLink: false,
  visualTitle: 'Beekleへ発注できる範囲',
  visualSubtitle: '要件定義から本番運用まで',
  visualItems: [
    '業務質問・正本・権限の整理',
    'RAG・GraphRAGの方式検証',
    '回答画面・引用・ログの実装',
    'データ更新・評価・運用監視',
  ],
  metrics: [
    { label: '対応環境', value: 'クラウド' },
    { label: '対応方式', value: 'RAG / GraphRAG' },
    { label: '担当範囲', value: '要件定義〜運用' },
  ],
};
