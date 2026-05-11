import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

function RightVisual() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[58%] lg:block">
      <svg
        viewBox="0 0 760 720"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <title>Hero decorative visual</title>
        <defs>
          <linearGradient id="shapeA" x1="120" y1="80" x2="620" y2="620">
            <stop stopColor="#8ea2ff" stopOpacity="0.28" />
            <stop offset="0.55" stopColor="#b7ecff" stopOpacity="0.24" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="shapeB" x1="600" y1="40" x2="220" y2="640">
            <stop stopColor="#8d7cff" stopOpacity="0.22" />
            <stop offset="1" stopColor="#67d8f3" stopOpacity="0.24" />
          </linearGradient>

          <radialGradient id="orb" cx="35%" cy="30%" r="70%">
            <stop stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.42" stopColor="#bfdcff" stopOpacity="0.72" />
            <stop offset="0.78" stopColor="#5445e8" stopOpacity="0.5" />
            <stop offset="1" stopColor="#172554" stopOpacity="0.16" />
          </radialGradient>

          <filter id="blurSoft">
            <feGaussianBlur stdDeviation="18" />
          </filter>

          <filter id="shadowOrb" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow
              dx="0"
              dy="18"
              stdDeviation="18"
              floodColor="#4557d8"
              floodOpacity="0.25"
            />
          </filter>
        </defs>

        {/* large pale circular glow */}
        <circle cx="250" cy="390" r="210" fill="#dff5ff" opacity="0.38" />

        {/* abstract brand-like ribbons */}
        <rect
          x="418"
          y="-60"
          width="220"
          height="650"
          rx="110"
          fill="url(#shapeA)"
          transform="rotate(-25 520 280)"
        />

        <rect
          x="440"
          y="140"
          width="160"
          height="520"
          rx="80"
          fill="url(#shapeB)"
          transform="rotate(32 520 400)"
        />

        <path
          d="M420 65 C510 210 590 330 705 505"
          fill="none"
          stroke="#6d7cff"
          strokeOpacity="0.32"
          strokeWidth="2"
        />

        <path
          d="M150 670 C330 560 460 475 705 408"
          fill="none"
          stroke="white"
          strokeOpacity="0.9"
          strokeWidth="2"
        />

        {/* dotted texture */}
        <g opacity="0.38">
          {Array.from({ length: 9 }).map((_, row) =>
            Array.from({ length: 9 }).map((_, col) => (
              <circle
                key={`${row}-${col}`}
                cx={330 + col * 18}
                cy={220 + row * 18}
                r="1.5"
                fill="white"
              />
            ))
          )}
        </g>

        {/* light flare */}
        <circle cx="660" cy="220" r="48" fill="#ffffff" opacity="0.45" filter="url(#blurSoft)" />

        {/* glass orb */}
        <circle cx="385" cy="560" r="48" fill="url(#orb)" filter="url(#shadowOrb)" />
        <circle cx="370" cy="540" r="20" fill="white" opacity="0.55" />

        {/* small accents */}
        <circle cx="265" cy="230" r="8" fill="#3cccd2" opacity="0.75" />
        <circle cx="625" cy="610" r="13" fill="#7278df" opacity="0.55" />
      </svg>
    </div>
  );
}

export const HeroSection = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative min-h-[calc(100vh-120px)] lg:mx-12 pt-20">
      <div className="relative mt-20 rounded-[48px] border border-navy-950/10 overflow-hidden bg-gradient-to-br from-white via-primary-50/40 to-primary-100/50 min-h-[calc(100vh-200px)]">
        {/* Right-side abstract SVG visual */}
        <RightVisual />

        {/* Content (left-aligned, sits over SVG via z-index) */}
        <div className="relative z-10 p-8 md:p-12 xl:p-20 flex flex-col justify-center min-h-[inherit]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
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
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
