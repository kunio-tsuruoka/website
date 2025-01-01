import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

const caseStudies = [
  {
    id: 'ec-cosmetics',
    title: '化粧品ECサイトのデータ活用による成長事例',
    company: '化粧品EC A社',
    industry: '化粧品・EC',
    challenge: {
      title: '課題',
      points: [
        'データが分散しており、顧客の全体像が把握できない',
        'マーケティング施策の効果測定が不十分',
        'リピート購入率の低下',
      ],
    },
    solution: {
      title: '導入したソリューション',
      points: [
        'GA4とDBデータの統合基盤構築',
        'RFM分析に基づく顧客セグメント設計',
        'セグメント別の最適化施策実施',
      ],
    },
    results: [
      {
        metric: 'LTV',
        improvement: '30%向上',
        detail: '優良顧客の特定と最適なアプローチによりLTVが向上',
      },
      {
        metric: 'マーケティング効率',
        improvement: '40%改善',
        detail: 'セグメント別の施策最適化により、投資効率が大幅改善',
      },
      {
        metric: 'リピート率',
        improvement: '25%増加',
        detail: '顧客理解に基づく施策により、継続率が向上',
      },
    ],
    timeline: '導入期間：3ヶ月',
    testimonial: {
      quote: 'データに基づく意思決定が可能になり、マーケティング施策の精度が大きく向上しました。',
      author: 'マーケティング部長',
    },
  },
  {
    id: 'saas-startup',
    title: 'SaaSスタートアップの成長加速事例',
    company: 'サブスクサービス B社',
    industry: 'SaaS・スタートアップ',
    challenge: {
      title: '課題',
      points: ['解約率の上昇傾向', '顧客獲得コストの高騰', 'プロダクト改善の方向性が不明確'],
    },
    solution: {
      title: '導入したソリューション',
      points: [
        '行動データと契約データの統合',
        '解約予兆スコアの開発',
        'カスタマーサクセス施策の最適化',
      ],
    },
    results: [
      {
        metric: '売上',
        improvement: '20%増加',
        detail: '的確な解約防止施策により、既存顧客の維持率が向上',
      },
      {
        metric: '解約率',
        improvement: '15%改善',
        detail: '早期の解約予兆検知と対応により、解約率が低下',
      },
      {
        metric: '顧客単価',
        improvement: '25%向上',
        detail: 'アップセル機会の最適化により、単価が上昇',
      },
    ],
    timeline: '導入期間：2ヶ月',
    testimonial: {
      quote:
        'データドリブンな意思決定により、プロダクトと顧客対応の両面で大きな改善が実現できました。',
      author: '事業責任者',
    },
  },
];

export const CaseStudyList = () => {
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">CDP導入事例</h1>
          <p className="text-xl text-gray-600">実際の導入企業様の課題解決事例をご紹介します</p>
        </div>

        <div className="space-y-12">
          {caseStudies.map((study) => (
            <Card key={study.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {study.title}
                    </CardTitle>
                    <p className="mt-2 text-sm text-gray-600">
                      {study.company} | {study.industry}
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {study.timeline}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">{study.challenge.title}</h3>
                    <ul className="space-y-2">
                      {study.challenge.points.map((point) => (
                        <li key={point} className="flex items-start">
                          <span className="flex-shrink-0 h-5 w-5 text-red-500">⚠</span>
                          <span className="ml-2">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">{study.solution.title}</h3>
                    <ul className="space-y-2">
                      {study.solution.points.map((point) => (
                        <li key={point} className="flex items-start">
                          <span className="flex-shrink-0 h-5 w-5 text-green-500">✓</span>
                          <span className="ml-2">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">導入効果</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {study.results.map((result) => (
                      <div key={result.detail} className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{result.improvement}</div>
                        <div className="text-sm font-medium text-gray-900">{result.metric}</div>
                        <div className="mt-1 text-sm text-gray-500">{result.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                  <blockquote className="text-gray-700 italic">
                    "{study.testimonial.quote}"
                  </blockquote>
                  <p className="mt-2 text-sm text-gray-600">- {study.testimonial.author}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
