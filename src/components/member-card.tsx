// src/components/member-card.tsx
import React from 'react';

interface MemberCardProps {
  name: string;
  position: string;
  description: string;
  imageUrl?: string; // オプショナル
}

const MemberCard: React.FC<MemberCardProps> = ({
  name,
  position,
  description,
  imageUrl, // 使用しない
}) => {
  // 説明文に改行があれば段落に分割
  const paragraphs = description.split('\n').filter((p) => p.trim() !== '');

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 p-2">
      <div className="p-6">
        <h3 className="text-2xl font-bold text-indigo-800 mb-2">{name}</h3>
        <p className="text-indigo-600 font-medium text-lg mb-5">{position}</p>

        {paragraphs.length > 0 ? (
          <div className="text-gray-700">
            {paragraphs.map((paragraph, index) => {
              // 【】で囲まれたセクションタイトルを検出してスタイル付け
              if (paragraph.startsWith('【') && paragraph.includes('】')) {
                const titleEndIndex = paragraph.indexOf('】') + 1;
                const title = paragraph.substring(0, titleEndIndex);
                const content = paragraph.substring(titleEndIndex);

                return (
                  <p key={index} className="mb-3">
                    <span className="font-bold text-indigo-700">{title}</span>
                    {content}
                  </p>
                );
              }
              return (
                <p key={index} className="mb-3">
                  {paragraph}
                </p>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-700">{description}</p>
        )}
      </div>
    </div>
  );
};

export default MemberCard;
