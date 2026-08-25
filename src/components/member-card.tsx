import { motion } from 'framer-motion';
// src/components/member-card.tsx
import type React from 'react';

interface MemberCardProps {
  name: string;
  position: string;
  description: string;
  index?: number;
  anchorId?: string;
}

const MemberCard: React.FC<MemberCardProps> = ({
  name,
  position,
  description,
  index = 0,
  anchorId,
}) => {
  // 説明文に改行があれば段落に分割
  const paragraphs = description.split('\n').filter((p) => p.trim() !== '');

  const getAccentByPosition = (pos: string) => {
    if (pos.includes('デザイン')) return 'border-secondary-500 text-secondary-700';
    return 'border-primary-500 text-primary-700';
  };

  const accentClass = getAccentByPosition(position);

  return (
    <motion.div
      id={anchorId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative scroll-mt-24"
    >
      <div className="relative overflow-hidden rounded-lg border border-neutral-200 bg-white transition-colors duration-300 hover:border-primary-300 break-words">
        <div className="h-1 bg-primary-500" />

        <div className="p-8">
          {/* ヘッダー部分 */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
            <p
              className={`inline-flex items-center rounded-md border bg-neutral-50 px-3 py-1 text-sm font-semibold ${accentClass}`}
            >
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
                  const content = paragraph.substring(titleEndIndex).trim();

                  // スキル・技術系のセクション: ・区切りをタグ表示
                  const isSkillSection =
                    title.includes('スキル') ||
                    title.includes('フロントエンド') ||
                    title.includes('バックエンド') ||
                    title.includes('インフラ') ||
                    title.includes('開発ツール');
                  const skills = isSkillSection
                    ? content
                        .split(/[・,、]/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : [];

                  if (isSkillSection && skills.length > 0) {
                    return (
                      <div
                        key={idx}
                        className="border-l-2 border-neutral-200 pl-4 transition-colors hover:border-primary-400"
                      >
                        <p className="font-bold text-primary-700 mb-2">{title}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((skill, si) => (
                            <span
                              key={si}
                              className="inline-block px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={idx}
                      className="border-l-2 border-neutral-200 pl-4 transition-colors hover:border-primary-400"
                    >
                      <p className="text-gray-700">
                        <span className="font-bold text-primary-700">{title}</span>
                        {content && ` ${content}`}
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
        </div>
      </div>
    </motion.div>
  );
};

export default MemberCard;
