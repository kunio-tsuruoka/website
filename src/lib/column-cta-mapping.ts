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
  /** 副動線: 資料DL／ゼロスタートLP のみ（任意）。ツールは使わない */
  secondary?: CtaItem;
  /** 後方互換: 古いコードが直接 primaryHref などを参照していた場合のフォールバック */
  primaryHref: string;
  primaryLabel: string;
  primaryDescription: string;
  primaryCtaId: string;
};

// ---- 副動線（LP・資料DL のみ。ツールは問い合わせに繋がらないため使わない） ----
const PROOFFIRST: CtaItem = {
  href: '/prooffirst',
  label: 'ゼロスタートを詳しく見る',
  description: '初期費用0円で動くプロトタイプから試せる「ゼロスタート開発」の詳細も見られます',
  ctaId: 'prooffirst',
};

const DOWNLOAD_DECK: CtaItem = {
  href: '/downloads/zero-start',
  label: 'サービス資料を無料ダウンロード',
  description:
    'ゼロスタート開発（初期費用0円で動くプロトタイプ）のサービス資料も無料配布しています',
  ctaId: 'download-zero-start',
};

// ---- 主動線（すべて /contact へのリード獲得）。intent はカテゴリ別に計測用で分ける ----
const AI_DEV_CONSULT: CtaItem = {
  href: '/contact?intent=ai-development',
  label: 'AI・RAG開発を相談する（無料）',
  description:
    '生成AI・RAG・ナレッジグラフの構築を、要件整理から本番化の判断まで無料でご相談いただけます',
  ctaId: 'consult-ai-development',
};

const PROJECT_CONSULT: CtaItem = {
  href: '/contact?intent=project',
  label: 'プロジェクトの進め方を相談する（無料）',
  description: '要件定義から開発・運用まで、進め方や体制のご相談を無料で承ります',
  ctaId: 'consult-project',
};

const COMM_CONSULT: CtaItem = {
  href: '/contact?intent=communication',
  label: '要件・認識合わせを相談する（無料）',
  description: '「何を作れば成功か」の整理や、発注側と開発側の認識合わせを無料でご相談いただけます',
  ctaId: 'consult-communication',
};

const DX_CONSULT: CtaItem = {
  href: '/contact?intent=dx',
  label: 'DX・AI導入を相談する（無料）',
  description: '業務の棚卸しからAI・システム導入の進め方まで、発注前のご相談を無料で承ります',
  ctaId: 'consult-dx',
};

const ESTIMATE_CONSULT: CtaItem = {
  href: '/contact?intent=estimate',
  label: '開発費用を相談する（無料）',
  description:
    '要件と規模感をお伝えいただければ、概算の費用レンジと内訳の考え方を無料でご返信します',
  ctaId: 'consult-estimate',
};

const CDP_CONSULT: CtaItem = {
  href: '/contact?intent=cdp',
  label: 'CDP導入・選定を相談する（無料）',
  description:
    'Treasure Data・Salesforce CDP・BigQuery自社開発など、自社に合うCDPの選び方を無料でご相談いただけます',
  ctaId: 'consult-cdp',
};

const GENAI_ADOPTION_CONSULT: CtaItem = {
  href: '/contact?intent=genai-adoption',
  label: '生成AI導入を相談する（無料）',
  description:
    'どの業務から始めるか・費用・セキュリティまで、生成AI導入の進め方を無料でご相談いただけます',
  ctaId: 'consult-genai-adoption',
};

const GENERAL_CONSULT: CtaItem = {
  href: '/contact?intent=general',
  label: 'Beekleに相談する（無料）',
  description: '企画・要件定義・開発・運用まで、発注側の判断材料が揃うように無料で伴走します',
  ctaId: 'consult-general',
};

const REQ_CONSULT: CtaItem = {
  href: '/contact?intent=requirements',
  label: '要件定義を相談する（無料）',
  description:
    '要件定義の進め方やドキュメントの書き方を、実際のプロジェクトに即して一緒に整理します',
  ctaId: 'consult-requirements',
};

const RFP_CONSULT: CtaItem = {
  href: '/contact?intent=rfp',
  label: 'RFP作成・見直しを相談する（無料）',
  description:
    'RFP（提案依頼書）の作成・見直しは代行実績があります。書き方や発注先の選定を無料でご相談いただけます',
  ctaId: 'consult-rfp',
};

