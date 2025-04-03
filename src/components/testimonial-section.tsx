// TestimonialsSection.tsx
import React, { useState } from 'react';

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
    name: '前川様',
    role: 'COO',
    image: '/images/testimonials/user1.jpg',
    quote: 'この度は当社のシステム開発プロジェクトを一緒に進めていただき、本当に助かりました！バックエンド・フロントエンド開発、ディレクション、顧客とのやり取りまで全部お任せしましたが、すべての面で期待以上の働きをしていただけました。特に印象に残っているのは、「言われたことをやる」というスタンスではなく、常に一歩先を考えて動いてくれたことです。正直なところ、今回のプロジェクトはスケジュールがかなりタイトでした。れでも、「あれもしたい、これも変えたい」という要望にも柔軟に対応してくれて、最終的には予定通りリリースまで持っていけたのは本当にすごいと思います。技術面はもちろん、コミュニケーションも上手で、専門的な話も分かりやすく説明してくれたおかげで、信頼も厚かったです。これからも色々なプロジェクトでお世話になりたいと思っています！！',
    rating: 5
  },
];

// 星評価を表示するコンポーネント
const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, index) => (
        <svg
          key={index}
          className={`w-5 h-5 ${
            index < rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
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

// 個別のお客様の声カード
const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 flex flex-col h-full">
      <div className="flex flex-col mb-3">
        <div>
          <h3 className="font-bold text-lg">{testimonial.name}</h3>
          <p className="text-gray-600 text-sm">{testimonial.role}</p>
        </div>
      </div>
      <div className="mb-3">
        <StarRating rating={testimonial.rating} />
      </div>
      <p className="text-gray-700 italic flex-grow text-sm">"{testimonial.quote}"</p>
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
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">お客様の声</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Beekleをご利用いただいているお客様からの貴重なフィードバックをご紹介します。皆様の満足がサービス向上の原動力です。
          </p>
        </div>

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
            className="p-1.5 rounded-full bg-white border border-gray-300 hover:bg-gray-100"
            aria-label="前のページ"
          >
            <svg
              className="w-4 h-4 text-gray-600"
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
                className={`w-2 h-2 rounded-full ${
                  currentPage === i ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                aria-label={`${i + 1}ページ目に移動`}
              />
            ))}
          </div>
          
          <button
            onClick={handleNextPage}
            className="p-1.5 rounded-full bg-white border border-gray-300 hover:bg-gray-100"
            aria-label="次のページ"
          >
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;