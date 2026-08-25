// src/types/service.ts

interface PainPoint {
  title: string;
  description: string;
}

interface Solution {
  title: string;
  description: string;
  results: string[];
}

interface CaseStudy {
  title: string;
  challenge: string;
  solution: string;
  results: string[];
  /** なぜBeekleだから実現できたか（任意）。1〜2文。事実の範囲で書く */
  whyUs?: string;
  /** 技術スタック・インフラ構成（任意）。`ラベル: 内容` 形式の文字列を推奨 */
  techStack?: string[];
  /**
   * 発注判断の裏側（任意）。顧客ヒアリングで事実が取れた事例にのみ記載する（推測で埋めない）。
   * ヒアリング項目は docs/program/case-hearing-template.md を参照
   */
  decision?: {
    /** 何社・何手段と比較したか */
    alternatives: string;
    /** 検討時に何が不安だったか */
    concerns: string;
    /** なぜBeekleを選んだか（決裁に効いた材料） */
    whyChosen: string;
  };
}

interface Feature {
  title: string;
  description: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface AdditionalSection {
  title: string;
  subtitle?: string;
  placement?: 'middle';
  paragraphs: string[];
  cards?: {
    title: string;
    description: string;
    link?: { href: string; label: string };
  }[];
}

interface RelatedColumn {
  slug: string;
  title: string;
  description?: string;
}

export interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  seoTitle?: string;
  seoDescription?: string;
  painPoints: PainPoint[];
  solutions: Solution[];
  caseStudies: CaseStudy[];
  features: Feature[];
  benefits: string[];
  faq: FAQ[];
  additionalSections?: AdditionalSection[];
  relatedColumns?: RelatedColumn[];
}
