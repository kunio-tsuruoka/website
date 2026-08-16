// お客様の声を「長文の感想置き場」ではなく、開発方法のClaimを支える証拠として見せる
// (tasks-v3 TASK-P1-01 / [MKT-1] 問題→過程→結果を含むVoiceほどProofとして機能する)。
// shortQuote は必ず fullQuote からの逐語抜粋にする（要約・改変しない）。
import type React from 'react';
import { useState } from 'react';

const CATEGORIES = [
  '要件定義',
  'Scope・優先順位',
  'PM・推進',
  '開発速度',
  '業務理解',
  'コミュニケーション',
  '他社・外部パートナー連携',
] as const;

type Category = (typeof CATEGORIES)[number];

interface Testimonial {
  id: number;
  name: string;
  role: string;
  categories: Category[];
  shortQuote: string;
  meaning: string;
  fullQuote: string;
  /** 対応が確認できているCaseのみリンクする（勝手に結びつけない） */
  caseHref?: string;
}

const testimonialData: Testimonial[] = [
  {
    id: 1,
    name: '森一真様',
    role: '株式会社iroAI 代表取締役',
    categories: ['Scope・優先順位', 'PM・推進'],
    shortQuote:
      'PoC段階で優先すべき機能と、あえて今は不要な機能を明確に整理・提案していただき、効率的な開発ロードマップを描くことができました',
    meaning: '要望をそのまま作らず、PoCで確かめる範囲と後回しにする範囲を分けて進めた',
    caseHref: '/case-studies',
    fullQuote:
      '弊社のLINEミニアプリ開発にあたり、PoC（概念実証）の依頼をさせていただきました。開発過程では、PoC段階で優先すべき機能と、あえて今は不要な機能を明確に整理・提案していただき、効率的な開発ロードマップを描くことができました。プロジェクト管理も非常に強固です。代表自らが全体を統括し、現場への的確な指示と期日を遵守するコミットメントの高さにより、最後までスケジュールが揺らぐことはありませんでした。過去に他社への開発依頼で苦い経験があり、当初は非常に慎重になっていましたが、代表との対話を通じて、こちらの意図を深く汲み取ってくれる誠実な姿勢に触れ、「この方なら任せても大丈夫だ」と確信に変わりました。密なコミュニケーションが生む安心感は、何物にも代えがたいものです。同社を選んだ判断は間違いなかったと心から満足しています。今後も良きパートナーとして、共に歩んでいきたいと思っています。',
  },
  {
    id: 2,
    name: 'テックビーンズ前川様',
    role: 'COO',
    categories: ['開発速度', 'PM・推進'],
    shortQuote:
      'バックエンド・フロントエンド開発、ディレクション、顧客とのやり取りまで全部お任せしましたが、すべての面で期待以上の働きをしていただけました',
    meaning:
      '実装からディレクション・顧客対応までを一体で担い、タイトな日程でも予定どおりリリースした',
    fullQuote:
      'この度は当社のシステム開発プロジェクトを一緒に進めていただき、本当に助かりました！バックエンド・フロントエンド開発、ディレクション、顧客とのやり取りまで全部お任せしましたが、すべての面で期待以上の働きをしていただけました。特に印象に残っているのは、「言われたことをやる」というスタンスではなく、常に一歩先を考えて動いてくれたことです。正直なところ、今回のプロジェクトはスケジュールがかなりタイトでした。れでも、「あれもしたい、これも変えたい」という要望にも柔軟に対応してくれて、最終的には予定通りリリースまで持っていけたのは本当にすごいと思います。技術面はもちろん、コミュニケーションも上手で、専門的な話も分かりやすく説明してくれたおかげで、信頼も厚かったです。これからも色々なプロジェクトでお世話になりたいと思っています！！',
  },
  {
    id: 3,
    name: '檸檬デザイン事務所久田様',
    role: 'デザイナー',
    categories: ['要件定義', '他社・外部パートナー連携'],
    shortQuote:
      '要件定義の段階から丁寧にヒアリングを行っていただき、私たちの想いや業務内容を的確に汲み取って設計へ反映していただけた',
    meaning:
      '他社で費用のズレや頓挫を経験した後、要件定義のヒアリングと複数パートナー連携の進行管理を評価いただいた',
    fullQuote:
      'Webシステムの立ち上げに際し、こちらの会社にご相談させていただきました。Beekleのチームに対して感じたのは、ひとえに「完遂能力とコミットメントの高さ」です。要件定義の段階から丁寧にヒアリングを行っていただき、私たちの想いや業務内容を的確に汲み取って設計へ反映していただけた点が、非常に印象的でした。これまで、他の会社に依頼した際には、当初のヒアリング内容と異なる形で費用にズレが生じたり、開発自体が頓挫したりする経験もありました。しかし、Beekleに出会い、代表の強いリーダーシップとチームの高い推進力により、ユーザーにとって使いやすい画面設計を実現することができました。専門用語に不慣れな私たちの意見も上手に汲み取ってくださった点や、複数のパートナー企業との連携を含めたスムーズで信頼感のある進行管理も、高く評価しています。今後もWebやシステム関連のプロジェクトがあれば、ぜひまたお願いしたいと考えています。',
  },
  {
    id: 4,
    name: '阪本様',
    role: 'マーケター / コンテンツディレクター',
    categories: ['業務理解', 'Scope・優先順位'],
    shortQuote:
      '「何を作るか」だけではなく、開発を依頼した背景や事業の詳細まで細かくヒアリングを行い、顧客企業の強みを正確に把握した',
    meaning: '機能要望ではなく事業背景から入り、予算制約まで含めたロードマップを提案した',
    fullQuote:
      'マーケターとして関わっていたプロジェクトで、Beekleと協業しました。特に印象的だったのは、クライアントへの提案内容が本質的で、多面的な視点を持っていた点です。「何を作るか」だけではなく、開発を依頼した背景や事業の詳細まで細かくヒアリングを行い、顧客企業の強みを正確に把握したうえで、サービス運用段階でもその強みを最大限活かせる機能やロードマップを提案してくれました。ビジネスの視点で短期的な成果と中長期的な成長、さらには予算上の制約までを考慮しながらサービスの拡張性を確保できるのは、設計力や技術力の高さ、そして丁寧なコミュニケーションがあってこそだと感じました。また、デザインに関する知見も豊富で、マーケティング側からの要望もスムーズに理解して具体化してくれます。技術・デザイン・ビジネスそれぞれに対する深い理解と、それらをバランスよくまとめるセンス、プロジェクトへの真摯なコミットメントを兼ね備えている企業は貴重だと思います。機会があれば、ぜひまた一緒にプロジェクトに取り組みたいと考えています。',
  },
  {
    id: 5,
    name: '十亀弘様',
    role: '株式会社Ｅジャパン 代表取締役',
    categories: ['コミュニケーション', '業務理解'],
    shortQuote:
      'こちらの知識レベルに合わせて、寄り添ってくれたため安心感を持ってプロジェクトを進めることができました',
    meaning: '専門知識の差を埋めながら進行し、発注者が安心して判断できる状態を保った',
    fullQuote:
      '自社の課題に対して親身に話を聞いてくれました。共にプロジェクトを成功させようとする熱意を感じました。こちらの知識レベルに合わせて、寄り添ってくれたため安心感を持ってプロジェクトを進めることができました。プロフェッショナルな仕事ぶりに非常に満足しています。',
  },
];

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-[32px] shadow-soft p-6 md:p-8 flex flex-col h-full hover:shadow-medium transition-shadow">
      <div className="flex flex-wrap gap-2 mb-4">
        {testimonial.categories.map((c) => (
          <span
            key={c}
            className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-600"
          >
            {c}
          </span>
        ))}
      </div>

      <blockquote className="text-base md:text-lg font-medium text-neutral-800 leading-relaxed">
        「{testimonial.shortQuote}」
      </blockquote>

      <div className="mt-4 rounded-xl bg-neutral-50 p-4">
        <p className="text-xs font-bold text-primary-500 mb-1">この声が示すこと</p>
        <p className="text-sm text-neutral-700 leading-relaxed">{testimonial.meaning}</p>
      </div>

      <div className="mt-4 flex-grow">
        {expanded && (
          <p className="text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-4">
            {testimonial.fullQuote}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-primary-500 hover:text-primary-600"
        >
          {expanded ? '全文を閉じる' : '全文を見る'}
          <svg
            className={`w-4 h-4 ml-1 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {testimonial.caseHref && (
          <a
            href={testimonial.caseHref}
            className="inline-flex min-h-[44px] items-center text-sm font-semibold text-primary-500 hover:text-primary-600"
          >
            この案件の事例を見る
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        )}
      </div>

      <div className="mt-5 border-t border-neutral-100 pt-4">
        <p className="font-bold text-neutral-900">{testimonial.name}</p>
        <p className="text-sm text-neutral-600">{testimonial.role}</p>
      </div>
    </div>
  );
};

const TestimonialSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');

  const visible =
    activeCategory === 'all'
      ? testimonialData
      : testimonialData.filter((t) => t.categories.includes(activeCategory));

  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeCategory === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary-300'
            }`}
          >
            すべて
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeCategory === c
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {visible.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
        {visible.length === 0 && (
          <p className="text-center text-neutral-500 text-sm">この分類の声はまだありません。</p>
        )}
      </div>
    </section>
  );
};

export default TestimonialSection;
