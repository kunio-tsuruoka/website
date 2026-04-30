export type CategoryCta = {
  primaryHref: string;
  primaryLabel: string;
  primaryDescription: string;
  primaryCtaId: string;
};

const DEFAULT_CTA: CategoryCta = {
  primaryHref: '/prooffirst',
  primaryLabel: 'ゼロスタートを詳しく見る',
  primaryDescription: '初期費用0円で動くプロトタイプを体験できます',
  primaryCtaId: 'prooffirst',
};

const MAPPING: Record<string, CategoryCta> = {
  'project-management': {
    primaryHref: '/tools/flow-mapper',
    primaryLabel: '業務フローを描いてみる',
    primaryDescription: '現状(As-Is)と目指す姿(To-Be)を可視化して改善点を発見できます',
    primaryCtaId: 'tool-flow-mapper',
  },
  'estimate-concerns': {
    primaryHref: '/tools/scope-manager',
    primaryLabel: 'スコープから概算してみる',
    primaryDescription: '要件を3軸で評価して「作る/後回し/作らない」を整理できます',
    primaryCtaId: 'tool-scope-manager',
  },
  communication: {
    primaryHref: '/tools/story-builder',
    primaryLabel: 'ユーザーストーリーを整理する',
    primaryDescription: '誰が何のために使うのかを構造化して認識ズレを防げます',
    primaryCtaId: 'tool-story-builder',
  },
};

export function getCategoryCta(categoryId: string | undefined): CategoryCta {
  if (!categoryId) return DEFAULT_CTA;
  return MAPPING[categoryId] ?? DEFAULT_CTA;
}
