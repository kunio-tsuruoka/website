import { ChartBar, TrendingUp, Users } from 'lucide-react';
import React from 'react';

const caseStudies = [
  {
    id: 'ec-cosmetics',
    title: '化粧品ECサイトのデータ活用改善',
    industry: 'EC（化粧品）',
    companySize: '従業員50名規模',
    challenge: {
      title: '課題',
      points: [
        'カスタマージャーニーの把握が不完全',
        '顧客セグメント別の施策展開ができていない',
        'マーケティング施策の効果測定が不十分',
      ],
    },
    solution: {
      title: '導入したソリューション',
      points: [
        'GA4とECサイトDBの統合基盤構築',
        'BIダッシュボードによる可視化',
        'セグメント別の自動施策実行基盤',
      ],
    },
    results: [
      {
        metric: 'LTV',
        value: '30%向上',
        icon: ChartBar,
      },
      {
        metric: 'マーケティング効率',
        value: '40%改善',
        icon: TrendingUp,
      },
      {
        metric: 'リピート率',
        value: '25%増加',
        icon: Users,
      },
    ],
    testimonial: {
      quote:
        'データに基づいた意思決定が可能になり、より効果的なマーケティング施策を実現できるようになりました。',
      author: 'マーケティング部長',
      company: 'A社',
    },
    timeline: {
      total: '3ヶ月',
      phases: [
        {
          name: '要件定義',
          duration: '2週間',
        },
        {
          name: 'データ統合基盤構築',
          duration: '1.5ヶ月',
        },
        {
          name: 'ダッシュボード構築',
          duration: '2週間',
        },
        {
          name: '運用体制確立',
          duration: '2週間',
        },
      ],
    },
  },
  {
    id: 'saas-startup',
    title: 'SaaSスタートアップの成長支援',
    industry: 'SaaS',
    companySize: '従業員30名規模',
    challenge: {
      title: '課題',
      points: [
        '解約率の上昇傾向',
        '顧客の利用状況の把握が困難',
        'クロスセル機会の特定ができていない',
      ],
    },
    solution: {
      title: '導入したソリューション',
      points: [
        'プロダクトデータとGA4の統合',
        '利用状況モニタリングダッシュボード',
        '解約予兆検知システム',
      ],
    },
    results: [
      {
        metric: '解約率',
        value: '15%改善',
        icon: TrendingUp,
      },
      {
        metric: '顧客単価',
        value: '25%向上',
        icon: ChartBar,
      },
      {
        metric: 'アップセル率',
        value: '35%向上',
        icon: Users,
      },
    ],
    testimonial: {
      quote: '顧客の行動を詳細に把握できるようになり、タイムリーなフォローが可能になりました。',
      author: 'プロダクトマネージャー',
      company: 'B社',
    },
    timeline: {
      total: '2.5ヶ月',
      phases: [
        {
          name: '要件定義',
          duration: '2週間',
        },
        {
          name: 'データ統合基盤構築',
          duration: '1ヶ月',
        },
        {
          name: '予兆検知システム構築',
          duration: '2週間',
        },
        {
          name: '運用体制確立',
          duration: '2週間',
        },
      ],
    },
  },
];

export const CaseHero = () => {
  return (
    <div className="bg-white px-4 pt-16 pb-8 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          導入事例
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-xl text-gray-500">
          実際の導入企業様での成果をご紹介します。業界や規模に応じた、
          データ活用の具体的な取り組みをご覧いただけます。
        </p>
      </div>
    </div>
  );
};

export const CaseStudyList = () => {
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {caseStudies.map((caseStudy, idx) => (
            <div key={caseStudy.id} className={`${idx !== 0 ? 'border-t pt-16' : ''}`}>
              <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                <div className="lg:col-span-5">
                  <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                    {caseStudy.title}
                  </h2>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-500">業界：{caseStudy.industry}</p>
                    <p className="text-sm text-gray-500">規模：{caseStudy.companySize}</p>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      {caseStudy.challenge.title}
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {caseStudy.challenge.points.map((point, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="flex-shrink-0 h-5 w-5 text-indigo-500">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </span>
                          <span className="ml-2 text-gray-500">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 lg:mt-0 lg:col-span-7">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {caseStudy.solution.title}
                      </h3>
                      <ul className="mt-2 space-y-2">
                        {caseStudy.solution.points.map((point, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="flex-shrink-0 h-5 w-5 text-green-500">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </span>
                            <span className="ml-2 text-gray-500">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900">導入効果</h3>
                      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {caseStudy.results.map((result, idx) => (
                          <div
                            key={idx}
                            className="relative bg-white p-6 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center">
                              <result.icon className="h-6 w-6 text-indigo-600" />
                              <dt className="ml-2 text-sm font-medium text-gray-500">
                                {result.metric}
                              </dt>
                            </div>
                            <dd className="mt-1 text-2xl font-semibold text-indigo-600">
                              {result.value}
                            </dd>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900">導入の流れ</h3>
                      <div className="mt-2">
                        <div className="text-sm text-gray-500">
                          全体期間：{caseStudy.timeline.total}
                        </div>
                        <div className="mt-2 space-y-2">
                          {caseStudy.timeline.phases.map((phase, idx) => (
                            <div key={idx} className="flex items-center text-sm">
                              <div className="w-24 flex-shrink-0 text-gray-500">{phase.name}</div>
                              <div className="ml-2 text-gray-400">{phase.duration}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="relative bg-gray-50 p-6 rounded-lg">
                      <blockquote>
                        <p className="text-gray-600 italic">{caseStudy.testimonial.quote}</p>
                        <footer className="mt-2">
                          <p className="text-sm text-gray-500">
                            {caseStudy.testimonial.author} / {caseStudy.testimonial.company}
                          </p>
                        </footer>
                      </blockquote>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
