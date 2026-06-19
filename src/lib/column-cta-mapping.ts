export type CtaItem = {
  href: string;
  label: string;
  description: string;
  ctaId: string;
};

export type CategoryCta = {
  primary: CtaItem;
  /** primary とは別の関連ツール (記事末で並べて出すかどうかは描画側の判断) */
  secondary?: CtaItem;
  /** 後方互換: 古いコードが直接 primaryHref などを参照していた場合のフォールバック */
  primaryHref: string;
  primaryLabel: string;
  primaryDescription: string;
  primaryCtaId: string;
};

const FLOW_MAPPER: CtaItem = {
  href: '/tools/flow-mapper',
  label: '業務フローを描いてみる',
  description: '現状（As-Is）と改善後（To-Be）を可視化して改善点を発見できます',
  ctaId: 'tool-flow-mapper',
};

const SCOPE_MANAGER: CtaItem = {
  href: '/tools/scope-manager',
  label: 'スコープから概算してみる',
  description: '要件を3軸で評価して「作る／後回し／作らない」を整理できます',
  ctaId: 'tool-scope-manager',
};

const STORY_BUILDER: CtaItem = {
  href: '/tools/story-builder',
  label: 'ユーザーストーリーを整理する',
  description: '誰が・何を・なぜ使うかを構造化して認識ズレを防げます',
  ctaId: 'tool-story-builder',
};

const PROOFFIRST: CtaItem = {
  href: '/prooffirst',
  label: 'ゼロスタートを詳しく見る',
  description: '初期費用0円で動くプロトタイプを体験できます',
  ctaId: 'prooffirst',
};

// 買い手意図カテゴリ向けのリード獲得CTA（ツールでなく相談・資料DLを主動線にする）
const ESTIMATE_CONSULT: CtaItem = {
  href: '/contact?intent=estimate',
  label: '開発費用を相談する（無料）',
  description:
    '要件と規模感をお伝えいただければ、概算の費用レンジと内訳の考え方を無料でご返信します',
  ctaId: 'consult-estimate',
};

const CDP_CONSULT: CtaItem = {
  href: '/contact?intent=cdp',
  label: 'CDP導入・選定を相談する',
  description:
    'Treasure Data・Salesforce CDP・BigQuery自社開発など、自社に合うCDPの選び方を無料でご相談いただけます',
  ctaId: 'consult-cdp',
};

const DOWNLOAD_DECK: CtaItem = {
  href: '/downloads/zero-start',
  label: 'サービス資料を無料ダウンロード',
  description:
    'ゼロスタート開発（初期費用0円で動くプロトタイプ）のサービス資料を無料配布しています',
  ctaId: 'download-zero-start',
};

function buildCta(primary: CtaItem, secondary?: CtaItem): CategoryCta {
  return {
    primary,
    secondary,
    primaryHref: primary.href,
    primaryLabel: primary.label,
    primaryDescription: primary.description,
    primaryCtaId: primary.ctaId,
  };
}

const DEFAULT_CTA: CategoryCta = buildCta(PROOFFIRST);

// キーは MicroCMS の実カテゴリ ID と一致させること。
// 買い手意図が強いカテゴリ（estimate-concerns / cdp-development）は、AI検索が見積もり・
// 費用・CDP比較の発注者を送り込む受け皿。主CTAをツールでなく相談・資料DL（リード獲得）にする。
const MAPPING: Record<string, CategoryCta> = {
  // プロジェクト管理: 業務洗い出し → スコープ整理（実務記事も混在するためツール主体のまま。
  // 買い手ページは本文内の意図別相談CTAで個別対応する）
  'project-management': buildCta(FLOW_MAPPER, SCOPE_MANAGER),
  // 見積もりの不安: 純買い手カテゴリ。費用相談を主、資料DLを副に
  'estimate-concerns': buildCta(ESTIMATE_CONSULT, DOWNLOAD_DECK),
  // コミュニケーション: ストーリー → スコープ整理
  communication: buildCta(STORY_BUILDER, SCOPE_MANAGER),
  // AI受託: 業務フロー → スコープ
  'ai-development': buildCta(FLOW_MAPPER, SCOPE_MANAGER),
  // CDP(顧客データ基盤): 買い手の比較・選定が中心。CDP相談を主、資料DLを副に
  // （旧 'cdp' キーは実カテゴリ ID 'cdp-development' と不一致で死んでいた）
  'cdp-development': buildCta(CDP_CONSULT, DOWNLOAD_DECK),
  // DX・AI導入: BPO見直し → 要件のたたき台
  dx: buildCta(FLOW_MAPPER, STORY_BUILDER),
};

export function getCategoryCta(categoryId: string | undefined): CategoryCta {
  if (!categoryId) return DEFAULT_CTA;
  return MAPPING[categoryId] ?? DEFAULT_CTA;
}
