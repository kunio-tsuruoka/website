export type CtaItem = {
  href: string;
  label: string;
  description: string;
  ctaId: string;
};

export type CategoryCta = {
  /** 記事末セクションの見出し（相談喚起） */
  heading: string;
  /** 主動線: 常に問い合わせ（/contact）などリード獲得アクションにする */
  primary: CtaItem;
  /** 副動線: 直接DL資料／ゼロスタートLP のみ（任意）。ツールは使わない */
  secondary?: CtaItem;
  /** 後方互換: 古いコードが直接 primaryHref などを参照していた場合のフォールバック */
  primaryHref: string;
  primaryLabel: string;
  primaryDescription: string;
  primaryCtaId: string;
};

// ---- 副動線（LP・直接DL資料のみ。ツールは問い合わせに繋がらないため使わない） ----
const PROOFFIRST: CtaItem = {
  href: '/prooffirst',
  label: 'ゼロスタートを詳しく見る',
  description: '初期費用0円で動くプロトタイプから試せる「ゼロスタート開発」の詳細も見られます',
  ctaId: 'prooffirst',
};

const DOWNLOAD_DECK: CtaItem = {
  href: '/downloads/beekle-zero-start-sales-deck.pdf',
  label: 'サービス資料を無料ダウンロード',
  description:
    'ゼロスタート開発（初期費用0円で動くプロトタイプ）のサービス資料を直接ダウンロードできます',
  ctaId: 'pdf-zero-start-sales-deck',
};

// ---- 主動線（すべて /contact へのリード獲得）。intent はカテゴリ別に計測用で分ける ----
const AI_DEV_CONSULT: CtaItem = {
  href: '/contact?intent=ai-development',
  label: '社内資料を使ったAI開発を相談する（無料）',
  description:
    '社内資料や業務データを使ったAI開発について、何から始めるか、社内で使える形にできるかを無料でご相談いただけます',
  ctaId: 'consult-ai-development',
};

const PROJECT_CONSULT: CtaItem = {
  href: '/contact?intent=project',
  label: 'プロジェクトの進め方を相談する（無料）',
  description: '作るものの整理から開発後の運用まで、進め方や体制のご相談を無料で承ります',
  ctaId: 'consult-project',
};

const COMM_CONSULT: CtaItem = {
  href: '/contact?intent=communication',
  label: '作りたいものの整理を相談する（無料）',
  description:
    '現場の要望が多くてまとまらない、開発会社にうまく伝わらない状態から無料でご相談いただけます',
  ctaId: 'consult-communication',
};

const DX_CONSULT: CtaItem = {
  href: '/contact?intent=dx',
  label: '業務改善・AI導入を相談する（無料）',
  description: '業務の棚卸しからAI・システム導入の進め方まで、発注前のご相談を無料で承ります',
  ctaId: 'consult-dx',
};

const ESTIMATE_CONSULT: CtaItem = {
  href: '/contact?intent=estimate',
  label: '開発費用を相談する（無料）',
  description:
    '作りたい内容と規模感をお伝えいただければ、概算の費用レンジと内訳の考え方を無料でご返信します',
  ctaId: 'consult-estimate',
};

const CDP_CONSULT: CtaItem = {
  href: '/contact?intent=cdp',
  label: '顧客データの整理・活用を相談する（無料）',
  description:
    '顧客情報や購買履歴が散らばっている状態から、何をまとめ、どう活用するかを無料でご相談いただけます',
  ctaId: 'consult-cdp',
};

const GENAI_ADOPTION_CONSULT: CtaItem = {
  href: '/contact?intent=genai-adoption',
  label: 'AI導入をPoCで終わらせない進め方を相談する',
  description:
    'どの業務から始めるか、何をもって使えると判断するか、社内説明に必要な材料まで整理します',
  ctaId: 'consult-genai-adoption',
};

const GENERAL_CONSULT: CtaItem = {
  href: '/contact?intent=general',
  label: 'Beekleに相談する（無料）',
  description: '何を作るべきか、どこまで費用をかけるべきか、発注前の不安を無料で整理します',
  ctaId: 'consult-general',
};

