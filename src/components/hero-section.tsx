import { ArrowDown } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-gray-50 pt-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">技術を用いて人を幸せに</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12">
          Beekleは、お客様のビジネスに寄り添ったマーケティング・情報設計・デザイン・開発等トータルサポートを行います。
        </p>
        <div className="animate-bounce">
          <ArrowDown className="h-8 w-8 mx-auto text-purple-700" />
        </div>
      </div>
    </section>
  );
}
