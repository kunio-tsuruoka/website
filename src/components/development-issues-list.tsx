import { useState } from 'react';
import { developmentIssues } from '../data/development-issues';

const categoryColors = {
  プロジェクト管理: 'bg-blue-100 text-blue-800',
  技術的課題: 'bg-primary-100 text-primary-700',
  組織・プロセス: 'bg-green-100 text-green-800',
  品質・保守: 'bg-orange-100 text-orange-800',
};

export const DevelopmentIssuesList = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const categories = [
    'all',
    ...Array.from(new Set(developmentIssues.map((issue) => issue.category))),
  ];

  const filteredIssues =
    selectedCategory === 'all'
      ? developmentIssues
      : developmentIssues.filter((issue) => issue.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* カテゴリーフィルター */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'すべて' : category}
            </button>
          ))}
        </div>
      </div>

      {/* ケーススタディカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              {/* カテゴリーバッジ */}
              <div className="mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${categoryColors[issue.category]}`}
                >
                  {issue.category}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{issue.title}</h3>

              <p className="text-gray-600 mb-4 line-clamp-3">{issue.description}</p>

              <a
                href={`/development-issues/${issue.id}`}
                className="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium"
              >
                詳細を見る
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