const REQ_CONSULT: CtaItem = {
  href: '/contact?intent=requirements',
  label: '作るものの整理を相談する（無料）',
  description: '要望メモや既存資料をもとに、開発会社へ伝えられる形まで一緒に整理します',
  ctaId: 'consult-requirements',
};

const RFP_CONSULT: CtaItem = {
  href: '/contact?intent=rfp',
  label: '提案依頼書の作成・見直しを相談する（無料）',
  description:
    '開発会社に何を依頼すればよいか、比較しやすい依頼書になっているかを無料でご相談いただけます',
  ctaId: 'consult-rfp',
};

// 情シス/技術部門向け。セキュリティ記事の読者を技術相談に変える。
const TECH_REVIEW_CONSULT: CtaItem = {
  href: '/contact?intent=tech-review',
  label: '社内データや既存システムの不安を相談する（無料）',
  description:
    '社外にデータを出せない、既存システムとつながるか不安、運用できるか心配といった点を無料で確認します',
  ctaId: 'consult-tech-review',
};

// 同業（開発会社・SIer・コンサルのテック側）向け。技術記事を「実装力の見極め」で読むB層の受け皿。
const PARTNER_CONSULT: CtaItem = {
  href: '/contact?intent=partner',
  label: '開発会社・SIer様の協業相談',
  description:
    '開発リソースの逼迫・難航案件の立て直し・AI活用開発の知見をお探しの開発会社／SIer様のご相談も承ります',
  ctaId: 'consult-partner',
};

const REQ_TEMPLATE_CONSULT: CtaItem = {
  href: '/contact?intent=requirements-template',
  label: 'テンプレを自社向けに整理する',
  description:
    '空欄のまま止まりやすい目的、作る範囲、必要な機能、運用条件を、自社案件に合わせて整理し、発注に足りない論点を返します',
  ctaId: 'consult-requirements-template',
};

const REQ_GUIDE_CONSULT: CtaItem = {
  href: '/contact?intent=requirements-guide',
  label: '作るものを一緒に整理する',
  description:
    '現場から要望は出ているが何から作るべきか決めきれない段階で、最初に決めることを整理します',
  ctaId: 'consult-requirements-guide',
};

const REQ_PROCESS_CONSULT: CtaItem = {
  href: '/contact?intent=requirements-process',
  label: '誰に何を聞くべきか整理する',
  description:
    '現場、決裁者、開発会社に何を確認すればよいか、打ち合わせ前に質問リストと進め方を整理します',
  ctaId: 'consult-requirements-process',
};

const REQ_CONVERSION_CONSULT: CtaItem = {
  href: '/contact?intent=requirements-conversion',
  label: '要望メモを発注要件にする',
  description:
    '「こうしたい」という現場要望を、開発会社に伝わり、見積もりや提案依頼に使える形へ整理します',
  ctaId: 'consult-requirements-conversion',
};

const RFP_REVIEW_CONSULT: CtaItem = {
  href: '/contact?intent=pm-on-rails-rfp',
  label: 'RFPを出す前に論点を確認する',
  description:
    'RFPやAs-Isの業務整理をもとに、提案が比較不能になりそうな前提、受入条件、見積もり範囲の抜けを確認します',
  ctaId: 'consult-pm-on-rails-rfp',
};

const COST_BREAKDOWN_CONSULT: CtaItem = {
  href: '/contact?intent=cost-breakdown',
  label: '見積もりの高い・安いを確認する',
  description: '見積書の金額が妥当か、足りない項目や後から増えそうな費用がないかを一緒に確認します',
  ctaId: 'consult-cost-breakdown',
};

const QUOTE_COMPARISON_CONSULT: CtaItem = {
  href: '/contact?intent=quote-comparison',
  label: '複数社の見積もりを比べる',
  description:
    '総額だけで選んでよいか不安なときに、前提条件、体制、テスト、保守、追加費用の違いを整理します',
  ctaId: 'consult-quote-comparison',
};

const AI_COST_CONSULT: CtaItem = {
  href: '/contact?intent=pm-on-rails-ai-cost',
  label: 'AI開発の費用前提を整理する',
  description:
    'PoCだけの金額で判断せず、評価、データ、権限、運用まで含めて、見積もり前に確認すべき前提を整理します',
  ctaId: 'consult-pm-on-rails-ai-cost',
};

