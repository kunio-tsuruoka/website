type ServiceHeroCopy = {
  headline: string;
  heroLead: string;
  contactLabel: string;
};

type SituationHeroCopy = {
  title: string;
  lead: string;
  contactLabel: string;
};

const serviceHeroCopy: Record<string, Partial<ServiceHeroCopy>> = {
  'web-mobile-development': {
    headline:
      '開発会社を何社もつながず、要件が曖昧な段階から公開後まで一つのチームで進める。',
    heroLead:
      '要件整理、設計、実装、審査、運用を分断しません。事業責任者が伝言と調整ではなく、次に何を作るかの判断へ集中できる状態を作ります。',
    contactLabel: '開発の進め方を整理する',
  },
  'mvp-poc-development': {
    headline: '数百万円を投じる前に、小さく動かして本開発の価値を確かめる。',
    heroLead:
      'アイデアを触れる形にし、顧客に使われるか、技術的に成立するか、どこまで作るべきかを判断できる材料を揃えます。',
    contactLabel: '発注前に検証範囲を決める',
  },
};

const situationHeroCopy: Record<string, Partial<SituationHeroCopy>> = {
  'business-systemization': {
    title: 'ベテランが休んでも、業務が止まらない仕組みへ。',
    lead:
      '紙、Excel、チャット、担当者の記憶に散らばった判断を整理し、誰でも同じ流れで仕事を進められる状態を作ります。',
    contactLabel: '属人業務を整理する',
  },
  'legacy-system-modernization': {
    title: '改修のたびに増える調査費を止め、業務を止めずに古いシステムを刷新する。',
    lead:
      '今も使われている機能だけを読み解き、不要な再実装と移行リスクを減らします。全面刷新を前提にせず、費用対効果の高い範囲から移します。',
    contactLabel: '刷新範囲を整理する',
  },
};

export const resolveServiceHeroCopy = (
  serviceId: string,
  fallback: ServiceHeroCopy
): ServiceHeroCopy => {
  const override = serviceHeroCopy[serviceId];

  return {
    headline: override?.headline ?? fallback.headline,
    heroLead: override?.heroLead ?? fallback.heroLead,
    contactLabel: override?.contactLabel ?? fallback.contactLabel,
  };
};

export const resolveSituationHeroCopy = (
  slug: string,
  fallback: SituationHeroCopy
): SituationHeroCopy => {
  const override = situationHeroCopy[slug];

  return {
    title: override?.title ?? fallback.title,
    lead: override?.lead ?? fallback.lead,
    contactLabel: override?.contactLabel ?? fallback.contactLabel,
  };
};
