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

const MAPPING: Record<string, CategoryCta> = {
  // プロジェクト管理: 業務洗い出し → スコープ整理の流れ
  'project-management': buildCta(FLOW_MAPPER, SCOPE_MANAGER),
  // 見積もり懸念: スコープから概算 → ゼロスタート相談
  'estimate-concerns': buildCta(SCOPE_MANAGER, STORY_BUILDER),
  // コミュニケーション: ストーリー → スコープ整理
  communication: buildCta(STORY_BUILDER, SCOPE_MANAGER),
  // 要件定義: ストーリー → スコープ
  'requirements-definition': buildCta(STORY_BUILDER, SCOPE_MANAGER),
  // 業務改善・DX: 業務フロー → ストーリー
  'business-improvement': buildCta(FLOW_MAPPER, STORY_BUILDER),
  // AI受託: 業務フロー → スコープ
  'ai-development': buildCta(FLOW_MAPPER, SCOPE_MANAGER),
  // CDP: 業務フロー → スコープ
  cdp: buildCta(FLOW_MAPPER, SCOPE_MANAGER),
  // DX・AI導入: BPO見直し → 要件のたたき台
  dx: buildCta(FLOW_MAPPER, STORY_BUILDER),
};

export function getCategoryCta(categoryId: string | undefined): CategoryCta {
  if (!categoryId) return DEFAULT_CTA;
  return MAPPING[categoryId] ?? DEFAULT_CTA;
}