const PM_ON_RAILS_REQUIREMENTS_CONSULT: CtaItem = {
  href: '/contact?intent=pm-on-rails-requirements',
  label: 'RFP・As-Isを送って論点をもらう',
  description:
    'RFP、現状業務（As-Is）、議事録をもとに、最初のユースケース候補、抜けやすい受入条件、優先順位の論点を返します',
  ctaId: 'consult-pm-on-rails-requirements',
};

const PM_ON_RAILS_COST_CONSULT: CtaItem = {
  href: '/contact?intent=pm-on-rails-cost',
  label: '見積もり前提を整理する',
  description:
    'RFP、要件、既存見積もりから、範囲、非機能、運用、後から増えやすい費用の前提を整理します',
  ctaId: 'consult-pm-on-rails-cost',
};

const PM_ON_RAILS_RAG_CONSULT: CtaItem = {
  href: '/contact?intent=pm-on-rails-rag',
  label: 'RAGを業務で使える形にする',
  description:
    '社内資料、想定質問、根拠、権限、評価基準を分けて、RAGで作るべき範囲と本番化の判断材料を確認します',
  ctaId: 'consult-pm-on-rails-rag',
};

const GENAI_START_CONSULT: CtaItem = {
  href: '/contact?intent=genai-adoption',
  label: 'AI導入をPoCで止めない進め方を相談する',
  description:
    'どの業務から始め、何をもって使えると判断し、社内説明に必要な材料をどう揃えるかを整理します',
  ctaId: 'consult-genai-adoption',
};

const GENAI_ROI_CONSULT: CtaItem = {
  href: '/contact?intent=genai-roi',
  label: '費用対効果を相談する',
  description: '導入費だけでなく、運用費、削減できる作業時間、社内承認に必要な説明まで整理します',
  ctaId: 'consult-genai-roi',
};

const CDP_SELECTION_CONSULT: CtaItem = {
  href: '/contact?intent=cdp-selection',
  label: 'CDP選定の前提を整理する',
  description:
    'Treasure Data、Salesforce、BigQuery、自社開発などを選ぶ前に、統合対象データ、施策ユースケース、運用制約を整理します',
  ctaId: 'consult-cdp-selection',
};

const RAG_FIT_CONSULT: CtaItem = {
  href: '/contact?intent=rag-fit',
  label: '社内資料をAIで探せるか相談する',
  description:
    'PDF、マニュアル、規程、FAQなどをもとに、社員が質問して答えを探せる仕組みにできるか確認します',
  ctaId: 'consult-rag-fit',
};

const RAG_ACCURACY_CONSULT: CtaItem = {
  href: '/contact?intent=rag-accuracy',
  label: 'AI回答を業務で使える精度に近づける',
  description:
    '回答ミスの原因を、検索、生成、評価データ、権限設計に分け、社内利用前に直すべき論点を確認します',
  ctaId: 'consult-rag-accuracy',
};

const DX_WORKFLOW_CONSULT: CtaItem = {
  href: '/contact?intent=dx-workflow',
  label: '業務改善をどこから始めるか相談する',
  description:
    '紙、Excel、二重入力、担当者しか分からない業務を洗い出し、AIやシステムで軽くできる範囲を整理します',
  ctaId: 'consult-dx-workflow',
};

const AI_REQ_CONSULT: CtaItem = {
  href: '/contact?intent=ai-requirements',
  label: 'AIに何を任せるか整理する',
  description: 'どの業務をAIに任せ、どこから人に引き継ぐべきか。発注前に決めておくことを整理します',
  ctaId: 'consult-ai-requirements',
};

function buildCta(heading: string, primary: CtaItem, secondary?: CtaItem): CategoryCta {
  return {
    heading,
    primary,
    secondary,
    primaryHref: primary.href,
    primaryLabel: primary.label,
    primaryDescription: primary.description,
    primaryCtaId: primary.ctaId,
  };
}