// 情シス/技術部門（購買委員会のゲートキーパー）向け。セキュリティ・構成記事の読者を技術相談に変える。
const TECH_REVIEW_CONSULT: CtaItem = {
  href: '/contact?intent=tech-review',
  label: 'セキュリティ・構成の技術相談（無料）',
  description:
    '情報漏洩対策・自社環境で閉じる構成・既存システム連携・運用設計など、情報システム部門の技術的な懸念に無料でお答えします',
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
// 副動線は資料DL／ゼロスタートLP のみ。ツール（flow-mapper 等）は問い合わせに繋がらないため出さない
// （ユーザー指摘 2026-07-01 / content-strategy-goals）。
const MAPPING: Record<string, CategoryCta> = {
  'project-management': buildCta('プロジェクトの進め方、Beekleに相談しませんか？', PROJECT_CONSULT),
  'estimate-concerns': buildCta(
    '開発費用のこと、Beekleに相談しませんか？',
    ESTIMATE_CONSULT,
    DOWNLOAD_DECK
  ),
  communication: buildCta('要件・認識合わせ、Beekleに相談しませんか？', COMM_CONSULT),
  // 技術記事は買い手(A)＋同業(B)が読む。主=発注者向け相談、副=同業向け協業相談で両方を拾う。
  'ai-development': buildCta(
    'AI・RAG開発、Beekleに相談しませんか？',
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
    'CDP導入・選定、Beekleに相談しませんか？',
    CDP_CONSULT,
    DOWNLOAD_DECK
  ),
  dx: buildCta('DX・AI導入、Beekleに相談しませんか？', DX_CONSULT),
};

// 記事スラッグ単位の上書き。カテゴリより優先。
// AI検索が買い手を送り込む高インテント記事（Clarity AI Citations 上位）は、カテゴリの汎用CTAでなく
// クエリ意図に合った相談＋資料DLにする。project-management に入っている要件定義/RFP系が主対象。
const SLUG_CTA: Record<string, CategoryCta> = {
  'requirements-definition-template': buildCta(
    'この要件定義、Beekleと一緒に詰めませんか？',
    REQ_CONSULT,
    DOWNLOAD_DECK
  ),
  'requirements-definition-complete-guide': buildCta(
    '要件定義、Beekleに相談しませんか？',
    REQ_CONSULT,
    DOWNLOAD_DECK
  ),
  'requirements-definition-process': buildCta(
    '要件定義の進め方、Beekleに相談しませんか？',
    REQ_CONSULT,
    DOWNLOAD_DECK
  ),
  'requirements-vs-requests': buildCta(
    '要件定義、Beekleに相談しませんか？',
    REQ_CONSULT,
    DOWNLOAD_DECK
  ),
  'how-to-write-rfp': buildCta('RFP作成、Beekleに相談しませんか？', RFP_CONSULT, DOWNLOAD_DECK),
  'ai-development-cost-guide': buildCta(
    '開発費用のこと、Beekleに相談しませんか？',
    ESTIMATE_CONSULT,
    PARTNER_CONSULT
  ),
  // 情シスCEP記事（セキュリティ/インフラ/API構成）: 主=技術相談。副はB層も読む構成系はPARTNER、
  // セキュリティ系は資料DL（購買委員会の担当者が社内共有する材料）。
  'genai-security-governance': buildCta(
    'セキュリティの懸念、技術相談で解消しませんか？',
    TECH_REVIEW_CONSULT,
    DOWNLOAD_DECK
  ),
  'ai-security-privacy-guide': buildCta(
    'セキュリティの懸念、技術相談で解消しませんか？',
    TECH_REVIEW_CONSULT,
    DOWNLOAD_DECK
  ),
  'genai-system-infrastructure': buildCta(
    'インフラ構成、技術相談で壁打ちしませんか？',
    TECH_REVIEW_CONSULT,
    PARTNER_CONSULT
  ),
  'llm-api-system-design': buildCta(
    'LLM連携の構成、技術相談で壁打ちしませんか？',
    TECH_REVIEW_CONSULT,
    PARTNER_CONSULT
  ),
};

export function getCategoryCta(categoryId: string | undefined, slug?: string): CategoryCta {
  if (slug && SLUG_CTA[slug]) return SLUG_CTA[slug];
  if (!categoryId) return DEFAULT_CTA;
  return MAPPING[categoryId] ?? DEFAULT_CTA;
}
