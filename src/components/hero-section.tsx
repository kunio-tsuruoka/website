import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const proofPoints = ['ヒアリングから要件化', 'PM on Railsで実装・テスト', '導入・運用まで一気通貫'];

export const HeroSection = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative min-h-[calc(100vh-88px)] overflow-hidden bg-accent-950 pt-20">
      <img
        src="/images/prototype-review-hero.webp"
        alt="業務フローを見ながら動くプロトタイプを確認するチーム"
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-accent-950 via-accent-950/86 to-accent-950/18" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-accent-950 to-transparent" />

      <div className="container relative mx-auto flex min-h-[calc(100vh-88px)] items-center px-8 py-16 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-soft backdrop-blur">
            ヒアリング → 要件化 → 実装 → テスト → 導入
          </span>

          <h1 className="mt-6 text-3xl font-bold leading-tight text-white md:text-5xl xl:text-6xl">
            業務を聞く。
            <br />
            <span className="text-secondary-300">仕様に変える。</span>
            <br />
            動かす。
            <br />
            導入する。
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl">
            Beekleは、AI・Webアプリ・業務システムを「コンサルします」「要件を整理します」で終わらせません。
            自社開発のPM基盤「PM on
            Rails」で、ヒアリング内容を要求・受入条件・開発タスクへつなぎ、そのままAIエージェントで実装・テスト。現場導入と運用まで一気通貫で進めます。
          </p>

          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {proofPoints.map((item) => (
              <div
                key={item}
                className="flex min-h-14 items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-bold text-accent-950 shadow-soft"
              >
                <CheckCircle2 className="h-5 w-5 flex-none text-secondary-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-9 flex flex-col gap-4 sm:flex-row"
          >
            <a
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              href="/contact?source=home-hero"
              data-cta-source="home-hero"
              data-cta-id="contact"
              className="page-cta group inline-flex items-center justify-center rounded-full bg-primary-500 px-8 py-4 text-lg font-semibold text-white shadow-soft transition-all hover:bg-primary-600 hover:shadow-medium"
            >
              業務課題を相談する
              <motion.div animate={{ x: isHovered ? 5 : 0 }} transition={{ duration: 0.2 }}>
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.div>
            </a>
            <a
              href="/prooffirst"
              className="inline-flex items-center justify-center rounded-full border-2 border-white bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white hover:text-accent-950"
            >
              ゼロスタートを見る
            </a>
          </motion.div>

          <p className="mt-5 text-sm leading-relaxed text-white/70">
            AI導入、社内業務アプリ、顧客データ活用など、要件が固まっていない段階から相談できます。
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