const DEFAULT_CTA: CategoryCta = buildCta(
  'この内容について、Beekleに相談してみませんか？',
  GENERAL_CONSULT,
  PROOFFIRST
);

// キーは MicroCMS の実カテゴリ ID と一致させること。
// 方針（2026-07-01）: 記事末の主CTAは常に「相談」= リード獲得。
// 副動線は直接DL資料／ゼロスタートLP のみ。ツール（flow-mapper 等）は問い合わせに繋がらないため出さない
// （ユーザー指摘 2026-07-01 / content-strategy-goals）。
const MAPPING: Record<string, CategoryCta> = {
  'project-management': buildCta('プロジェクトの進め方、Beekleに相談しませんか？', PROJECT_CONSULT),
  'estimate-concerns': buildCta(
    '開発費用のこと、Beekleに相談しませんか？',
    ESTIMATE_CONSULT,
    DOWNLOAD_DECK
  ),
  communication: buildCta('作りたいものの整理、Beekleに相談しませんか？', COMM_CONSULT),
  // 技術記事は買い手(A)＋同業(B)が読む。主=発注者向け相談、副=同業向け協業相談で両方を拾う。
  'ai-development': buildCta(
    '社内資料を使ったAI開発、Beekleに相談しませんか？',
    AI_DEV_CONSULT,
    PARTNER_CONSULT
  ),
  knowledge: buildCta('この技術、Beekleに相談しませんか？', GENERAL_CONSULT, PARTNER_CONSULT),
  // 生成AI導入カテゴリ（導入の進め方・社内課題）。主=導入相談、副=ゼロスタート資料DL（担当者が上を説得する材料）。
  'genai-adoption': buildCta(
    '生成AI導入、Beekleに相談しませんか？',
    GENAI_ADOPTION_CONSULT,
    DOWNLOAD_DECK
  ),
  'cdp-development': buildCta(
    '顧客データの整理・活用、Beekleに相談しませんか？',
    CDP_CONSULT,
    DOWNLOAD_DECK
  ),
  dx: buildCta('業務改善・AI導入、Beekleに相談しませんか？', DX_CONSULT),
};

