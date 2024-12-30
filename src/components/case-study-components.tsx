---
import { Header } from '../components/header';
// src/pages/case-studies.astro
import Layout from '../layouts/layout.astro';

const cases = [
  {
    title: 'ECサイトの売上130%達成',
    industry: 'アパレル EC',
    scale: '年商10億円規模',
    period: '3ヶ月',
    challenge: {
      points: [
        '在庫管理の非効率性',
        '顧客データの活用不足',
        '季節商品の在庫回転率低下'
      ]
    },
    solution: {
      points: [
        '在庫管理システムの自動化',
        'リアルタイムな売上/在庫分析',
        'データ分析基盤の構築'
      ]
    },
    results: [
      { label: '売上', value: '130%達成' },
      { label: '在庫回転率', value: '40%改善' },
      { label: '運用コスト', value: '50%削減' }
    ]
  },
  {
    title: 'SaaSスタートアップの成長支援',
    industry: 'HR Tech',
    scale: '従業員20名規模',
    period: '6ヶ月',
    challenge: {
      points: [
        'マッチング精度の低下',
        'システムの拡張性の限界',
        '運用コストの増加'
      ]
    },
    solution: {
      points: [
        'AIマッチングエンジンの開発',
        'クラウドインフラの最適化',
        '運用プロセスの自動化'
      ]
    },
    results: [
      { label: 'マッチング精度', value: '85%向上' },
      { label: '運用効率', value: '70%改善' },
      { label: '月間取引数', value: '3倍増' }
    ]
  }
];
---

<Layout title="導入事例 | Beekle">
  <Header client:load />
  <main class="pt-20">
    <!-- Hero Section -->
    <section class="text-center py-16 px-4">
      <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
        導入事例
      </h1>
      <p class="mx-auto mt-4 max-w-3xl text-xl text-gray-500">
        お客様の課題解決と事業成長をサポートした実績をご紹介します
      </p>
    </section>

    <!-- Case Studies -->
    <section class="max-w-7xl mx-auto px-4 py-16">
      <div class="space-y-24">
        {cases.map((case_study) => (
          <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div class="p-8">
              <!-- Header -->
              <div class="mb-8">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">
                  {case_study.title}
                </h2>
                <div class="flex flex-wrap gap-4">
                  <span class="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {case_study.industry}
                  </span>
                  <span class="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {case_study.scale}
                  </span>
                  <span class="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    開発期間：{case_study.period}
                  </span>
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-12">
                <!-- 課題 -->
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-4">課題</h3>
                  <ul class="space-y-3">
                    {case_study.challenge.points.map((point) => (
                      <li class="flex items-start">
                        <span class="flex-shrink-0 h-6 w-6 text-indigo-500">
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path 
                              stroke-linecap="round" 
                              stroke-linejoin="round" 
                              stroke-width="2" 
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                        <span class="ml-3 text-gray-600">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <!-- 解決策 -->
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-4">解決策</h3>
                  <ul class="space-y-3">
                    {case_study.solution.points.map((point) => (
                      <li class="flex items-start">
                        <span class="flex-shrink-0 h-6 w-6 text-green-500">
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path 
                              stroke-linecap="round" 
                              stroke-linejoin="round" 
                              stroke-width="2" 
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                        <span class="ml-3 text-gray-600">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <!-- 導入効果 -->
              <div class="mt-12 pt-8 border-t">
                <h3 class="text-xl font-bold text-gray-900 mb-6">導入効果</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {case_study.results.map((result) => (
                    <div class="bg-gray-50 rounded-lg p-6 text-center">
                      <div class="text-3xl font-bold text-indigo-600">
                        {result.value}
                      </div>
                      <div class="mt-2 text-gray-600">{result.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <!-- CTA Section -->
      <div class="mt-24 text-center">
        <div class="space-y-4">
          <h2 class="text-3xl font-bold text-gray-900">
            お客様の事業成長をサポートします
          </h2>
          <p class="text-xl text-gray-600">
            まずは無料相談からお気軽にお問い合わせください
          </p>
          <div class="mt-8">
            <a
              href="/contact"
              class="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors"
            >
              無料相談を予約する
              <svg 
                class="w-5 h-5 ml-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M14 5l7 7m0 0l-7 7m7-7H3" 
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  </main>
</Layout>