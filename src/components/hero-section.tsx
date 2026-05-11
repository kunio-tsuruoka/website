import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

export const HeroSection = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative min-h-[calc(100vh-120px)] lg:mx-12 pt-20">
      <div className="relative mt-20 rounded-[48px] border border-navy-950/10 overflow-hidden bg-gradient-to-br from-white via-primary-50/40 to-primary-100/50 min-h-[calc(100vh-200px)]">
        {/* Background ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/4 right-1/4 w-[28rem] h-[28rem] bg-primary-200/30 rounded-full blur-3xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-64 h-64 bg-secondary-100/30 rounded-full blur-3xl"
            animate={{ scale: [1.1, 1, 1.1] }}
            transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
          />
          <div className="absolute top-40 left-1/3 w-3 h-3 rounded-full bg-primary-500 opacity-40" />
          <div className="absolute bottom-32 left-1/4 w-4 h-4 rounded-full bg-secondary-400 opacity-40" />
        </div>

        {/* Content grid */}
        <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 p-8 md:p-12 xl:p-20 items-center">
          {/* LEFT: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            {/* Category badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold tracking-wide text-primary-600 bg-white border border-primary-200 rounded-full shadow-soft">
                発注者目線のシステム開発会社
              </span>
            </motion.div>

            {/* H1 */}
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-semibold leading-tight text-navy-950 mb-6">
              <span className="text-primary-500">爆速</span>のPoCで、
              <br />
              動くプロトタイプを。
            </h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-neutral-700 leading-relaxed mb-10 md:mb-12 max-w-2xl"
            >
              AI・Web・モバイルの開発を、
              <br className="hidden md:block" />
              初期費用<span className="font-bold text-navy-950">0円</span>・最短
              <span className="font-bold text-navy-950">数日</span>のプロトタイプから始めましょう。
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                href="/prooffirst"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-primary-500 rounded-full hover:bg-primary-600 transition-all shadow-soft hover:shadow-medium"
              >
                ゼロスタートを試す
                <motion.div animate={{ x: isHovered ? 5 : 0 }} transition={{ duration: 0.2 }}>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.div>
              </a>
              <a
                href="#process"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-500 bg-white border-2 border-primary-500 rounded-full hover:bg-primary-50 transition-all"
              >
                開発の流れを見る
              </a>
            </motion.div>
          </motion.div>

          {/* RIGHT: Abstract geometric graphic (lg+ only) */}
          <div className="hidden lg:block relative aspect-square min-h-[420px]">
            {/* Main diamond — rotated rounded square with layered gradients */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 35 }}
              animate={{ opacity: 1, scale: 1, rotate: 45 }}
              transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative w-64 h-64 xl:w-80 xl:h-80">
                {/* Drop shadow */}
                <div className="absolute inset-0 bg-primary-900/25 rounded-3xl translate-y-10 blur-2xl scale-95" />
                {/* Main body (purple gradient) */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-200 via-primary-400 to-primary-700 shadow-2xl" />
                {/* Top-left white highlight (glass effect) */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/55 via-white/0 to-transparent" />
                {/* Inner sheen */}
                <div className="absolute inset-6 rounded-2xl bg-gradient-to-tl from-white/20 via-transparent to-white/30 opacity-70" />
                {/* Edge highlight ring */}
                <div className="absolute inset-0 rounded-3xl ring-1 ring-white/40" />
              </div>
            </motion.div>

            {/* Cone (top-left) */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute top-2 left-4 xl:top-0 xl:left-0"
            >
              <div className="relative w-20 h-28 xl:w-24 xl:h-32">
                <div className="absolute inset-0 bg-primary-900/20 blur-xl translate-y-3" />
                <div
                  className="absolute inset-0 bg-gradient-to-b from-primary-200 via-primary-400 to-primary-600 shadow-xl"
                  style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
                />
                <div
                  className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent"
                  style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
                />
              </div>
            </motion.div>

            {/* Sphere (bottom-right) */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
              className="absolute bottom-2 right-2 xl:bottom-6 xl:right-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary-900/30 rounded-full blur-xl translate-y-3" />
                <div
                  className="relative w-20 h-20 xl:w-24 xl:h-24 rounded-full shadow-xl"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 25%, #ffffff 0%, #e0e3f6 25%, #a2abe4 60%, #3D4DB7 95%)',
                  }}
                />
              </div>
            </motion.div>

            {/* Small accent cube (top-right) */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="absolute top-8 right-4 xl:top-12 xl:right-12"
            >
              <div className="w-10 h-10 xl:w-14 xl:h-14 rounded-xl bg-gradient-to-br from-secondary-200 to-secondary-500 rotate-12 shadow-lg" />
            </motion.div>

            {/* Floating yellow dot (bottom-left) */}
            <motion.div
              animate={{ y: [-8, 8] }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
              className="absolute bottom-16 left-8 w-5 h-5 xl:w-6 xl:h-6 rounded-full bg-gradient-to-br from-highlight-300 to-highlight-500 shadow-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
