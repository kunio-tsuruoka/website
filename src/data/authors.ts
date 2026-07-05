// src/data/authors.ts
// 記事の author / reviewedBy で参照する Person 情報
// JSON-LD の Person スキーマと members.astro 双方で利用する

export interface Author {
  id: string;
  name: string;
  jobTitle: string;
  description: string;
  url: string;
  sameAs?: string[];
  knowsAbout?: string[];
}

export const authors: Record<string, Author> = {
  tsuruoka: {
    id: 'tsuruoka',
    name: '鶴岡邦夫',
    jobTitle: '代表取締役社長 / エンジニア',
    description:
      'フリーランスエンジニアとしてシステム開発に従事した後、Beekle株式会社を創業。新規事業領域で要件定義からデザイン・実装まで一気通貫で担当。0-1から1-100フェーズまでのプロダクト開発、上流工程、システム設計、ITコンサルティングを得意とする。',
    url: 'https://beekle.jp/members#tsuruoka',
    sameAs: [
      'https://github.com/kunio-tsuruoka',
      'https://www.facebook.com/profile.php?id=100008095631404',
    ],
    knowsAbout: [
      'システム開発',
      'プロダクトマネジメント',
      '要件定義',
      'システム設計',
      'バックエンド開発',
      'フロントエンド開発',
      'ITコンサルティング',
    ],
  },
  nakamura: {
    id: 'nakamura',
    name: '中村 有貴',
    jobTitle: '外部技術顧問 / エンジニア',
    description:
      '中小規模SIerでキャリアをスタートし、エンジニア・プログラマーとして20年の実務経験を持つ。香港の日系企業に所属しながら、個人事業として複数の日本企業の開発に技術顧問・実装の両面で参画。Vue.js/Nuxt.js/React/Node.js/TypeScript/Go/PHP(Laravel・Symfony)/Ruby on RailsからAWSインフラまで横断的にカバーし、システム設計レビューを専門領域とする。Beekleでは外部技術顧問として全コラム記事の技術監修を担当。若手エンジニアのメンター活動も継続している。',
    url: 'https://beekle.jp/members#nakamura',
    sameAs: ['https://github.com/ynaka6', 'https://nakamu.me/', 'https://www.shien.tech/'],
    knowsAbout: [
      'Vue.js',
      'Nuxt.js',
      'React',
      'Node.js',
      'TypeScript',
      'Golang',
      'PHP (Laravel/Symfony)',
      'Ruby on Rails',
      'AWS',
      'システム設計レビュー',
    ],
  },
  sato: {
    id: 'sato',
    name: '佐藤 瑛隆',
    jobTitle: 'データサイエンティスト',
    description:
      '京都大学理学研究科数学・数理解析専攻修了。株式会社RUTILEAにてAIソリューション開発のチーフエンジニアを経験後、アクセンチュア株式会社でデータサイエンティストとして統計モデル・機械学習を用いたSCM領域のDX支援に従事。現在はフリーランスとしてデータ分析、企業向け研修、教材制作支援を行う。Beekleでは生成AI・ナレッジグラフ・CDP関連コラムの技術監修を担当。',
    url: 'https://beekle.jp/members',
    knowsAbout: [
      'データサイエンス',
      '統計モデル',
      '機械学習',
      'Python',
      'AI開発',
      'RAG',
      'ナレッジグラフ',
      'SCM最適化',
      '確率解析',
    ],
  },
};

export const defaultAuthor = authors.tsuruoka;
export const defaultReviewer = authors.nakamura;

export const categoryReviewerMap: Record<string, string> = {
  'ai-development': 'sato',
  'cdp-development': 'sato',
  'genai-adoption': 'sato',
  knowledge: 'sato',
};

// スラッグ単位の監修者上書き（カテゴリより優先）。
// knowledge カテゴリのうち要件エンジニアリング(EARS/Gherkin)系はPM・システム開発領域のため
// データサイエンティストの佐藤でなく中村(既定の技術監修)に据え置く。
export const slugReviewerMap: Record<string, string> = {
  'ears-gherkin-workflow': 'nakamura',
  'gherkin-bdd-introduction': 'nakamura',
  'ears-requirements-syntax-guide': 'nakamura',
};