// 記事スラッグ単位の上書き。カテゴリより優先。
// AI検索が買い手を送り込む高インテント記事（Clarity AI Citations 上位）は、カテゴリの汎用CTAでなく
// クエリ意図に合った相談＋資料DLにする。project-management に入っている発注準備系が主対象。
const SLUG_CTA: Record<string, CategoryCta> = {
  'requirements-definition-template': buildCta(
    'テンプレートはある。でも、自社向けにどう埋めるかで止まっていませんか？',
    REQ_TEMPLATE_CONSULT,
    DOWNLOAD_DECK
  ),
  'requirements-definition-complete-guide': buildCta(
    'RFPやAs-Isから、最初の論点を返します',
    PM_ON_RAILS_REQUIREMENTS_CONSULT,
    DOWNLOAD_DECK
  ),
  'requirements-definition-process': buildCta(
    '打ち合わせ前に、誰へ何を聞くべきか整理しませんか？',
    REQ_PROCESS_CONSULT,
    DOWNLOAD_DECK
  ),
  'requirements-vs-requests': buildCta(
    '現場の要望を、発注できる要件に変えませんか？',
    REQ_CONVERSION_CONSULT,
    DOWNLOAD_DECK
  ),
  'how-to-write-rfp': buildCta(
    'RFPを出す前に、比較不能になりそうな前提を確認しませんか？',
    RFP_REVIEW_CONSULT,
    DOWNLOAD_DECK
  ),
  'ai-development-cost-guide': buildCta(
    'AI開発の見積もり、PoCだけの金額になっていませんか？',
    AI_COST_CONSULT,
    PARTNER_CONSULT
  ),
  'genai-roi-investment': buildCta(
    'AI導入が費用に見合うか、社内で説明できますか？',
    GENAI_ROI_CONSULT,
    DOWNLOAD_DECK
  ),
  'ai-era-development-flow': buildCta(
    'AI導入を試しただけで終わらせず、社内説明できる形にしませんか？',
    GENAI_START_CONSULT,
    DOWNLOAD_DECK
  ),
  'ai-factcheck': buildCta(
    'AIの回答を社内で信用して使えるか、確認しませんか？',
    RAG_ACCURACY_CONSULT,
    PARTNER_CONSULT
  ),
  'rag-evaluation': buildCta(
    'AIの回答ミスを減らせるか、業務利用の前に確認しませんか？',
    RAG_ACCURACY_CONSULT,
    PARTNER_CONSULT
  ),
  'ai-knowledge-chatbot-accuracy': buildCta(
    '社内資料をもとに、信用できる回答を返せるか相談しませんか？',
    RAG_ACCURACY_CONSULT,
    PARTNER_CONSULT
  ),
  'system-development-cost-breakdown': buildCta(
    '見積もり前に、RFP・As-Isから前提を揃えませんか？',
    PM_ON_RAILS_COST_CONSULT,
    DOWNLOAD_DECK
  ),
  'system-estimate-validity': buildCta(
    'この見積もりで進めて大丈夫か、不安が残っていませんか？',
    COST_BREAKDOWN_CONSULT,
    DOWNLOAD_DECK
  ),
  'quote-comparison-checklist': buildCta(
    '安い見積もりを選んでよいか、迷っていませんか？',
    QUOTE_COMPARISON_CONSULT,
    DOWNLOAD_DECK
  ),
  'cdp-product-comparison': buildCta(
    '顧客データが散らばって、何を選べばよいか迷っていませんか？',
    CDP_SELECTION_CONSULT,
    DOWNLOAD_DECK
  ),
  'what-is-rag': buildCta(
    'RAGで作る前に、業務で使える基準を決めませんか？',
    PM_ON_RAILS_RAG_CONSULT,
    PARTNER_CONSULT
  ),
  'ai-rag-accuracy-graphrag': buildCta(
    'AIの回答が信用できず、社内利用に踏み切れずにいませんか？',
    RAG_ACCURACY_CONSULT,
    PARTNER_CONSULT
  ),
  'ai-requirements-definition': buildCta(
    'AIに何を任せるか決めきれず、発注前で止まっていませんか？',
    AI_REQ_CONSULT,
    DOWNLOAD_DECK
  ),
  // 情シス向け記事（セキュリティ/インフラ/連携）: 主=技術相談。副はB層も読む技術系はPARTNER、
  // セキュリティ系は資料DL（購買委員会の担当者が社内共有する材料）。
  'genai-security-governance': buildCta(
    '社内データをAIに使って大丈夫か、不安を整理しませんか？',
    TECH_REVIEW_CONSULT,
    DOWNLOAD_DECK
  ),
  'ai-security-privacy-guide': buildCta(
    '社内データをAIに使って大丈夫か、不安を整理しませんか？',
    TECH_REVIEW_CONSULT,
    DOWNLOAD_DECK
  ),
  'genai-system-infrastructure': buildCta(
    '既存システムとAIをつなげられるか、確認しませんか？',
    TECH_REVIEW_CONSULT,
    PARTNER_CONSULT
  ),
  'llm-api-system-design': buildCta(
    'AI連携で失敗しそうな点を、先に確認しませんか？',
    TECH_REVIEW_CONSULT,
    PARTNER_CONSULT
  ),
  'dx-josys-ai-era-requirements': buildCta(
    '紙・Excel・属人作業を、どこから見直すか整理しませんか？',
    DX_WORKFLOW_CONSULT,
    DOWNLOAD_DECK
  ),
  'dx-josys-as-is-bpo-guide': buildCta(
    '今の業務を見える化して、改善できる範囲を整理しませんか？',
    DX_WORKFLOW_CONSULT,
    DOWNLOAD_DECK
  ),
  'dx-josys-tobe-redesign': buildCta(
    '作る前に、業務改善案が本当に現場で使えるか確認しませんか？',
    DX_WORKFLOW_CONSULT,
    DOWNLOAD_DECK
  ),
};

export function getCategoryCta(categoryId: string | undefined, slug?: string): CategoryCta {
  if (slug && SLUG_CTA[slug]) return SLUG_CTA[slug];
  if (!categoryId) return DEFAULT_CTA;
  return MAPPING[categoryId] ?? DEFAULT_CTA;
}
