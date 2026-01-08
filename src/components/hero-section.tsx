import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const HeroSection = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative min-h-[calc(100vh-120px)] lg:mx-12 pt-20">
      {/* Background with Pop Style decorations */}
      <div className="absolute inset-0 bg-white rounded-[48px] overflow-hidden mt-20">
        {/* Pop decoration bars */}
        <div className="absolute -top-10 right-10 w-32 h-96 bg-gradient-to-b from-primary-500 to-primary-300 rounded-full -rotate-[25deg] opacity-10" />
        <div className="absolute top-20 right-32 w-20 h-64 bg-gradient-to-b from-secondary-500 to-secondary-400 rounded-full rotate-[25deg] opacity-10" />
        <div className="absolute -bottom-20 left-20 w-24 h-72 bg-gradient-to-b from-highlight-500 to-highlight-100 rounded-full -rotate-[15deg] opacity-10" />

        {/* Floating shapes with brand colors */}
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 bg-primary-100/40 rounded-full blur-xl"
          animate={{ y: [-20, 20], scale: [1, 1.1] }}
          transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
        />
        <motion.div
          className="absolute bottom-40 left-40 w-48 h-48 bg-secondary-50/50 rounded-full blur-xl"
          animate={{ y: [20, -20], scale: [1.1, 1] }}
          transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
        />

        {/* Pop dots */}
        <div className="absolute top-40 left-24 w-4 h-4 rounded-full bg-secondary-500 opacity-40" />
        <div className="absolute top-60 left-16 w-6 h-6 rounded-full bg-highlight-500 opacity-30" />
        <div className="absolute bottom-32 right-28 w-5 h-5 rounded-full bg-primary-500 opacity-40" />
        <div className="absolute top-28 right-48 w-3 h-3 rounded-full bg-secondary-500 opacity-50" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center p-12 xl:p-24 border border-navy-950/10 rounded-[48px] mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-7xl font-semibold leading-tight text-navy-950 mb-8">
            共に創る
            <br />
            次世代システム
          </h1>

          <div className="mb-16 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block font-Poppins text-2xl text-primary-500 border-b-2 border-primary-500/30 pb-2">
                Our Mission
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative grid grid-cols-1 md:grid-cols-[1fr,auto] gap-8 items-center"
            >
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500/30 to-primary-500/0" />
                <p className="pl-6 text-2xl text-neutral-900 leading-relaxed">
                  <span className="relative inline-block">
                    未来から逆算し、
                    <motion.div
                      className="absolute -bottom-1 left-0 h-0.5 bg-primary-500/30"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1, delay: 0.8 }}
                    />
                  </span>
                  <br className="hidden md:block" />
                  <span className="font-medium">今を創る</span>
                </p>
              </div>
            </motion.div>
          </div>

          {/* CTA Button - Primary Beekle Purple */}
          <motion.div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="inline-block"
          >
            <a
              href="/prooffirst"
              className="group inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-primary-500 rounded-full hover:bg-primary-600 transition-all shadow-soft hover:shadow-medium"
            >
              依頼の流れをまず確認する
              <motion.div animate={{ x: isHovered ? 5 : 0 }} transition={{ duration: 0.2 }}>
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.div>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
