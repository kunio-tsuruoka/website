// src/components/member-card.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface MemberCardProps {
  name: string;
  position: string;
  description: string;
  index?: number;
}

const MemberCard: React.FC<MemberCardProps> = ({
  name,
  position,
  description,
  index = 0,
}) => {
  // 説明文に改行があれば段落に分割
  const paragraphs = description.split('\n').filter((p) => p.trim() !== '');

  // ポジションに基づいた色のマッピング
  const getGradientByPosition = (pos: string) => {
    if (pos.includes('CEO') || pos.includes('代表')) return 'from-indigo-600 to-purple-600';
    if (pos.includes('デザイン')) return 'from-purple-600 to-pink-600';
    if (pos.includes('エンジニア')) return 'from-blue-600 to-indigo-600';
    if (pos.includes('ディレクター')) return 'from-pink-600 to-purple-600';
    return 'from-indigo-600 to-blue-600';
  };

  const gradient = getGradientByPosition(position);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      {/* 背景のグラデーション効果 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
      
      {/* カード本体 */}
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
        {/* 上部のアクセントライン */}
        <div className={`h-1 bg-gradient-to-r ${gradient}`} />
        
        <div className="p-8">
          {/* ヘッダー部分 */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
            <p className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${gradient} text-white`}>
              {position}
            </p>
          </div>

          {/* 説明文 */}
          <div className="space-y-4">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, idx) => {
                // 【】で囲まれたセクションタイトルを検出してスタイル付け
                if (paragraph.startsWith('【') && paragraph.includes('】')) {
                  const titleEndIndex = paragraph.indexOf('】') + 1;
                  const title = paragraph.substring(0, titleEndIndex);
                  const content = paragraph.substring(titleEndIndex);

                  return (
                    <div key={idx} className="border-l-2 border-gray-200 pl-4 group-hover:border-indigo-400 transition-colors">
                      <p className="text-gray-700">
                        <span className={`font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                          {title}
                        </span>
                        {content}
                      </p>
                    </div>
                  );
                }
                return (
                  <p key={idx} className="text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                );
              })
            ) : (
              <p className="text-gray-700 leading-relaxed">{description}</p>
            )}
          </div>

          {/* 装飾的な要素 */}
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-5">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MemberCard;