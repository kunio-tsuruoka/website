import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';

export const HeroSection = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative min-h-[calc(100vh-120px)] lg:mx-12 pt-20">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 bg-white rounded-[48px] overflow-hidden mt-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />

        {/* Floating shapes with lighter colors */}
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 bg-indigo-100/40 rounded-full blur-xl"
          animate={{ y: [-20, 20], scale: [1, 1.1] }}
          transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
        />
        <motion.div
          className="absolute bottom-40 left-40 w-48 h-48 bg-indigo-50/50 rounded-full blur-xl"
          animate={{ y: [20, -20], scale: [1.1, 1] }}
          transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center p-12 xl:p-24 border border-indigo-700/20 rounded-[48px] mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-7xl font-semibold leading-tight text-indigo-700 mb-8">
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
              <span className="inline-block font-Poppins text-2xl text-indigo-600 border-b-2 border-indigo-600/30 pb-2">
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
                {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-600/20 to-indigo-600/0"></div>
                <p className="pl-6 text-2xl text-indigo-900 leading-relaxed">
                  <span className="font-medium">お客様のビジョン</span>を形にし、
                  <br className="hidden md:block" />
                  <span className="relative inline-block">
                    成長を加速する
                    <motion.div
                      className="absolute -bottom-1 left-0 h-0.5 bg-indigo-600/20"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1, delay: 0.8 }}
                    />
                  </span>
                  パートナーとして。
                </p>
              </div>
            </motion.div>
          </div>

          {/* CTA Button */}
          <motion.div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="inline-block"
          >
            <a
              href="/prooffirst"
              className="group inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
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
