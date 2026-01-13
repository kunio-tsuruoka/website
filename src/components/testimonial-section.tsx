// TestimonialsSection.tsx
import type React from 'react';
import { useState } from 'react';

// 型定義
interface Testimonial {
  id: number;
  name: string;
  role: string;
  image?: string;
  quote: string;
  rating: number;
}

interface StarRatingProps {
  rating: number;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

// テスティモニアルデータ
const testimonialData: Testimonial[] = [
  {
    id: 1,
    name: 'テックビーンズ前川様',
    role: 'COO',
    image: '/images/testimonials/user1.jpg',
    quote:
      'この度は当社のシステム開発プロジェクトを一緒に進めていただき、本当に助かりました！バックエンド・フロントエンド開発、ディレクション、顧客とのやり取りまで全部お任せしましたが、すべての面で期待以上の働きをしていただけました。特に印象に残っているのは、「言われたことをやる」というスタンスではなく、常に一歩先を考えて動いてくれたことです。正直なところ、今回のプロジェクトはスケジュールがかなりタイトでした。れでも、「あれもしたい、これも変えたい」という要望にも柔軟に対応してくれて、最終的には予定通りリリースまで持っていけたのは本当にすごいと思います。技術面はもちろん、コミュニケーションも上手で、専門的な話も分かりやすく説明してくれたおかげで、信頼も厚かったです。これからも色々なプロジェクトでお世話になりたいと思っています！！',
    rating: 5,
  },
  {
    id: 2,
    name: '檸檬デザイン事務所久田様',
    role: 'デザイナー',
    image: '/images/testimonials/user2.jpg',
    quote:
      'Webシステムの立ち上げに際し、こちらの会社にご相談させていただきました。Beekleのチームに対して感じたのは、ひとえに「完遂能力とコミットメントの高さ」です。要件定義の段階から丁寧にヒアリングを行っていただき、私たちの想いや業務内容を的確に汲み取って設計へ反映していただけた点が、非常に印象的でした。これまで、他の会社に依頼した際には、当初のヒアリング内容と異なる形で費用にズレが生じたり、開発自体が頓挫したりする経験もありました。しかし、Beekleに出会い、代表の強いリーダーシップとチームの高い推進力により、ユーザーにとって使いやすい画面設計を実現することができました。専門用語に不慣れな私たちの意見も上手に汲み取ってくださった点や、複数のパートナー企業との連携を含めたスムーズで信頼感のある進行管理も、高く評価しています。今後もWebやシステム関連のプロジェクトがあれば、ぜひまたお願いしたいと考えています。',
    rating: 5,
  },
  {
    id: 3,
    name: '阪本様',
    role: 'マーケター / コンテンツディレクター',
    image: '/images/testimonials/user2.jpg',
    quote:
      'マーケターとして関わっていたプロジェクトで、Beekleと協業しました。特に印象的だったのは、クライアントへの提案内容が本質的で、多面的な視点を持っていた点です。「何を作るか」だけではなく、開発を依頼した背景や事業の詳細まで細かくヒアリングを行い、顧客企業の強みを正確に把握したうえで、サービス運用段階でもその強みを最大限活かせる機能やロードマップを提案してくれました。ビジネスの視点で短期的な成果と中長期的な成長、さらには予算上の制約までを考慮しながらサービスの拡張性を確保できるのは、設計力や技術力の高さ、そして丁寧なコミュニケーションがあってこそだと感じました。また、デザインに関する知見も豊富で、マーケティング側からの要望もスムーズに理解して具体化してくれます。技術・デザイン・ビジネスそれぞれに対する深い理解と、それらをバランスよくまとめるセンス、プロジェクトへの真摯なコミットメントを兼ね備えている企業は貴重だと思います。機会があれば、ぜひまた一緒にプロジェクトに取り組みたいと考えています。',
    rating: 5,
  },
];

// 星評価を表示するコンポーネント（ブランドカラー：highlight-500）
const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, index) => (
        <svg
          key={index}
          className={`w-5 h-5 ${index < rating ? 'text-highlight-500' : 'text-neutral-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

// 個別のお客様の声カード（ブランドガイドライン準拠）
const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="bg-white rounded-[32px] shadow-soft p-6 flex flex-col h-full hover:shadow-medium transition-shadow">
      <div className="flex flex-col mb-3">
        <div>
          <h3 className="font-bold text-xl text-neutral-900">{testimonial.name}</h3>
          <p className="text-neutral-600 text-base">{testimonial.role}</p>
        </div>
      </div>
      <div className="mb-3">
        <StarRating rating={testimonial.rating} />
      </div>
      <p className="text-neutral-600 italic flex-grow text-base">"{testimonial.quote}"</p>
    </div>
  );
};

// メインのお客様の声セクション
const TestimonialSection: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const testimonialsPerPage: number = 3;
  const pageCount: number = Math.ceil(testimonialData.length / testimonialsPerPage);

  // ページネーション処理
  const handleNextPage = (): void => {
    setCurrentPage((prev) => (prev + 1) % pageCount);
  };

  const handlePrevPage = (): void => {
    setCurrentPage((prev) => (prev - 1 + pageCount) % pageCount);
  };

  // 現在のページの口コミを取得
  const currentTestimonials: Testimonial[] = testimonialData.slice(
    currentPage * testimonialsPerPage,
    (currentPage + 1) * testimonialsPerPage
  );

  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        {/* PC表示用グリッド */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {currentTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* モバイル表示用スライダー */}
        <div className="md:hidden">
          <div className="mb-5">
            <TestimonialCard testimonial={currentTestimonials[0]} />
          </div>
        </div>

        {/* ページネーションコントロール */}
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={handlePrevPage}
            className="p-1.5 rounded-full bg-white border border-neutral-200 hover:bg-accent-50 hover:border-accent-300 transition-colors"
            aria-label="前のページ"
          >
            <svg
              className="w-4 h-4 text-neutral-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex space-x-2">
            {[...Array(pageCount)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentPage === i ? 'bg-accent-600' : 'bg-neutral-300'
                }`}
                aria-label={`${i + 1}ページ目に移動`}
              />
            ))}
          </div>

          <button
            onClick={handleNextPage}
            className="p-1.5 rounded-full bg-white border border-neutral-200 hover:bg-accent-50 hover:border-accent-300 transition-colors"
            aria-label="次のページ"
          >
            <svg
              className="w-4 h-4 text-neutral-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
